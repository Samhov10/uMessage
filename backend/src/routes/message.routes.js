import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";

import {
  getMessages,
  sendMessage,
  getUnreadMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(protectRoute);

// СНАЧАЛА этот маршрут
router.get("/unread", getUnreadMessages);

// Потом уже маршруты с userId
router.get("/:userId", getMessages);

router.post("/:userId", sendMessage);

export default router;