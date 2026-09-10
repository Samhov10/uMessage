import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";

import crypto from "crypto";

import { upsertStreamUser } from "../lib/stream.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../lib/email.js";

// ==================================================
// HELPERS
// ==================================================

function safeBody(body) {
  try {
    if (typeof body === "string") {
      return JSON.parse(body);
    }

    return body;
  } catch {
    return {};
  }
}

function generateCode() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

function hashCode(code) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

// ==================================================
// JWT
// ==================================================

function createToken(userId) {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
}

// ==================================================
// COOKIE OPTIONS
// ==================================================

function getCookieOptions() {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction
      ? "none"
      : "lax",

    path: "/",
  };
}

// ==================================================
// SET AUTH COOKIE
// ==================================================

function setAuthCookie(res, token) {
  res.cookie("jwt", token, {
    ...getCookieOptions(),

    maxAge:
      7 *
      24 *
      60 *
      60 *
      1000,
  });
}

// ==================================================
// SIGNUP
// ==================================================

export async function signup(req, res) {
  const body = safeBody(req.body);

  const {
    email,
    password,
    fullName,
  } = body;

  try {
    if (
      !email ||
      !password ||
      !fullName
    ) {
      return res.status(400).json({
        message:
          "Все поля обязательны!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Пароль должен быть не менее 6 символов!",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message:
          "Неправильный формат электронной почты!",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Электронная почта уже используется!",
      });
    }

    const verificationCode =
      generateCode();

    const hashedCode =
      hashCode(
        verificationCode
      );

    const newUser =
      await User.create({
        email:
          normalizedEmail,

        fullName:
          fullName.trim(),

        password,

        bio:
          "Здравствуйте, я использую uMessage.",

        isEmailVerified:
          false,

        emailVerificationCode:
          hashedCode,

        emailVerificationExpires:
          new Date(
            Date.now() +
              10 *
                60 *
                1000
          ),
      });

    try {
      await sendVerificationEmail(
        newUser.email,
        verificationCode
      );
    } catch (emailError) {
      console.error(
        "Ошибка отправки email:",
        emailError
      );

      await User.findByIdAndDelete(
        newUser._id
      );

      return res.status(500).json({
        message:
          "Не удалось отправить код подтверждения",
      });
    }

    return res.status(201).json({
      success: true,

      message:
        "Код подтверждения отправлен на вашу почту",

      email:
        newUser.email,
    });
  } catch (error) {
    console.error(
      "Ошибка регистрации:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка сервера",
    });
  }
}

// ==================================================
// VERIFY EMAIL
// ==================================================

export async function verifyEmail(
  req,
  res
) {
  try {
    const {
      email,
      code,
    } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message:
          "Введите код подтверждения",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Пользователь не найден",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message:
          "Электронная почта уже подтверждена",
      });
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires <
        new Date()
    ) {
      return res.status(400).json({
        message:
          "Код подтверждения истёк",
      });
    }

    const hashedCode =
      hashCode(code);

    if (
      hashedCode !==
      user.emailVerificationCode
    ) {
      return res.status(400).json({
        message:
          "Неверный код подтверждения",
      });
    }

    user.isEmailVerified =
      true;

    user.emailVerificationCode =
      null;

    user.emailVerificationExpires =
      null;

    await user.save();

    try {
      await upsertStreamUser({
        id:
          user._id.toString(),

        name:
          user.fullName,

        image:
          user.profilePic ||
          "",
      });
    } catch (streamError) {
      console.error(
        "Ошибка Stream:",
        streamError.message
      );
    }

    const token =
      createToken(
        user._id
      );

    setAuthCookie(
      res,
      token
    );

    return res.status(200).json({
      success: true,

      message:
        "Электронная почта подтверждена",

      user,
    });
  } catch (error) {
    console.error(
      "Ошибка подтверждения email:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка сервера",
    });
  }
}

// ==================================================
// RESEND EMAIL CODE
// ==================================================

export async function resendVerificationCode(
  req,
  res
) {
  try {
    const {
      email,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Введите электронную почту",
      });
    }

    const user =
      await User.findOne({
        email:
          email
            .trim()
            .toLowerCase(),
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Пользователь не найден",
      });
    }

    if (
      user.isEmailVerified
    ) {
      return res.status(400).json({
        message:
          "Почта уже подтверждена",
      });
    }

    const code =
      generateCode();

    user.emailVerificationCode =
      hashCode(code);

    user.emailVerificationExpires =
      new Date(
        Date.now() +
          10 *
            60 *
            1000
      );

    await user.save();

    try {
      await sendVerificationEmail(
        user.email,
        code
      );
    } catch (emailError) {
      console.error(
        "Ошибка отправки нового кода:",
        emailError
      );

      return res.status(500).json({
        message:
          "Не удалось отправить код",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Новый код отправлен",
    });
  } catch (error) {
    console.error(
      "Ошибка повторной отправки:",
      error
    );

    return res.status(500).json({
      message:
        "Не удалось отправить код",
    });
  }
}

// ==================================================
// LOGIN
// ==================================================

export async function login(
  req,
  res
) {
  const body =
    safeBody(req.body);

  const {
    email,
    password,
  } = body;

  try {
    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Введите вашу электронную почту и пароль!",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (!user) {
      return res.status(400).json({
        message:
          "Неверная электронная почта или пароль!",
      });
    }

    const isPasswordCorrect =
      password ===
      user.password;

    if (
      !isPasswordCorrect
    ) {
      return res.status(400).json({
        message:
          "Неверная электронная почта или пароль!",
      });
    }

    if (
      !user.isEmailVerified
    ) {
      return res.status(403).json({
        message:
          "Подтвердите электронную почту",

        needsVerification:
          true,

        email:
          user.email,
      });
    }

    const token =
      createToken(
        user._id
      );

    setAuthCookie(
      res,
      token
    );

    return res.status(200).json({
      success: true,

      message:
        "Вход выполнен",

      user,
    });
  } catch (error) {
    console.error(
      "Ошибка входа:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка сервера",
    });
  }
}

// ==================================================
// FORGOT PASSWORD
// ==================================================

export async function forgotPassword(
  req,
  res
) {
  try {
    const {
      email,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        message:
          "Введите электронную почту",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Пользователь с такой почтой не найден",
      });
    }

    const code =
      generateCode();

    user.passwordResetCode =
      hashCode(code);

    user.passwordResetExpires =
      new Date(
        Date.now() +
          10 *
            60 *
            1000
      );

    await user.save();

    try {
      await sendPasswordResetEmail(
        user.email,
        code
      );
    } catch (emailError) {
      console.error(
        "Ошибка отправки кода восстановления:",
        emailError
      );

      return res.status(500).json({
        message:
          "Не удалось отправить код",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Код восстановления отправлен",

      email:
        user.email,
    });
  } catch (error) {
    console.error(
      "Forgot password:",
      error
    );

    return res.status(500).json({
      message:
        "Не удалось отправить код",
    });
  }
}

// ==================================================
// RESET PASSWORD
// ==================================================

export async function resetPassword(
  req,
  res
) {
  try {
    const {
      email,
      code,
      password,
    } = req.body;

    if (
      !email ||
      !code ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Заполните все поля",
      });
    }

    if (
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          "Пароль должен содержать минимум 6 символов",
      });
    }

    const user =
      await User.findOne({
        email:
          email
            .trim()
            .toLowerCase(),
      });

    if (!user) {
      return res.status(404).json({
        message:
          "Пользователь не найден",
      });
    }

    if (
      !user.passwordResetExpires ||
      user.passwordResetExpires <
        new Date()
    ) {
      return res.status(400).json({
        message:
          "Код восстановления истёк",
      });
    }

    const hashedCode =
      hashCode(code);

    if (
      hashedCode !==
      user.passwordResetCode
    ) {
      return res.status(400).json({
        message:
          "Неверный код восстановления",
      });
    }

    user.password =
      password;

    user.passwordResetCode =
      null;

    user.passwordResetExpires =
      null;

    await user.save();

    return res.status(200).json({
      success: true,

      message:
        "Пароль успешно изменён",
    });
  } catch (error) {
    console.error(
      "Reset password:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка сервера",
    });
  }
}

// ==================================================
// LOGOUT
// ==================================================

export function logout(
  req,
  res
) {
  res.clearCookie(
    "jwt",
    getCookieOptions()
  );

  return res.status(200).json({
    success: true,

    message:
      "Выход выполнен",
  });
}

// ==================================================
// GET ME
// ==================================================

export async function getMe(
  req,
  res
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message:
          "Не авторизован",
      });
    }

    return res.status(200).json({
      success: true,

      user:
        req.user,
    });
  } catch (error) {
    console.error(
      "GetMe:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка сервера",
    });
  }
}

// ==================================================
// ==================================================
// ONBOARDING
// ==================================================

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const {
      fullName,
      bio,
    } = req.body;

    if (!fullName || !bio) {
      return res.status(400).json({
        message:
          "Имя и описание профиля обязательны!",
      });
    }

    const updateData = {
      fullName: fullName.trim(),
      bio: bio.trim(),
      isOnBoarded: true,
    };

    // ==============================================
    // UPLOAD AVATAR TO CLOUDINARY
    // ==============================================

    if (req.file) {
      const uploadResult =
        await new Promise(
          (resolve, reject) => {
            const uploadStream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "umessage/avatars",

                  resource_type: "image",

                  transformation: [
                    {
                      width: 500,
                      height: 500,
                      crop: "fill",
                      gravity: "face",
                      quality: "auto",
                      fetch_format: "auto",
                    },
                  ],
                },

                (error, result) => {
                  if (error) {
                    return reject(error);
                  }

                  resolve(result);
                }
              );

            uploadStream.end(
              req.file.buffer
            );
          }
        );

      if (!uploadResult?.secure_url) {
        return res.status(500).json({
          message:
            "Не удалось загрузить изображение профиля",
        });
      }

      updateData.profilePic =
        uploadResult.secure_url;
    }

    // ==============================================
    // UPDATE USER
    // ==============================================

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedUser) {
      return res.status(404).json({
        message:
          "Пользователь не найден!",
      });
    }

    // ==============================================
    // UPDATE STREAM USER
    // ==============================================

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image:
          updatedUser.profilePic || "",
      });
    } catch (streamError) {
      console.error(
        "Stream error:",
        streamError.message
      );
    }

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "OnBoarding error:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка сервера!",
    });
  }
}