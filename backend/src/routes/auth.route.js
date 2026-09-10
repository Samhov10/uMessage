import express from "express";

import {
  signup,
  login,
  logout,
  getMe,
  onboard,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import { upload } from "../middleware/upload.middleware.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.get("/me", protectRoute, getMe);

router.post(
  "/onboarding",
  protectRoute,
  upload.single("profilePic"),
  onboard
);

router.post(
  "/verify-email",
  verifyEmail
);

router.post(
  "/resend-verification",
  resendVerificationCode
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

export default router;