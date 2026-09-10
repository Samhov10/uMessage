import { StreamChat } from "stream-chat";
import "dotenv/config.js";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error(
    "❌ Отсутствует STREAM_API_KEY или STREAM_API_SECRET"
  );
}

const streamClient =
  apiKey && apiSecret
    ? StreamChat.getInstance(
        apiKey,
        apiSecret
      )
    : null;

// ========================================
// CREATE / UPDATE STREAM USER
// ========================================

export const upsertStreamUser = async (
  userData
) => {
  try {
    if (!streamClient) {
      console.error(
        "❌ Stream client не настроен"
      );

      return null;
    }

    await streamClient.upsertUsers([
      userData,
    ]);

    return userData;
  } catch (error) {
    console.error(
      "❌ Ошибка создания пользователя Stream:",
      error.message
    );

    return null;
  }
};

// ========================================
// GENERATE STREAM TOKEN
// ========================================

export const generateStreamToken = (
  userId
) => {
  try {
    if (!streamClient) {
      console.error(
        "❌ Stream client не настроен"
      );

      return null;
    }

    if (!userId) {
      console.error(
        "❌ userId отсутствует"
      );

      return null;
    }

    const userIdStr =
      userId.toString();

    return streamClient.createToken(
      userIdStr
    );
  } catch (error) {
    console.error(
      "❌ Ошибка генерации Stream Token:",
      error.message
    );

    return null;
  }
};