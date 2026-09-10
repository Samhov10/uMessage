import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// ================= RECOMMENDED USERS =================

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id;
    const currentUserFriends = req.user.friends || [];

    const recommendedUsers = await User.find({
      _id: {
        $ne: currentUserId,
        $nin: currentUserFriends,
      },
      isOnBoarded: true,
    }).select("-password");

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.log(
      "Ошибка в GetRecommendedUsers Controller:",
      error.message
    );

    res.status(500).json({
      message:
        "Ошибка при получении рекомендуемых пользователей",
    });
  }
}

// ================= MY FRIENDS =================

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic bio"
      );

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден!",
      });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.log(
      "Ошибка в GetMyFriends Controller:",
      error.message
    );

    res.status(500).json({
      message: "Не удалось получить список друзей!",
    });
  }
}

// ================= SEND FRIEND REQUEST =================

export async function sendFriendRequest(req, res) {
  try {
    console.log("========== FRIEND REQUEST ==========");
    console.log("REQ.USER:", req.user);
    console.log("REQ.PARAMS:", req.params);

    const myId = req.user._id;
    const { id: recipientId } = req.params;

    console.log("SENDER:", myId);
    console.log("RECIPIENT:", recipientId);

    if (myId.toString() === recipientId.toString()) {
      return res.status(400).json({
        message:
          "Вы не можете отправить запрос в друзья самому себе.",
      });
    }

    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({
        message: "Пользователь не найден!",
      });
    }

    const alreadyFriends = recipient.friends.some(
      (friendId) =>
        friendId.toString() === myId.toString()
    );

    if (alreadyFriends) {
      return res.status(400).json({
        message:
          "Вы уже являетесь друзьями с этим пользователем!",
      });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        {
          sender: myId,
          recipient: recipientId,
        },
        {
          sender: recipientId,
          recipient: myId,
        },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "Запрос на добавление в друзья между вами и этим пользователем уже существует.",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
      status: "pending",
    });

    console.log("✅ FRIEND REQUEST СОЗДАН:");
    console.log(friendRequest);

    return res.status(201).json(friendRequest);
  } catch (error) {
    console.log(
      "❌ Ошибка в sendFriendRequest Controller:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
}

// ================= CANCEL FRIEND REQUEST =================

export async function cancelFriendRequest(req, res) {
  try {
    const myId = req.user._id;
    const { id: recipientId } = req.params;

    const friendRequest =
      await FriendRequest.findOneAndDelete({
        sender: myId,
        recipient: recipientId,
        status: "pending",
      });

    if (!friendRequest) {
      return res.status(404).json({
        message: "Запрос в друзья не найден!",
      });
    }

    res.status(200).json({
      message: "Запрос в друзья отменён!",
    });
  } catch (error) {
    console.log(
      "Ошибка в cancelFriendRequest Controller:",
      error.message
    );

    res.status(500).json({
      message: "Не удалось отменить запрос!",
    });
  }
}

// ================= ACCEPT FRIEND REQUEST =================

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest =
      await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        message:
          "Запрос добавления в друзья не найден!",
      });
    }

    if (
      friendRequest.recipient.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "У вас нет доступа принять этот запрос.",
      });
    }

    friendRequest.status = "accepted";

    await friendRequest.save();

    await User.findByIdAndUpdate(
      friendRequest.sender,
      {
        $addToSet: {
          friends: friendRequest.recipient,
        },
      }
    );

    await User.findByIdAndUpdate(
      friendRequest.recipient,
      {
        $addToSet: {
          friends: friendRequest.sender,
        },
      }
    );

    res.status(200).json({
      message:
        "Запрос на добавление в друзья принят!",
    });
  } catch (error) {
    console.log(
      "Ошибка в acceptFriendRequest Controller:",
      error.message
    );

    res.status(500).json({
      message:
        "Не удалось принять запрос в друзья!",
    });
  }
}

// ================= FRIEND REQUESTS =================

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs =
      await FriendRequest.find({
        recipient: req.user._id,
        status: "pending",
      }).populate(
        "sender",
        "fullName profilePic bio"
      );

    const acceptedReqs =
      await FriendRequest.find({
        sender: req.user._id,
        status: "accepted",
      }).populate(
        "recipient",
        "fullName profilePic bio"
      );

    res.status(200).json({
      incomingReqs,
      acceptedReqs,
    });
  } catch (error) {
    console.log(
      "Ошибка в getFriendRequests Controller:",
      error.message
    );

    res.status(500).json({
      message:
        "Не удалось получить запросы в друзья!",
    });
  }
}

// ================= OUTGOING REQUESTS =================

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests =
      await FriendRequest.find({
        sender: req.user._id,
        status: "pending",
      }).populate(
        "recipient",
        "fullName profilePic bio"
      );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log(
      "Ошибка в getOutgoingFriendReqs Controller:",
      error.message
    );

    res.status(500).json({
      message:
        "Не удалось получить отправленные запросы!",
    });
  }
}