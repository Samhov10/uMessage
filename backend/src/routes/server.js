import dns from "dns";

import "dotenv/config";

import express from "express";

import http from "http";

import cors from "cors";

import cookieParser from "cookie-parser";

import authRoutes from "./auth.route.js";

import userRoutes from "./user.route.js";

import chatRoutes from "./chat.route.js";

import messageRoutes from "./message.routes.js";

import { connectDB } from "../lib/db.js";

import { setupSocket } from "./socket.js";

// ========================================
// DNS
// ========================================

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

// ========================================
// APP
// ========================================

const app = express();

app.set("trust proxy", 1);

const PORT =
  process.env.PORT || 5001;

// ========================================
// ORIGIN HELPERS
// ========================================

const normalizeOrigin = (value) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/\/+$/, "");
};

const CLIENT_URL =
  normalizeOrigin(
    process.env.CLIENT_URL
  );

const isAllowedOrigin = (origin) => {
  // Postman, Render health check и т.д.
  if (!origin) {
    return true;
  }

  const normalizedOrigin =
    normalizeOrigin(origin);

  // Локальная разработка
  if (
    normalizedOrigin ===
    "http://localhost:5173"
  ) {
    return true;
  }

  // Главный production frontend
  if (
    CLIENT_URL &&
    normalizedOrigin === CLIENT_URL
  ) {
    return true;
  }

  // Cloudflare Pages production + preview deployments
  try {
    const url =
      new URL(normalizedOrigin);

    if (
      url.protocol === "https:" &&
      (
        url.hostname ===
          "umessage-4yc.pages.dev" ||
        url.hostname.endsWith(
          ".umessage-4yc.pages.dev"
        )
      )
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

// ========================================
// CORS OPTIONS
// ========================================

const corsOptions = {
  origin: (
    origin,
    callback
  ) => {
    if (
      isAllowedOrigin(origin)
    ) {
      return callback(
        null,
        true
      );
    }

    console.log(
      "❌ CORS blocked:",
      origin
    );

    return callback(
      null,
      false
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

// ========================================
// CORS
// ========================================

app.use(
  cors(corsOptions)
);

app.options(
  "*",
  cors(corsOptions)
);

// ========================================
// BODY
// ========================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ========================================
// COOKIES
// ========================================

app.use(
  cookieParser()
);

// ========================================
// ROUTES
// ========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

// ========================================
// TEST ROUTE
// ========================================

app.get(
  "/",
  (req, res) => {
    res
      .status(200)
      .json({
        success: true,

        message:
          "uMessage server is running",

        environment:
          process.env.NODE_ENV ||
          "development",

        clientUrl:
          CLIENT_URL ||
          "not configured",
      });
  }
);

// ========================================
// 404
// ========================================

app.use(
  (req, res) => {
    res
      .status(404)
      .json({
        success: false,

        message:
          "Route not found",
      });
  }
);

// ========================================
// ERROR HANDLER
// ========================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "❌ Server error:",
      error
    );

    res
      .status(
        error.status || 500
      )
      .json({
        success: false,

        message:
          process.env.NODE_ENV ===
          "production"
            ? "Internal server error"
            : error.message,
      });
  }
);

// ========================================
// START SERVER
// ========================================

const startServer =
  async () => {
    try {
      await connectDB();

      const server =
        http.createServer(
          app
        );

      const io =
        setupSocket(
          server
        );

      app.set(
        "io",
        io
      );

      server.listen(
        PORT,
        "0.0.0.0",
        () => {
          console.log(
            `✅ uMessage server запущен на порту ${PORT}`
          );

          console.log(
            `🌍 Environment: ${
              process.env.NODE_ENV ||
              "development"
            }`
          );

          console.log(
            `🔗 Client URL: ${
              CLIENT_URL ||
              "http://localhost:5173"
            }`
          );
        }
      );
    } catch (error) {
      console.error(
        "❌ Ошибка запуска сервера:",
        error
      );

      process.exit(1);
    }
  };

startServer();