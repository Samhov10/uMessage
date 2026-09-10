import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        message: "Ошибка авторизации: токен отсутствует",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    if (!decoded?.userId) {
      return res.status(401).json({
        message: "Ошибка авторизации: неправильный токен",
      });
    }

    const user = await User.findById(
      decoded.userId
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Пользователь не найден",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Ошибка проверки авторизации:",
      error.message
    );

    return res.status(401).json({
      message: "Ошибка авторизации",
    });
  }
};