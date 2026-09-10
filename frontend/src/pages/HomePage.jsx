import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  getOutGoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  cancelFriendRequest,
  getUnreadMessages,
} from "../lib/api";

import { Link } from "react-router";

import {
  CheckCircleIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import FriendCard from "../components/FriendCard.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";

const HomePage = () => {
  const queryClient = useQueryClient();

  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const {
    data: friends = [],
    isLoading: loadingFriends,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const {
    data: recommendedUsers = [],
    isLoading: loadingUsers,
  } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  const {
    data: outgoingFriendReqs,
  } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutGoingFriendReqs,
  });

  const {
    data: unreadMessages = {},
  } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: getUnreadMessages,

    // Пока обновляем каждые 2 секунды.
    // Потом подключим Socket.IO и будет мгновенно.
    refetchInterval: 2000,
  });

  const {
    mutate: sendRequestMutation,
    isPending: isSending,
  } = useMutation({
    mutationFn: sendFriendRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["outgoingFriendReqs"],
      });
    },
  });

  const {
    mutate: cancelRequestMutation,
    isPending: isCancelling,
  } = useMutation({
    mutationFn: cancelFriendRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["outgoingFriendReqs"],
      });
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();

    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        if (req.recipient?._id) {
          outgoingIds.add(req.recipient._id);
        }
      });
    }

    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  return (
    <div className="min-h-full bg-base-100 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-12">

        {/* ДРУЗЬЯ */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
                Ваши друзья
              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Общайтесь и оставайтесь на связи
              </p>
            </div>

            <Link
              to="/notifications"
              className="btn bg-cyan-900 hover:bg-cyan-800 border-none text-white btn-sm rounded-full shadow-lg shadow-cyan-950/30"
            >
              <UsersIcon className="size-4 mr-2" />
              Приглашения в друзья
            </Link>

          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-cyan-500" />
            </div>
          ) : friends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

              {friends.map((friend) => {
                const unread = unreadMessages[friend._id];

                return (
                  <FriendCard
                    key={friend._id}
                    friend={friend}
                    unread={unread}
                  />
                );
              })}

            </div>
          )}
        </div>


        {/* РЕКОМЕНДАЦИИ */}
        <section>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
              Знакомьтесь с новыми людьми
            </h2>

            <p className="text-sm text-base-content/60 mt-1">
              Найдите подходящих людей на основе вашего профиля
            </p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-cyan-500" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="rounded-2xl bg-base-200 border border-slate-700 p-8 text-center">

              <h3 className="font-semibold text-lg mb-2 text-base-content">
                Нет рекомендуемых друзей
              </h3>

              <p className="text-sm text-base-content/60">
                Загляните позже — здесь появятся новые знакомства!
              </p>

            </div>
          ) : (
            <div className="space-y-3 max-w-md">

              {recommendedUsers.map((user) => {
                const hasRequestBeenSent =
                  outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="
                      flex
                      items-center
                      gap-4
                      bg-base-200
                      rounded-2xl
                      px-4
                      py-3
                      border
                      border-base-300
                      hover:bg-base-300
                      transition-all
                    "
                  >

                    {/* АВАТАР */}
                    <div className="avatar shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden">

                        <img
                          src={user.profilePic}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />

                      </div>
                    </div>


                    {/* ИМЯ + BIO */}
                    <div className="flex-1 min-w-0">

                      <h3 className="font-semibold text-base text-base-content truncate">
                        {user.fullName}
                      </h3>

                      {user.bio && (
                        <p className="text-sm text-base-content/50 truncate mt-1">
                          {user.bio}
                        </p>
                      )}

                    </div>


                    {/* КНОПКА */}
                    <button
                      className={`
                        btn
                        btn-sm
                        rounded-full
                        border-none
                        text-white
                        shrink-0
                        ${
                          hasRequestBeenSent
                            ? "bg-cyan-800 hover:bg-cyan-700"
                            : "bg-cyan-900 hover:bg-cyan-800"
                        }
                      `}
                      onClick={() => {
                        if (hasRequestBeenSent) {
                          cancelRequestMutation(user._id);
                        } else {
                          sendRequestMutation(user._id);
                        }
                      }}
                      disabled={isSending || isCancelling}
                    >

                      {isCancelling ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : hasRequestBeenSent ? (
                        <>
                          <CheckCircleIcon className="size-4" />
                          Отменить
                        </>
                      ) : isSending ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <>
                          <UserPlusIcon className="size-4" />
                          Добавить
                        </>
                      )}

                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default HomePage;