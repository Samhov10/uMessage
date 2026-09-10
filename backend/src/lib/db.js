import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "Переменная MONGO_URI не найдена в .env"
      );
    }

    const conn = await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      `✅ MongoDB подключен: ${conn.connection.host}`
    );

    console.log(
      `📦 База данных: ${conn.connection.name}`
    );
  } catch (error) {
    console.error(
      "❌ Ошибка подключения к MongoDB:",
      error.message
    );

    process.exit(1);
  }
};