

import {
  MessageSquareIcon,
  SearchIcon,
  SendIcon,
  MoreVerticalIcon,
  PhoneIcon,
  VideoIcon,
  PhoneOffIcon,
  MicIcon,
  MicOffIcon,
  CameraIcon,
  CameraOffIcon,
  UsersIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import EmojiPicker from "emoji-picker-react";

import { io } from "socket.io-client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import useAuthUser from "../hooks/useAuthUser";

import {
  getUserFriends,
  getMessages,
  sendMessage,
} from "../lib/api";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

const ChatPage = ({ theme = "dark" }) => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { authUser } = useAuthUser();

  const queryClient = useQueryClient();

  const [selectedFriend, setSelectedFriend] = useState(null);

  const [text, setText] = useState("");

  const [search, setSearch] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ================= CALL STATE =================

  const [callType, setCallType] = useState(null);

  const [isCalling, setIsCalling] = useState(false);

  const [isReceivingCall, setIsReceivingCall] = useState(false);

  const [isCallConnected, setIsCallConnected] = useState(false);

  const [callerId, setCallerId] = useState(null);

  const [callerSignal, setCallerSignal] = useState(null);

  const [messageNotification, setMessageNotification] = useState(null);

  const [isMuted, setIsMuted] = useState(false);

  const [cameraEnabled, setCameraEnabled] = useState(true);

  // ================= REFS =================

  const isAtBottomRef = useRef(true);

  const socketRef = useRef(null);

  const messagesContainerRef = useRef(null);

  const peerRef = useRef(null);

  const localStreamRef = useRef(null);

  const remoteStreamRef = useRef(null);

  const localVideoRef = useRef(null);

  const remoteVideoRef = useRef(null);

  const iceCandidatesRef = useRef([]);

  const callUserIdRef = useRef(null);

  const selectedFriendRef = useRef(null);

  const notificationTimeoutRef = useRef(null);

  // ================= SELECTED FRIEND REF =================

  useEffect(() => {
    selectedFriendRef.current = selectedFriend;
  }, [selectedFriend]);

  // ================= ДРУЗЬЯ =================

  const {
    data: friendsData,
    isLoading: friendsLoading,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const friends = Array.isArray(friendsData)
    ? friendsData
    : friendsData?.friends || [];

  // ================= ДРУГ ИЗ URL =================

  useEffect(() => {
    if (!userId || friends.length === 0) return;

    const friendFromUrl = friends.find(
      (friend) => friend._id === userId
    );

    if (friendFromUrl) {
      setSelectedFriend(friendFromUrl);
      setShowEmojiPicker(false);
      isAtBottomRef.current = true;
    }
  }, [userId, friendsData]);

  // ================= СООБЩЕНИЯ =================

  const {
    data: messagesData,
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ["messages", selectedFriend?._id],

    queryFn: () => getMessages(selectedFriend._id),

    enabled: !!selectedFriend,
  });

  const messages = messagesData?.messages || [];

  // ================= SCROLL =================

  const scrollToBottom = (behavior = "auto") => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;

        if (!container) return;

        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      });
    });
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    isAtBottomRef.current = distanceFromBottom < 100;
  };

  // ================= AUTO SCROLL =================

  useEffect(() => {
    if (!selectedFriend?._id) return;

    if (isAtBottomRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages, selectedFriend?._id]);

  // ================= OPEN CHAT =================

  useEffect(() => {
    if (!selectedFriend?._id) return;

    isAtBottomRef.current = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;

        if (!container) return;

        container.scrollTop = container.scrollHeight;
      });
    });
  }, [selectedFriend?._id]);

  // ================= ОТПРАВКА =================

  const {
    mutate: sendMessageMutation,
    isPending,
  } = useMutation({
    mutationFn: () =>
      sendMessage(
        selectedFriend._id,
        text
      ),

    onSuccess: () => {
      setText("");

      setShowEmojiPicker(false);

      isAtBottomRef.current = true;

      queryClient.invalidateQueries({
        queryKey: [
          "messages",
          selectedFriend._id,
        ],
      });

      scrollToBottom("smooth");
    },

    onError: (error) => {
      console.error(
        "Ошибка отправки сообщения:",
        error.response?.data || error.message
      );
    },
  });

  // ================= ПОИСК =================

  const filteredFriends = friends.filter((friend) =>
    friend.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ================= EMOJI =================

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // ================= FLUSH ICE =================

  const flushIceCandidates = async () => {
    if (
      !peerRef.current ||
      !peerRef.current.remoteDescription
    ) {
      return;
    }

    const candidates = iceCandidatesRef.current;

    iceCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error(
          "Ошибка добавления ICE:",
          error
        );
      }
    }
  };

  // ================= CREATE PEER =================

  const createPeer = (friendId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peer.onicecandidate = (event) => {
      if (
        event.candidate &&
        socketRef.current
      ) {
        socketRef.current.emit(
          "ice-candidate",
          {
            to: friendId,
            candidate: event.candidate,
          }
        );
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] =
        event.streams;

      if (!remoteStream) return;

      remoteStreamRef.current =
        remoteStream;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          remoteStream;
      }
    };

    peer.onconnectionstatechange = () => {
      console.log(
        "📡 WebRTC:",
        peer.connectionState
      );

      if (
        peer.connectionState ===
        "connected"
      ) {
        setIsCalling(false);

        setIsCallConnected(true);
      }

      if (
        peer.connectionState ===
        "failed"
      ) {
        endCall(false);
      }
    };

    peerRef.current = peer;

    return peer;
  };

  // ================= GET MEDIA =================

  const getMedia = async (type) => {
    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
          video: type === "video",
        }
      );

    localStreamRef.current =
      stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        stream;
    }

    stream.getTracks().forEach(
      (track) => {
        if (peerRef.current) {
          peerRef.current.addTrack(
            track,
            stream
          );
        }
      }
    );

    return stream;
  };

  // ================= START CALL =================

  const startCall = async (type) => {
    if (
      !selectedFriend ||
      !authUser?._id ||
      isCalling ||
      isCallConnected
    ) {
      return;
    }

    try {
      setCallType(type);

      setIsCalling(true);

      setIsCallConnected(false);

      setIsReceivingCall(false);

      callUserIdRef.current =
        selectedFriend._id;

      iceCandidatesRef.current = [];

      const peer = createPeer(
        selectedFriend._id
      );

      await getMedia(type);

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer
      );

      socketRef.current?.emit(
        "call-user",
        {
          userToCall:
            selectedFriend._id,

          signal: offer,

          callType: type,
        }
      );

      console.log(
        "📞 Звонок отправлен"
      );
    } catch (error) {
      console.error(
        "Ошибка звонка:",
        error
      );

      endCall(false);
    }
  };

  // ================= ACCEPT CALL =================

  const acceptCall = async () => {
    if (
      !callerId ||
      !callerSignal
    ) {
      return;
    }

    try {
      setIsReceivingCall(false);

      setIsCalling(false);

      setIsCallConnected(false);

      callUserIdRef.current =
        callerId;

      iceCandidatesRef.current = [];

      const peer =
        createPeer(callerId);

      await getMedia(callType);

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          callerSignal
        )
      );

      await flushIceCandidates();

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      socketRef.current?.emit(
        "answer-call",
        {
          to: callerId,
          signal: answer,
        }
      );

      setIsCallConnected(true);

      console.log(
        "✅ Звонок принят"
      );
    } catch (error) {
      console.error(
        "Ошибка принятия звонка:",
        error
      );

      endCall(false);
    }
  };

  // ================= REJECT =================

  const rejectCall = () => {
    if (callerId) {
      socketRef.current?.emit(
        "reject-call",
        {
          to: callerId,
        }
      );
    }

    setIsReceivingCall(false);

    setCallerId(null);

    setCallerSignal(null);

    setCallType(null);

    callUserIdRef.current = null;

    iceCandidatesRef.current = [];
  };

  // ================= END CALL =================

  const endCall = (notify = true) => {
    const targetUserId =
      callUserIdRef.current;

    if (
      notify &&
      targetUserId
    ) {
      socketRef.current?.emit(
        "end-call",
        {
          to: targetUserId,
        }
      );
    }

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    if (peerRef.current) {
      peerRef.current.close();
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject =
        null;
    }

    localStreamRef.current = null;

    remoteStreamRef.current = null;

    peerRef.current = null;

    iceCandidatesRef.current = [];

    callUserIdRef.current = null;

    setIsCalling(false);

    setIsCallConnected(false);

    setIsReceivingCall(false);

    setCallerId(null);

    setCallerSignal(null);

    setCallType(null);

    setIsMuted(false);

    setCameraEnabled(true);
  };

  // ================= SOCKET =================

  useEffect(() => {
    if (!authUser?._id) return;

    const SOCKET_URL =
      import.meta.env.VITE_BACKEND_URL ||
      "http://localhost:5001";

    const socket = io(
      SOCKET_URL,
      {
        withCredentials: true,
      }
    );

    socketRef.current = socket;

    console.log(
      "🔌 Подключение к Socket.IO..."
    );

    // ================= CONNECT =================

    socket.on("connect", () => {
      console.log(
        "🟢 Socket подключен:",
        socket.id
      );

      socket.emit(
        "user-online",
        authUser._id
      );
    });

    // ================= NEW MESSAGE =================

    socket.on(
      "new-message",
      (newMessage) => {
        const otherUserId =
          newMessage.sender?._id ===
          authUser._id
            ? newMessage.recipient?._id
            : newMessage.sender?._id;

        if (!otherUserId) return;

        queryClient.setQueryData(
          ["messages", otherUserId],
          (oldData) => {
            if (!oldData) {
              return {
                success: true,
                messages: [newMessage],
              };
            }

            const alreadyExists =
              oldData.messages?.some(
                (message) =>
                  message._id ===
                  newMessage._id
              );

            if (alreadyExists) {
              return oldData;
            }

            return {
              ...oldData,

              messages: [
                ...(oldData.messages ||
                  []),

                newMessage,
              ],
            };
          }
        );

        // ================= MESSAGE NOTIFICATION =================

        if (
          newMessage.sender?._id !==
          authUser._id
        ) {
          setMessageNotification({
            name:
              newMessage.sender
                ?.fullName ||
              "Новое сообщение",

            text: newMessage.text,

            profilePic:
              newMessage.sender
                ?.profilePic,
          });

          if (notificationTimeoutRef.current) {
            clearTimeout(
              notificationTimeoutRef.current
            );
          }

          notificationTimeoutRef.current =
            setTimeout(() => {
              setMessageNotification(null);
            }, 3000);
        }

        // ================= AUTO SCROLL =================

        const isCurrentChat =
          selectedFriendRef.current?._id ===
          newMessage.sender?._id;

        if (
          newMessage.sender?._id !==
            authUser._id &&
          isCurrentChat &&
          isAtBottomRef.current
        ) {
          scrollToBottom("smooth");
        }
      }
    );

    // ================= INCOMING CALL =================

    socket.on(
      "incoming-call",
      ({
        signal,
        from,
        callType,
      }) => {
        console.log(
          "📞 Входящий звонок:",
          from
        );

        setCallerId(from);

        setCallerSignal(signal);

        setCallType(callType);

        setIsReceivingCall(true);

        setIsCalling(false);

        setIsCallConnected(false);

        callUserIdRef.current = from;
      }
    );

    // ================= CALL ACCEPTED =================

    socket.on(
      "call-accepted",
      async ({ signal }) => {
        console.log(
          "✅ Звонок принят"
        );

        try {
          setIsCalling(false);

          setIsCallConnected(true);

          if (!peerRef.current) {
            return;
          }

          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(
              signal
            )
          );

          await flushIceCandidates();
        } catch (error) {
          console.error(
            "Ошибка установки ответа:",
            error
          );

          endCall(false);
        }
      }
    );

    // ================= ICE =================

    socket.on(
      "ice-candidate",
      async ({ candidate }) => {
        if (!candidate) return;

        if (
          !peerRef.current ||
          !peerRef.current
            .remoteDescription
        ) {
          iceCandidatesRef.current.push(
            candidate
          );

          return;
        }

        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        } catch (error) {
          console.error(
            "Ошибка ICE:",
            error
          );
        }
      }
    );

    // ================= REJECT =================

    socket.on(
      "call-rejected",
      () => {
        console.log(
          "❌ Звонок отклонён"
        );

        endCall(false);
      }
    );

    // ================= END =================

    socket.on(
      "call-ended",
      () => {
        console.log(
          "📴 Звонок завершён"
        );

        endCall(false);
      }
    );

    // ================= DISCONNECT =================

    socket.on(
      "disconnect",
      () => {
        console.log(
          "🔴 Socket отключен"
        );
      }
    );

    // ================= CLEANUP =================

    return () => {
      socket.disconnect();

      socketRef.current = null;
    };
  }, [
    authUser?._id,
    queryClient,
  ]);

  // ================= NOTIFICATION CLEANUP =================

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(
          notificationTimeoutRef.current
        );
      }
    };
  }, []);

  // ================= MICROPHONE =================

  const toggleMute = () => {
    if (
      !localStreamRef.current
    ) {
      return;
    }

    const audioTrack =
      localStreamRef.current
        .getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled =
      !audioTrack.enabled;

    setIsMuted(
      !audioTrack.enabled
    );
  };

  // ================= CAMERA =================

  const toggleCamera = () => {
    if (
      !localStreamRef.current
    ) {
      return;
    }

    const videoTrack =
      localStreamRef.current
        .getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled =
      !videoTrack.enabled;

    setCameraEnabled(
      videoTrack.enabled
    );
  };

  // ================= ОТПРАВКА =================

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (
      !text.trim() ||
      !selectedFriend ||
      isPending
    ) {
      return;
    }

    isAtBottomRef.current = true;

    sendMessageMutation();
  };

  // ================= RENDER =================

  return (
  <div
    className="
      h-full
      min-h-0
      min-h-[100dvh]
      md:min-h-0
      flex
      bg-base-100
      overflow-hidden
    "
  >
    {/* ================= LEFT CHAT LIST ================= */}

    <aside
      className={`
        ${selectedFriend ? "hidden md:flex" : "flex"}
        w-full
        md:w-[340px]
        shrink-0
        min-h-0
        flex-col
        border-r
        border-base-300
        bg-gradient-to-b
        from-base-200
        to-base-100
      `}
    >
      {/* HEADER */}

      <div
        className="
          shrink-0
          px-5
          pt-5
          pb-4
          border-b
          border-base-300
        "
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="
                text-[22px]
                font-bold
                tracking-tight
                text-base-content
              "
            >
              Чаты
            </h1>

            <p
              className="
                text-xs
                text-base-content/50
                mt-1
              "
            >
              Ваши личные сообщения
            </p>
          </div>

          <div
            className="
              w-11
              h-11
              rounded-2xl
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-cyan-400/15
              via-blue-500/10
              to-indigo-500/10
              border
              border-cyan-400/20
              shadow-lg
              shadow-cyan-500/5
            "
          >
            <MessageSquareIcon
              className="
                w-5
                h-5
                text-cyan-400
              "
            />
          </div>
        </div>

        {/* SEARCH */}

        <div
          className="
            mt-5
            h-11
            flex
            items-center
            gap-3
            px-4
            rounded-2xl
            bg-base-100
            border
            border-base-300
            focus-within:border-cyan-400/35
            focus-within:bg-base-200
            transition-all
          "
        >
          <SearchIcon
            className="
              w-4
              h-4
              text-base-content/30
              shrink-0
            "
          />

          <input
            type="text"
            placeholder="Поиск чатов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              bg-transparent
              outline-none
              text-sm
              text-base-content
              placeholder:text-base-content/30
            "
          />
        </div>
      </div>

      {/* FRIENDS / CHATS */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-3
          py-3
        "
      >
        {friendsLoading && (
          <div
            className="
              h-40
              flex
              items-center
              justify-center
            "
          >
            <span
              className="
                loading
                loading-spinner
                text-cyan-400
              "
            />
          </div>
        )}

        {!friendsLoading &&
          filteredFriends.length === 0 && (
            <div
              className="
                min-h-[300px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-5
              "
            >
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  bg-gradient-to-br
                  from-cyan-400/10
                  to-blue-500/5
                  border
                  border-cyan-400/15
                  mb-5
                "
              >
                <MessageSquareIcon
                  className="
                    w-7
                    h-7
                    text-cyan-400
                  "
                />
              </div>

              <h3
                className="
                  text-base
                  font-semibold
                  text-base-content
                "
              >
                Пока нет чатов
              </h3>

              <p
                className="
                  text-xs
                  text-base-content/50
                  mt-2
                  max-w-[220px]
                  leading-relaxed
                "
              >
                Добавьте друзей и начните общение в uMessage
              </p>

              <button
                type="button"
                onClick={() => navigate("/friends")}
                className="
                  mt-5
                  px-5
                  h-10
                  rounded-xl
                  text-sm
                  font-medium
                  text-base-content
                  bg-gradient-to-r
                  from-cyan-600
                  to-blue-600
                  hover:from-cyan-500
                  hover:to-blue-500
                  shadow-lg
                  shadow-cyan-950/20
                  transition-all
                  hover:-translate-y-0.5
                "
              >
                Найти друзей
              </button>
            </div>
          )}

        {filteredFriends.map((friend) => {
          const isSelected =
            selectedFriend?._id === friend._id;

          return (
            <button
              key={friend._id}
              type="button"
              onClick={() => {
                navigate(`/chat/${friend._id}`);
                setSelectedFriend(friend);
                setShowEmojiPicker(false);
                isAtBottomRef.current = true;
              }}
              className={`
                group
                w-full
                min-h-[72px]
                flex
                items-center
                gap-3
                px-3
                py-2.5
                mb-1
                rounded-2xl
                text-left
                border
                transition-all
                ${
                  isSelected
                    ? `
                      bg-gradient-to-r
                      from-cyan-500/10
                      via-blue-500/8
                      to-indigo-500/5
                      border-cyan-400/20
                      shadow-lg
                      shadow-cyan-950/5
                    `
                    : `
                      border-transparent
                      hover:bg-base-100
                      hover:border-base-300
                    `
                }
              `}
            >
              {/* AVATAR */}

              <div
                className="
                  relative
                  shrink-0
                "
              >
                <div
                  className={`
                    w-12
                    h-12
                    rounded-full
                    overflow-hidden
                    border
                    ${
                      isSelected
                        ? "border-cyan-400/40"
                        : "border-base-300"
                    }
                  `}
                >
                  <img
                    src={
                      friend.profilePic ||
                      "/default-avatar.png"
                    }
                    alt={friend.fullName}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />
                </div>

                <span
                  className="
                    absolute
                    right-0
                    bottom-0
                    w-3
                    h-3
                    rounded-full
                    bg-emerald-400
                    border-[2px]
                    border-base-200
                  "
                />
              </div>

              {/* USER INFO */}

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                  "
                >
                  <h3
                    className="
                      font-semibold
                      text-sm
                      text-base-content
                      truncate
                    "
                  >
                    {friend.fullName}
                  </h3>

                  <span
                    className="
                      text-[10px]
                      text-base-content/30
                      shrink-0
                    "
                  >
                    сейчас
                  </span>
                </div>

                <p
                  className="
                    text-xs
                    text-base-content/45
                    mt-1
                    truncate
                  "
                >
                  Нажмите, чтобы открыть переписку
                </p>
              </div>

              {isSelected && (
                <div
                  className="
                    w-1
                    h-8
                    rounded-full
                    bg-gradient-to-b
                    from-cyan-400
                    to-blue-500
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </aside>

    {/* ================= RIGHT ================= */}

    <main
      className={`
        ${selectedFriend ? "flex" : "hidden md:flex"}
        w-full
        flex-1
        min-w-0
        min-h-0
        flex-col
        relative
        bg-base-100
      `}
    >
      {!selectedFriend ? (
        /* ================= EMPTY CHAT ================= */

        <div
          className="
            flex-1
            flex
            items-center
            justify-center
            px-6
            relative
            overflow-hidden
          "
        >
          {/* BACKGROUND GLOW */}

          <div
            className="
              absolute
              w-[500px]
              h-[500px]
              rounded-full
              bg-cyan-500/[0.025]
              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
              flex
              flex-col
              items-center
              text-center
              max-w-md
            "
          >
            <div
              className="
                relative
                mb-7
              "
            >
              <div
                className="
                  absolute
                  inset-0
                  rounded-[30px]
                  bg-cyan-400/10
                  blur-xl
                "
              />

              <div
                className="
                  relative
                  w-24
                  h-24
                  rounded-[28px]
                  flex
                  items-center
                  justify-center
                  bg-gradient-to-br
                  from-cyan-400/10
                  via-blue-500/10
                  to-indigo-500/10
                  border
                  border-cyan-400/20
                  shadow-2xl
                  shadow-base-content/10
                "
              >
                <MessageSquareIcon
                  className="
                    w-10
                    h-10
                    text-cyan-400
                  "
                />
              </div>
            </div>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-base-content
              "
            >
              Ваши сообщения
            </h1>

            <p
              className="
                mt-3
                text-sm
                text-base-content/50
                leading-relaxed
              "
            >
              Выберите чат слева или найдите нового друга,
              чтобы начать общение.
            </p>

            <button
              type="button"
              onClick={() => navigate("/friends")}
              className="
                mt-7
                h-11
                px-6
                rounded-xl
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-base-content
                bg-gradient-to-r
                from-cyan-600
                to-blue-600
                hover:from-cyan-500
                hover:to-blue-500
                shadow-lg
                shadow-cyan-950/20
                transition-all
                hover:-translate-y-0.5
              "
            >
              <UsersIcon className="w-4 h-4" />
              Найти друзей
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ================= CHAT HEADER ================= */}

          <header
            className="
              h-[64px]
              sm:h-[76px]
              shrink-0
              px-2
              sm:px-5
              border-b
              border-base-300
              bg-base-100/90
              backdrop-blur-xl
              flex
              items-center
              justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                sm:gap-3
                min-w-0
              "
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedFriend(null);
                  setShowEmojiPicker(false);
                  navigate("/chats");
                }}
                className="
                  md:hidden
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-base-content/60
                  hover:text-cyan-400
                  hover:bg-cyan-400/10
                  active:scale-95
                  transition-all
                "
                aria-label="Назад к чатам"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>

              <div className="relative">
                <div
                  className="
                    w-11
                    h-11
                    rounded-full
                    overflow-hidden
                    border
                    border-cyan-400/30
                  "
                >
                  <img
                    src={
                      selectedFriend.profilePic ||
                      "/default-avatar.png"
                    }
                    alt={selectedFriend.fullName}
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />
                </div>

                <span
                  className="
                    absolute
                    right-0
                    bottom-0
                    w-3
                    h-3
                    rounded-full
                    bg-emerald-400
                    border-2
                    border-base-100
                  "
                />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    text-sm
                    sm:text-base
                    font-semibold
                    text-base-content
                    truncate
                    max-w-[105px]
                    min-[380px]:max-w-[145px]
                    sm:max-w-[220px]
                  "
                >
                  {selectedFriend.fullName}
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-emerald-400/80
                  "
                >
                  В сети
                </p>
              </div>
            </div>

            {/* CALL BUTTONS */}

            <div
              className="
                flex
                items-center
                gap-1
              "
            >
              <button
                type="button"
                onClick={() => startCall("audio")}
                disabled={
                  isCalling ||
                  isCallConnected
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-base-content/55
                  hover:text-cyan-400
                  hover:bg-cyan-400/10
                  transition-all
                  disabled:opacity-30
                "
                title="Аудиозвонок"
              >
                <PhoneIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => startCall("video")}
                disabled={
                  isCalling ||
                  isCallConnected
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-base-content/55
                  hover:text-cyan-400
                  hover:bg-cyan-400/10
                  transition-all
                  disabled:opacity-30
                "
                title="Видеозвонок"
              >
                <VideoIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="
                  w-10
                  h-10
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-base-content/50
                  hover:text-base-content/70
                  hover:bg-base-200
                  transition-all
                "
              >
                <MoreVerticalIcon className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* ================= MESSAGES ================= */}

          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="
              flex-1
              min-h-0
              overflow-y-auto
              overscroll-contain
              px-3
              sm:px-5
              md:px-8
              py-4
              sm:py-6
              space-y-3
            "
          >
            {messagesLoading && (
              <div
                className="
                  flex
                  justify-center
                  py-10
                "
              >
                <span
                  className="
                    loading
                    loading-spinner
                    text-cyan-400
                  "
                />
              </div>
            )}

            {!messagesLoading &&
              messages.length === 0 && (
                <div
                  className="
                    h-full
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <div
                    className="
                      w-16
                      h-16
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      bg-cyan-400/10
                      border
                      border-cyan-400/15
                    "
                  >
                    <MessageSquareIcon
                      className="
                        w-7
                        h-7
                        text-cyan-400
                      "
                    />
                  </div>

                  <h3
                    className="
                      mt-4
                      font-semibold
                      text-base-content
                    "
                  >
                    Начните общение
                  </h3>

                  <p
                    className="
                      text-sm
                      text-base-content/45
                      mt-1
                    "
                  >
                    Отправьте первое сообщение
                  </p>
                </div>
              )}

            {messages.map((message) => {
              const isMine =
                message.sender?._id ===
                authUser?._id;

              return (
                <div
                  key={message._id}
                  className={`
                    flex
                    ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >
                  <div
                    className={`
                      max-w-[85%]
                      sm:max-w-[72%]
                      md:max-w-[60%]
                      px-4
                      py-2.5
                      rounded-2xl
                      text-sm
                      leading-relaxed
                      shadow-sm
                      ${
                        isMine
                          ? `
                            bg-gradient-to-br
                            from-cyan-500
                            to-blue-600
                            text-base-content
                            rounded-br-[5px]
                            shadow-cyan-950/20
                          `
                          : `
                            bg-base-200
                            text-base-content/90
                            border
                            border-base-300
                            rounded-bl-[5px]
                          `
                      }
                    `}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= INPUT ================= */}

          <form
            onSubmit={handleSendMessage}
            className="
              shrink-0
              px-2
              sm:px-4
              md:px-6
              py-2.5
              sm:py-4
              pb-[max(0.625rem,env(safe-area-inset-bottom))]
              border-t
              border-base-300
              bg-base-100/90
              backdrop-blur-xl
            "
          >
            <div
              className="
                max-w-5xl
                mx-auto
                flex
                items-end
                gap-2
              "
            >
              {/* EMOJI */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker(
                      (prev) => !prev
                    )
                  }
                  className="
                    w-11
                    h-11
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    text-xl
                    text-base-content/60
                    hover:bg-base-200
                    transition-all
                  "
                >
                  😊
                </button>

                {showEmojiPicker && (
                  <div
                    className="
                      absolute
                      bottom-14
                      left-0
                      z-50
                      rounded-2xl
                      overflow-hidden
                      shadow-2xl
                      border
                      border-base-300
                    "
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={theme === "dark" ? "dark" : "light"}
                      width={Math.min(320, window.innerWidth - 16)}
                      height={380}
                    />
                  </div>
                )}
              </div>

              {/* MESSAGE INPUT */}

              <div
                className="
                  flex-1
                  min-h-11
                  flex
                  items-center
                  rounded-2xl
                  px-4
                  bg-base-200
                  border
                  border-base-300
                  focus-within:border-cyan-400/30
                  focus-within:bg-base-200
                  transition-all
                "
              >
                <input
                  type="text"
                  placeholder="Напишите сообщение..."
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  className="
                    w-full
                    bg-transparent
                    outline-none
                    text-sm
                    text-base-content
                    py-2.5
                    placeholder:text-base-content/30
                  "
                />
              </div>

              {/* SEND */}

              <button
                type="submit"
                disabled={
                  !text.trim() ||
                  isPending
                }
                className="
                  w-11
                  h-11
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  bg-gradient-to-br
                  from-cyan-500
                  to-blue-600
                  text-base-content
                  shadow-lg
                  shadow-cyan-950/30
                  transition-all
                  hover:scale-105
                  active:scale-95
                  disabled:opacity-30
                  disabled:hover:scale-100
                "
              >
                {isPending ? (
                  <span
                    className="
                      loading
                      loading-spinner
                      loading-sm
                    "
                  />
                ) : (
                  <SendIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </main>

    {/* ================= MESSAGE NOTIFICATION ================= */}

    {messageNotification && (
      <div
        className="
          fixed
          top-3
          left-3
          right-3
          sm:top-5
          sm:left-auto
          sm:right-5
          z-[120]
          w-auto
          sm:w-[340px]
          rounded-2xl
          bg-base-100/95
          border
          border-cyan-400/15
          shadow-2xl
          shadow-base-content/20
          backdrop-blur-xl
          p-3
          flex
          items-center
          gap-3
        "
      >
        <div className="shrink-0">
          <div
            className="
              w-11
              h-11
              rounded-full
              overflow-hidden
              border
              border-cyan-400/25
            "
          >
            <img
              src={
                messageNotification.profilePic ||
                "/default-avatar.png"
              }
              alt={messageNotification.name}
              className="
                w-full
                h-full
                object-cover
              "
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              text-sm
              text-base-content
              font-semibold
              truncate
            "
          >
            {messageNotification.name}
          </p>

          <p
            className="
              text-xs
              text-base-content/50
              truncate
              mt-1
            "
          >
            {messageNotification.text}
          </p>
        </div>

        <span
          className="
            w-2
            h-2
            rounded-full
            bg-cyan-400
            shrink-0
          "
        />
      </div>
    )}

    {/* ================= INCOMING CALL ================= */}

    {isReceivingCall && (
      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/75
          backdrop-blur-lg
          p-4
        "
      >
        <div
          className="
            w-full
            max-w-sm
            rounded-[28px]
            bg-base-100
            border
            border-base-300
            shadow-2xl
            shadow-base-content/20
            p-5
            sm:p-8
            text-center
          "
        >
          <div
            className="
              w-24
              h-24
              mx-auto
              rounded-full
              p-1
              border
              border-cyan-400/30
              mb-5
            "
          >
            <img
              src={
                selectedFriend?.profilePic ||
                "/default-avatar.png"
              }
              alt="Incoming call"
              className="
                w-full
                h-full
                rounded-full
                object-cover
              "
            />
          </div>

          <h2
            className="
              text-xl
              font-bold
              text-base-content
            "
          >
            {selectedFriend?.fullName ||
              "Входящий звонок"}
          </h2>

          <p
            className="
              text-sm
              text-base-content/40
              mt-2
            "
          >
            {callType === "video"
              ? "Входящий видеозвонок"
              : "Входящий аудиозвонок"}
          </p>

          <div
            className="
              flex
              justify-center
              gap-5
              mt-8
            "
          >
            <button
              type="button"
              onClick={rejectCall}
              className="
                w-14
                h-14
                rounded-full
                bg-red-500
                text-base-content
                flex
                items-center
                justify-center
                hover:bg-red-400
                transition-all
                hover:scale-105
              "
            >
              <PhoneOffIcon className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={acceptCall}
              className="
                w-14
                h-14
                rounded-full
                bg-emerald-500
                text-base-content
                flex
                items-center
                justify-center
                hover:bg-emerald-400
                transition-all
                hover:scale-105
              "
            >
              {callType === "video" ? (
                <VideoIcon className="w-6 h-6" />
              ) : (
                <PhoneIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ================= CALL WINDOW ================= */}

    {(isCalling || isCallConnected) && (
      <div
        className="
          fixed
          inset-0
          z-[90]
          bg-black
          flex
          items-center
          justify-center
        "
      >
        {callType === "video" ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="
                w-full
                h-full
                object-cover
                bg-black
              "
            />

            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="
                absolute
                top-3
                right-3
                sm:top-6
                sm:right-6
                w-28
                min-[380px]:w-32
                sm:w-52
                aspect-video
                object-cover
                rounded-2xl
                border
                border-white/15
                shadow-2xl
                bg-base-100
              "
            />
          </>
        ) : (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <div
              className="
                w-32
                h-32
                rounded-full
                overflow-hidden
                border-2
                border-cyan-400/30
                shadow-2xl
                shadow-cyan-500/10
                mb-6
              "
            >
              <img
                src={
                  selectedFriend?.profilePic ||
                  "/default-avatar.png"
                }
                alt={selectedFriend?.fullName}
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            </div>

            <h2
              className="
                text-base-content
                text-2xl
                font-bold
              "
            >
              {selectedFriend?.fullName}
            </h2>

            <p
              className="
                text-base-content/40
                mt-2
              "
            >
              {isCalling
                ? "Вызов..."
                : "На связи"}
            </p>
          </div>
        )}

        {/* CALL CONTROLS */}

        <div
          className="
            absolute
            bottom-4
            sm:bottom-8
            left-1/2
            -translate-x-1/2
            flex
            items-center
            gap-2
            sm:gap-3
            bg-black/50
            backdrop-blur-2xl
            border
            border-base-300
            rounded-3xl
            p-3
            shadow-2xl
          "
        >
          <button
            type="button"
            onClick={toggleMute}
            className="
              w-12
              h-12
              rounded-full
              bg-white/10
              text-base-content
              flex
              items-center
              justify-center
              hover:bg-white/20
              transition-all
            "
          >
            {isMuted ? (
              <MicOffIcon className="w-5 h-5" />
            ) : (
              <MicIcon className="w-5 h-5" />
            )}
          </button>

          {callType === "video" && (
            <button
              type="button"
              onClick={toggleCamera}
              className="
                w-12
                h-12
                rounded-full
                bg-white/10
                text-base-content
                flex
                items-center
                justify-center
                hover:bg-white/20
                transition-all
              "
            >
              {cameraEnabled ? (
                <CameraIcon className="w-5 h-5" />
              ) : (
                <CameraOffIcon className="w-5 h-5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => endCall(true)}
            className="
              w-14
              h-14
              rounded-full
              bg-red-500
              text-base-content
              flex
              items-center
              justify-center
              hover:bg-red-400
              transition-all
              hover:scale-105
            "
          >
            <PhoneOffIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default ChatPage;