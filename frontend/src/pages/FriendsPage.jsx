import { useQuery } from "@tanstack/react-query";
import {
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import {
  getUserFriends,
  getRecommendedUsers,
  sendFriendRequest,
} from "../lib/api.js";

const FriendsPage = () => {
  const {
    data: friendsData,
    isLoading: isFriendsLoading,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const {
    data: recommendedUsers,
    isLoading: isRecommendedLoading,
  } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  const friends =
    friendsData?.friends ||
    friendsData ||
    [];

  const users =
    recommendedUsers?.recommendedUsers ||
    recommendedUsers?.users ||
    recommendedUsers ||
    [];

  const handleAddFriend = async (userId) => {
    try {
      await sendFriendRequest(userId);
    } catch (error) {
      console.error(
        "Ошибка отправки заявки:",
        error
      );
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-base-100">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Друзья
          </h1>

          <p className="text-base-content/50 mt-1">
            Управляйте друзьями и находите новых людей
          </p>
        </div>

        {/* CURRENT FRIENDS */}

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <UsersIcon className="w-6 h-6 text-cyan-400" />

            <h2 className="text-2xl font-semibold">
              Ваши друзья
            </h2>
          </div>

          {isFriendsLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-cyan-400" />
            </div>
          ) : friends.length === 0 ? (
            <div
              className="
                rounded-2xl
                border
                border-base-300
                bg-base-200/40
                p-8
                text-center
              "
            >
              <h3 className="font-semibold text-lg">
                Пока здесь пусто
              </h3>

              <p className="text-sm text-base-content/50 mt-2">
                Добавьте новых друзей для общения
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-4
              "
            >
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="
                    rounded-2xl
                    border
                    border-base-300
                    bg-base-200/30
                    p-4
                    flex
                    items-center
                    gap-4
                  "
                >
                  <div className="avatar">
                    <div className="w-14 rounded-full">
                      <img
                        src={friend.profilePic}
                        alt={friend.fullName}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {friend.fullName}
                    </p>

                    <p className="text-xs text-base-content/45 truncate">
                      {friend.bio ||
                        "Пользователь uMessage"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECOMMENDED USERS */}

        <section>
          <div className="flex items-center gap-3 mb-5">
            <UserPlusIcon className="w-6 h-6 text-cyan-400" />

            <h2 className="text-2xl font-semibold">
              Найти новых друзей
            </h2>
          </div>

          {isRecommendedLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-cyan-400" />
            </div>
          ) : users.length === 0 ? (
            <div
              className="
                rounded-2xl
                border
                border-base-300
                p-8
                text-center
              "
            >
              <h3 className="font-semibold text-lg">
                Нет рекомендуемых пользователей
              </h3>

              <p className="text-sm text-base-content/50 mt-2">
                Новые пользователи появятся здесь позже
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-4
              "
            >
              {users.map((user) => (
                <div
                  key={user._id}
                  className="
                    rounded-2xl
                    border
                    border-base-300
                    bg-base-200/30
                    p-5
                  "
                >
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-14 rounded-full">
                        <img
                          src={user.profilePic}
                          alt={user.fullName}
                        />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">
                        {user.fullName}
                      </p>

                      <p className="text-xs text-base-content/45 truncate">
                        {user.bio ||
                          "Пользователь uMessage"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleAddFriend(user._id)
                    }
                    className="
                      btn
                      btn-sm
                      w-full
                      mt-4
                      border-none
                      bg-gradient-to-r
                      from-cyan-600
                      to-blue-600
                      text-white
                    "
                  >
                    <UserPlusIcon className="w-4 h-4" />

                    Добавить в друзья
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FriendsPage;