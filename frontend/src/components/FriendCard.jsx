import { Link } from "react-router";

const FriendCard = ({ friend, unread }) => {
  const unreadCount = unread?.count || 0;

  const lastMessage =
    unread?.lastMessage ||
    "Нажмите, чтобы начать общение";

  return (
    <Link
      to={`/chat/${friend._id}`}
      className="
        flex
        items-center
        gap-3
        px-4
        py-3
        bg-base-200
        hover:bg-base-300
        transition-colors
        rounded-xl
      "
    >

      <div className="avatar shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden">

          <img
            src={friend.profilePic}
            alt={friend.fullName}
            className="w-full h-full object-cover"
          />

        </div>
      </div>

      <div className="flex-1 min-w-0">

        <div className="flex items-center justify-between gap-2">

          <h3 className="font-semibold text-base truncate">
            {friend.fullName}
          </h3>

          {unreadCount > 0 && (
            <span
              className="
                min-w-6
                h-6
                px-2
                flex
                items-center
                justify-center
                rounded-full
                bg-cyan-500
                text-white
                text-xs
                font-bold
              "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

        </div>

        <p
          className={`
            text-sm
            truncate
            mt-1
            ${
              unreadCount > 0
                ? "text-base-content font-semibold"
                : "text-base-content/50"
            }
          `}
        >
          {lastMessage}
        </p>

      </div>

    </Link>
  );
};

export default FriendCard;