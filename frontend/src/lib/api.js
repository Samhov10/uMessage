import { axiosInstance } from "./axios";

// =========================
// AUTH
// =========================

export const signup = async (signupData) => {
  const response = await axiosInstance.post(
    "/auth/signup",
    signupData
  );

  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post(
    "/auth/logout"
  );

  return response.data;
};

export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");

    return response.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}; 

// =========================
// ONBOARDING
// =========================

export const completeOnboarding = async (
  formData
) => {
  const response = await axiosInstance.post(
    "/auth/onboarding",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

// =========================
// USERS / FRIENDS
// =========================

export async function getUserFriends() {
  const response = await axiosInstance.get(
    "/users/friends"
  );

  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get(
    "/users"
  );

  return response.data;
}

export async function getOutGoingFriendReqs() {
  const response = await axiosInstance.get(
    "/users/outgoing-friend-requests"
  );

  return response.data;
}

export async function sendFriendRequest(
  userId
) {
  const response = await axiosInstance.post(
    `/users/friend-request/${userId}`
  );

  return response.data;
}

export async function cancelFriendRequest(
  userId
) {
  const response = await axiosInstance.delete(
    `/users/friend-request/${userId}`
  );

  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get(
    "/users/friend-requests"
  );

  return response.data;
}

export const acceptFriendRequests = async (
  requestId
) => {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );

  return response.data;
};

// =========================
// MESSAGES
// =========================

export async function getMessages(
  userId
) {
  const response = await axiosInstance.get(
    `/messages/${userId}`
  );

  return response.data;
}

export async function sendMessage(
  userId,
  text
) {
  const response = await axiosInstance.post(
    `/messages/${userId}`,
    {
      text,
    }
  );

  return response.data;
}

export const getUnreadMessages = async () => {
  const response = await axiosInstance.get(
    "/messages/unread"
  );

  return response.data.unread;
};

// =========================
// EMAIL VERIFICATION
// =========================

export const verifyEmail = async (
  data
) => {
  const response = await axiosInstance.post(
    "/auth/verify-email",
    data
  );

  return response.data;
};

export const resendVerificationCode = async (
  email
) => {
  const response = await axiosInstance.post(
    "/auth/resend-verification",
    {
      email,
    }
  );

  return response.data;
};

// =========================
// PASSWORD RESET
// =========================

export const forgotPassword = async (email) => {
  const response =
    await axiosInstance.post(
      "/auth/forgot-password",
      {
        email,
      }
    );

  return response.data;
};

export const resetPassword = async (data) => {
  const response =
    await axiosInstance.post(
      "/auth/reset-password",
      data
    );

  return response.data;
};