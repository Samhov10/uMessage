import { Link, useLocation } from "react-router";

import { useQuery } from "@tanstack/react-query";

import useAuthUser from "../hooks/useAuthUser.js";

import {
  BellIcon,
  MessageCircleIcon,
  UsersIcon,
} from "lucide-react";

import { getFriendRequests } from "../lib/api";

const Sidebar = () => {
  const { authUser } = useAuthUser();

  const location = useLocation();

  const currentPath = location.pathname;

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const notificationCount =
    friendRequests?.incomingReqs?.length || 0;

  const isChatsActive =
    currentPath === "/chats" ||
    currentPath.startsWith("/chat/");

  const isFriendsActive =
    currentPath === "/friends";

  const isNotificationsActive =
    currentPath === "/notifications";

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside
        className="
          w-64
          hidden
          lg:flex
          flex-col
          h-screen
          sticky
          top-0
          shrink-0
          bg-base-100/90
          backdrop-blur-xl
          shadow-[8px_0_30px_rgba(15,23,42,0.03)]
        "
      >
        {/* LOGO */}

        <div className="px-5 pt-5 pb-4">
          <Link
            to="/chats"
            className="
              flex
              items-center
              gap-3
              w-fit
            "
          >
            <img
              src="/logo1.png"
              alt="uMessage"
              className="
                w-10
                h-10
                object-contain
                drop-shadow-sm
              "
            />

            <span
              className="
                text-3xl
                font-bold
                font-mono
                tracking-wider
                bg-gradient-to-r
                from-cyan-400
                via-blue-500
                to-indigo-500
                bg-clip-text
                text-transparent
              "
            >
              uMessage
            </span>
          </Link>
        </div>

        {/* NAVIGATION */}

        <nav
          className="
            flex-1
            px-4
            pt-3
            space-y-2
          "
        >
          {/* CHATS */}

          <Link
            to="/chats"
            className={`
              flex
              items-center
              gap-3
              w-full
              h-11
              px-4
              rounded-2xl
              text-sm
              font-medium
              transition-all
              duration-200
              ${
                isChatsActive
                  ? `
                    bg-gradient-to-r
                    from-cyan-400/15
                    via-blue-500/12
                    to-indigo-500/10
                    text-cyan-600
                    shadow-sm
                  `
                  : `
                    text-base-content/70
                    hover:bg-base-200/60
                    hover:text-base-content
                  `
              }
            `}
          >
            <MessageCircleIcon className="size-5 shrink-0" />

            <span>Чаты</span>
          </Link>

          {/* FRIENDS */}

          <Link
            to="/friends"
            className={`
              flex
              items-center
              gap-3
              w-full
              h-11
              px-4
              rounded-2xl
              text-sm
              font-medium
              transition-all
              duration-200
              ${
                isFriendsActive
                  ? `
                    bg-gradient-to-r
                    from-cyan-400/15
                    via-blue-500/12
                    to-indigo-500/10
                    text-cyan-600
                    shadow-sm
                  `
                  : `
                    text-base-content/70
                    hover:bg-base-200/60
                    hover:text-base-content
                  `
              }
            `}
          >
            <UsersIcon className="size-5 shrink-0" />

            <span>Друзья</span>
          </Link>

          {/* NOTIFICATIONS */}

          <Link
            to="/notifications"
            className={`
              flex
              items-center
              gap-3
              w-full
              h-11
              px-4
              rounded-2xl
              text-sm
              font-medium
              transition-all
              duration-200
              ${
                isNotificationsActive
                  ? `
                    bg-gradient-to-r
                    from-cyan-400/15
                    via-blue-500/12
                    to-indigo-500/10
                    text-cyan-600
                    shadow-sm
                  `
                  : `
                    text-base-content/70
                    hover:bg-base-200/60
                    hover:text-base-content
                  `
              }
            `}
          >
            <BellIcon className="size-5 shrink-0" />

            <span>Уведомления</span>

            {notificationCount > 0 && (
              <span
                className="
                  ml-auto
                  min-w-5
                  h-5
                  px-1.5
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-cyan-500/15
                  text-cyan-500
                  text-[11px]
                  font-semibold
                "
              >
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </Link>
        </nav>

        {/* PROFILE */}

        <div
          className="
            px-4
            pb-4
            pt-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              px-3
              py-3
              rounded-2xl
              bg-base-200/40
              hover:bg-base-200/60
              transition-all
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-full
                overflow-hidden
                shrink-0
              "
            >
              <img
                src={
                  authUser?.profilePic ||
                  "/default-avatar.png"
                }
                alt={
                  authUser?.fullName ||
                  "User Avatar"
                }
                className="
                  block
                  w-full
                  h-full
                  object-cover
                  rounded-full
                "
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="
                  font-semibold
                  text-sm
                  truncate
                  text-base-content
                "
              >
                {authUser?.fullName}
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  mt-0.5
                "
              >
                <span
                  className="
                    size-2
                    rounded-full
                    bg-emerald-400
                  "
                />

                <span
                  className="
                    text-xs
                    text-emerald-500
                  "
                >
                  В сети
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}

      <nav
        className="
          lg:hidden
          fixed
          left-2
          right-2
          bottom-2
          z-[80]
          h-[64px]
          px-2
          rounded-2xl
          bg-base-100/90
          backdrop-blur-2xl
          shadow-[0_10px_40px_rgba(15,23,42,0.16)]
          flex
          items-center
          justify-around
          pb-[env(safe-area-inset-bottom)]
        "
      >
        {/* CHATS */}

        <Link
          to="/chats"
          className={`
            relative
            flex-1
            h-14
            flex
            flex-col
            items-center
            justify-center
            gap-1
            rounded-xl
            text-[10px]
            min-[380px]:text-[11px]
            font-medium
            transition-all
            duration-200
            ${
              isChatsActive
                ? `
                  text-cyan-500
                  bg-gradient-to-b
                  from-cyan-400/10
                  to-transparent
                `
                : `
                  text-base-content/50
                  active:bg-base-200/60
                `
            }
          `}
        >
          <MessageCircleIcon
            className={`
              w-5
              h-5
              transition-transform
              ${
                isChatsActive
                  ? "scale-110"
                  : ""
              }
            `}
          />

          <span>Чаты</span>

          {isChatsActive && (
            <span
              className="
                absolute
                bottom-0.5
                w-5
                h-[2px]
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                to-blue-500
              "
            />
          )}
        </Link>

        {/* FRIENDS */}

        <Link
          to="/friends"
          className={`
            relative
            flex-1
            h-14
            flex
            flex-col
            items-center
            justify-center
            gap-1
            rounded-xl
            text-[10px]
            min-[380px]:text-[11px]
            font-medium
            transition-all
            duration-200
            ${
              isFriendsActive
                ? `
                  text-cyan-500
                  bg-gradient-to-b
                  from-cyan-400/10
                  to-transparent
                `
                : `
                  text-base-content/50
                  active:bg-base-200/60
                `
            }
          `}
        >
          <UsersIcon
            className={`
              w-5
              h-5
              transition-transform
              ${
                isFriendsActive
                  ? "scale-110"
                  : ""
              }
            `}
          />

          <span>Друзья</span>

          {isFriendsActive && (
            <span
              className="
                absolute
                bottom-0.5
                w-5
                h-[2px]
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                to-blue-500
              "
            />
          )}
        </Link>

        {/* NOTIFICATIONS */}

        <Link
          to="/notifications"
          className={`
            relative
            flex-1
            h-14
            flex
            flex-col
            items-center
            justify-center
            gap-1
            rounded-xl
            text-[10px]
            min-[380px]:text-[11px]
            font-medium
            transition-all
            duration-200
            ${
              isNotificationsActive
                ? `
                  text-cyan-500
                  bg-gradient-to-b
                  from-cyan-400/10
                  to-transparent
                `
                : `
                  text-base-content/50
                  active:bg-base-200/60
                `
            }
          `}
        >
          <div className="relative">
            <BellIcon
              className={`
                w-5
                h-5
                transition-transform
                ${
                  isNotificationsActive
                    ? "scale-110"
                    : ""
                }
              `}
            />

            {notificationCount > 0 && (
              <span
                className="
                  absolute
                  -top-2
                  -right-3
                  min-w-[17px]
                  h-[17px]
                  px-1
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-cyan-500
                  text-white
                  text-[9px]
                  font-bold
                  shadow-md
                "
              >
                {notificationCount > 9
                  ? "9+"
                  : notificationCount}
              </span>
            )}
          </div>

          <span>Уведомления</span>

          {isNotificationsActive && (
            <span
              className="
                absolute
                bottom-0.5
                w-5
                h-[2px]
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                to-blue-500
              "
            />
          )}
        </Link>
      </nav>
    </>
  );
};

export default Sidebar;