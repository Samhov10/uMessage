import Message from "../models/message.model.js";

// ПОЛУЧИТЬ СООБЩЕНИЯ
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    // Когда открыли чат — помечаем входящие сообщения прочитанными
    await Message.updateMany(
      {
        sender: userId,
        recipient: myId,

        $or: [
          { isRead: false },
          { isRead: { $exists: false } },
        ],
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    const messages = await Message.find({
      $or: [
        {
          sender: myId,
          recipient: userId,
        },
        {
          sender: userId,
          recipient: myId,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "fullName profilePic")
      .populate("recipient", "fullName profilePic");

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Ошибка получения сообщений:", error);

    return res.status(500).json({
      success: false,
      message: "Ошибка получения сообщений",
    });
  }
};


// ОТПРАВИТЬ СООБЩЕНИЕ
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Сообщение не может быть пустым",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: userId,
      text: text.trim(),
      isRead: false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName profilePic")
      .populate("recipient", "fullName profilePic");

    const io = req.app.get("io");

    if (io) {
      io.to(userId.toString()).emit(
        "new-message",
        populatedMessage
      );
    }

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);

    return res.status(500).json({
      success: false,
      message: "Ошибка отправки сообщения",
    });
  }
};


// ПОЛУЧИТЬ НЕПРОЧИТАННЫЕ
export const getUnreadMessages = async (req, res) => {
  try {
    const myId = req.user._id;

    const unreadMessages = await Message.find({
      recipient: myId,

      $or: [
        { isRead: false },
        { isRead: { $exists: false } },
      ],
    })
      .sort({ createdAt: 1 })
      .select("sender text createdAt isRead");

    const unreadByUser = {};

    unreadMessages.forEach((message) => {
      const senderId = message.sender.toString();

      if (!unreadByUser[senderId]) {
        unreadByUser[senderId] = {
          count: 0,
          lastMessage: "",
          createdAt: null,
        };
      }

      unreadByUser[senderId].count++;

      unreadByUser[senderId].lastMessage =
        message.text;

      unreadByUser[senderId].createdAt =
        message.createdAt;
    });

    console.log("🔴 НЕПРОЧИТАННЫЕ:", unreadByUser);

    return res.status(200).json({
      success: true,
      unread: unreadByUser,
    });
  } catch (error) {
    console.error(
      "Ошибка получения непрочитанных сообщений:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Ошибка получения непрочитанных сообщений",
    });
  }
};