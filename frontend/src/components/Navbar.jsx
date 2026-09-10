import {
  BellIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router";

import useAuthUser from "../hooks/useAuthUser.js";

import { logout } from "../lib/api.js";

export const Navbar = ({
  showLogo = true,
  theme,
  setTheme,
}) => {
  const { authUser } = useAuthUser();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);

      navigate("/login", {
        replace: true,
      });
    },
  });

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark" ? "light" : "dark"
    );
  };

  return (
    <header
      className="
        h-14
        sm:h-16
        w-full
        px-2
        min-[360px]:px-3
        sm:px-5
        bg-base-100/85
        backdrop-blur-xl
        shadow-[0_6px_24px_rgba(15,23,42,0.03)]
        flex
        items-center
        justify-between
        gap-2
        shrink-0
      "
    >
      {/* ================= LOGO ================= */}

      {showLogo ? (
        <button
          type="button"
          onClick={() => navigate("/chats")}
          className="
            flex
            items-center
            gap-1
            sm:gap-2
            min-w-0
            shrink
          "
        >
          <img
            src="/logo1.png"
            alt="uMessage"
            className="
              w-8
              h-8
              sm:w-9
              sm:h-9
              object-contain
              shrink-0
              drop-shadow-sm
            "
          />

          <span
            className="
              hidden
              min-[360px]:block
              text-lg
              sm:text-2xl
              font-bold
              font-mono
              bg-gradient-to-r
              from-cyan-400
              via-blue-500
              to-indigo-500
              bg-clip-text
              text-transparent
              truncate
            "
          >
            uMessage
          </span>
        </button>
      ) : (
        <div className="min-w-0" />
      )}

      {/* ================= ACTIONS ================= */}

      <div
        className="
          flex
          items-center
          justify-end
          gap-0
          min-[360px]:gap-0.5
          sm:gap-1
          shrink-0
        "
      >
        {/* THEME */}

        <button
          type="button"
          onClick={toggleTheme}
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-xl
            flex
            items-center
            justify-center
            text-base-content/60
            hover:text-cyan-500
            hover:bg-cyan-500/10
            active:scale-95
            transition-all
            duration-200
            shrink-0
          "
          title={
            theme === "dark"
              ? "Светлая тема"
              : "Тёмная тема"
          }
          aria-label={
            theme === "dark"
              ? "Включить светлую тему"
              : "Включить тёмную тему"
          }
        >
          {theme === "dark" ? (
            <SunIcon
              className="
                w-[18px]
                h-[18px]
                sm:w-5
                sm:h-5
              "
            />
          ) : (
            <MoonIcon
              className="
                w-[18px]
                h-[18px]
                sm:w-5
                sm:h-5
              "
            />
          )}
        </button>

        {/* NOTIFICATIONS */}

        <button
          type="button"
          onClick={() =>
            navigate("/notifications")
          }
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-xl
            flex
            items-center
            justify-center
            text-base-content/60
            hover:text-cyan-500
            hover:bg-cyan-500/10
            active:scale-95
            transition-all
            duration-200
            shrink-0
          "
          title="Уведомления"
          aria-label="Уведомления"
        >
          <BellIcon
            className="
              w-[18px]
              h-[18px]
              sm:w-5
              sm:h-5
            "
          />
        </button>

        {/* AVATAR */}

        <button
          type="button"
          className="
            ml-0.5
            sm:ml-1
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-full
            flex
            items-center
            justify-center
            overflow-hidden
            shrink-0
            active:scale-95
            transition-transform
          "
          title={authUser?.fullName || "Профиль"}
          aria-label="Профиль"
        >
          <img
            src={
              authUser?.profilePic ||
              "/default-avatar.png"
            }
            alt={
              authUser?.fullName ||
              "User"
            }
            className="
              block
              w-8
              h-8
              sm:w-9
              sm:h-9
              rounded-full
              object-cover
            "
          />
        </button>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={() => logoutMutation()}
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-xl
            flex
            items-center
            justify-center
            text-base-content/60
            hover:text-red-500
            hover:bg-red-500/10
            active:scale-95
            transition-all
            duration-200
            shrink-0
          "
          title="Выйти"
          aria-label="Выйти"
        >
          <LogOutIcon
            className="
              w-[18px]
              h-[18px]
              sm:w-5
              sm:h-5
            "
          />
        </button>
      </div>
    </header>
  );
};