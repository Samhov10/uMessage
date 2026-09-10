import { Navigate, Route, Routes } from "react-router";
import { useEffect, useState } from "react";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoignPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnBoardingPage from "./pages/OnBoardingPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";

const App = () => {
  const { isLoading, authUser } = useAuthUser();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("uMessage-theme") || "dark";
  });

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnBoarded;

  useEffect(() => {
    localStorage.setItem("uMessage-theme", theme);
  }, [theme]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div
      className="h-screen"
      data-theme={theme === "dark" ? "forest" : "light"}
    >
      <Routes>
        {/* ROOT */}

        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : !isOnboarded ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/chats" replace />
            )
          }
        />

        {/* SIGNUP */}

        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : !isOnboarded ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/chats" replace />
            )
          }
        />

        {/* LOGIN */}

        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : !isOnboarded ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/chats" replace />
            )
          }
        />

        {/* EMAIL VERIFICATION */}

        <Route
          path="/verify-email"
          element={
            !isAuthenticated ? (
              <VerifyEmailPage />
            ) : !isOnboarded ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/chats" replace />
            )
          }
        />

        {/* FORGOT PASSWORD */}

        <Route
          path="/forgot-password"
          element={
            !isAuthenticated ? (
              <ForgotPasswordPage />
            ) : (
              <Navigate to="/chats" replace />
            )
          }
        />

        {/* ONBOARDING */}

        <Route
          path="/onboarding"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : isOnboarded ? (
              <Navigate to="/chats" replace />
            ) : (
              <OnBoardingPage />
            )
          }
        />

        {/* CHATS */}

        <Route
          path="/chats"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout
                showSidebar={true}
                theme={theme}
                setTheme={setTheme}
              >
                <ChatPage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        {/* OPEN CHAT */}

        <Route
          path="/chat/:userId"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout
                showSidebar={true}
                theme={theme}
                setTheme={setTheme}
              >
                <ChatPage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        {/* FRIENDS */}

        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout
                showSidebar={true}
                theme={theme}
                setTheme={setTheme}
              >
                <HomePage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        {/* OLD HOMEPAGE */}

        <Route
          path="/homepage"
          element={<Navigate to="/chats" replace />}
        />

        {/* NOTIFICATIONS */}

        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout
                showSidebar={true}
                theme={theme}
                setTheme={setTheme}
              >
                <NotificationsPage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        {/* CALL */}

        <Route
          path="/call"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout
                showSidebar={true}
                theme={theme}
                setTheme={setTheme}
              >
                <CallPage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        {/* 404 */}

        <Route
          path="*"
          element={
            isAuthenticated ? (
              isOnboarded ? (
                <Navigate to="/chats" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;