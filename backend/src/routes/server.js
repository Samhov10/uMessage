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
// ALLOWED ORIGINS
// ========================================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// ========================================
// CORS
// ========================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешаем запросы без Origin:
      // Render health check, Postman и т.д.

      if (!origin) {
        return callback(
          null,
          true
        );
      }

      if (
        allowedOrigins.includes(
          origin
        )
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
        new Error(
          "Not allowed by CORS"
        )
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
  })
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
              process.env.CLIENT_URL ||
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