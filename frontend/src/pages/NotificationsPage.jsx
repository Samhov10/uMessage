import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
  UserPlusIcon,
} from "lucide-react";

import {
  acceptFriendRequests,
  getFriendRequests,
} from "../lib/api";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequests,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["friendRequests"],
      });

      queryClient.invalidateQueries({
        queryKey: ["friends"],
      });
    },

    onError: (error) => {
      console.error(
        "Ошибка принятия заявки:",
        error.response?.data || error.message
      );
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-5xl">

        {/* ================= HEADER ================= */}

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Уведомления
            </h1>

            <p className="text-sm opacity-50 mt-2">
              Оставайтесь в курсе новых знакомств и заявок
            </p>
          </div>

          {/* Количество уведомлений */}
          {(incomingRequests.length + acceptedRequests.length) > 0 && (
            <div className="
              hidden sm:flex
              items-center gap-2
              px-4 py-2
              rounded-full
              bg-[#1d5870]
              text-white
              text-sm font-semibold
            ">
              <BellIcon className="w-4 h-4" />

              {incomingRequests.length + acceptedRequests.length}
              {" "}
              уведомлений
            </div>
          )}
        </div>


        {/* ================= INVITATIONS ================= */}

        {incomingRequests.length > 0 && (
          <section className="mb-12">

            {/* Заголовок */}

            <div className="flex items-center gap-3 mb-5">

              <div className="
                flex items-center justify-center
                w-10 h-10
                rounded-full
                bg-[#16495d]
                border border-[#1d6985]
              ">
                <UserPlusIcon className="w-5 h-5 text-info" />
              </div>

              <div>
                <div className="flex items-center gap-2">

                  <h2 className="text-2xl font-bold">
                    Приглашения в друзья
                  </h2>

                  <span className="
                    flex items-center justify-center
                    min-w-6 h-6
                    px-2
                    rounded-full
                    bg-[#205e76]
                    text-white
                    text-xs
                    font-bold
                  ">
                    {incomingRequests.length}
                  </span>

                </div>

                <p className="text-sm opacity-50 mt-1">
                  Люди хотят добавить вас в друзья
                </p>
              </div>

            </div>


            {/* Invitation cards */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {incomingRequests.map((request) => (

                <div
                  key={request._id}
                  className="
                    group
                    rounded-2xl
                    bg-base-200/20
                    border border-[#24404d]

                    p-5

                    hover:border-[#287b9c]
                    hover:bg-base-200/40

                    transition-all duration-200
                  "
                >

                  <div className="flex items-center gap-4">

                    {/* Avatar */}

                    <div className="avatar shrink-0">

                      <div className="
                        w-16 h-16
                        rounded-full
                        ring-2
                        ring-[#205e76]
                        ring-offset-2
                        ring-offset-base-100
                      ">

                        <img
                          src={request.sender.profilePic}
                          alt={request.sender.fullName}
                        />

                      </div>

                    </div>


                    {/* User information */}

                    <div className="flex-1 min-w-0">

                      <h3 className="
                        font-bold
                        text-lg
                        truncate
                      ">
                        {request.sender.fullName}
                      </h3>

                      <div className="
                        flex
                        flex-wrap
                        gap-2
                        mt-2
                      ">

                        <span className="
                          badge
                          bg-[#205e76]
                          border-none
                          text-white
                          text-xs
                        ">
                          Родной: {request.sender.nativeLanguage}
                        </span>

                        <span className="
                          badge
                          badge-outline
                          border-[#287b9c]
                          text-info
                          text-xs
                        ">
                          Изучает: {request.sender.learningLanguage}
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* Button */}

                  <button
                    className="
                      btn
                      w-full
                      mt-5

                      rounded-xl

                      bg-[#205e76]
                      hover:bg-[#287b9c]

                      border-none
                      text-white

                      font-semibold
                    "
                    onClick={() =>
                      acceptRequestMutation(request._id)
                    }
                    disabled={isPending}
                  >

                    {isPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <UserCheckIcon className="w-4 h-4" />
                        Принять заявку
                      </>
                    )}

                  </button>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* ================= NEW FRIENDS ================= */}

        {acceptedRequests.length > 0 && (
          <section>

            {/* Section header */}

            <div className="flex items-center gap-3 mb-5">

              <div className="
                flex items-center justify-center
                w-10 h-10
                rounded-full
                bg-[#16495d]
                border border-[#1d6985]
              ">
                <BellIcon className="w-5 h-5 text-info" />
              </div>

              <div>

                <h2 className="text-2xl font-bold">
                  Новое знакомство
                </h2>

                <p className="text-sm opacity-50 mt-1">
                  Ваши новые друзья
                </p>

              </div>

            </div>


            {/* Notifications */}

            <div className="space-y-3">

              {acceptedRequests.map((notification) => (

                <div
                  key={notification._id}
                  className="
                    group
                    flex
                    items-center
                    gap-4

                    p-5

                    rounded-2xl

                    bg-base-200/20
                    border border-[#24404d]

                    hover:border-[#287b9c]
                    hover:bg-base-200/40

                    transition-all duration-200
                  "
                >

                  {/* Avatar */}

                  <div className="avatar shrink-0">

                    <div className="
                      w-14 h-14
                      rounded-full

                      ring-2
                      ring-[#205e76]
                      ring-offset-2
                      ring-offset-base-100
                    ">

                      <img
                        src={notification.recipient.profilePic}
                        alt={notification.recipient.fullName}
                      />

                    </div>

                  </div>


                  {/* Text */}

                  <div className="flex-1 min-w-0">

                    <h3 className="font-bold text-lg truncate">
                      {notification.recipient.fullName}
                    </h3>

                    <p className="text-sm opacity-70 mt-1">
                      Принял(а) вашу заявку в друзья
                    </p>

                    <div className="
                      flex
                      items-center
                      gap-1.5
                      mt-2

                      text-xs
                      opacity-40
                    ">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>Недавно</span>
                    </div>

                  </div>


                  {/* New friend badge */}

                  <div className="
                    hidden sm:flex

                    items-center
                    gap-2

                    px-4
                    py-2

                    rounded-full

                    bg-[#16495d]
                    border border-[#1d6985]

                    text-info

                    text-xs
                    font-semibold
                  ">

                    <MessageSquareIcon className="w-4 h-4" />

                    Новый друг

                  </div>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* ================= EMPTY STATE ================= */}

        {incomingRequests.length === 0 &&
          acceptedRequests.length === 0 && (

            <div className="
              flex
              flex-col
              items-center
              justify-center

              min-h-[400px]

              rounded-2xl

              border
              border-[#24404d]

              bg-base-200/20
            ">

              <div className="
                flex
                items-center
                justify-center

                w-20
                h-20

                rounded-full

                bg-[#16495d]
                border border-[#1d6985]

                mb-5
              ">

                <BellIcon className="w-9 h-9 text-info" />

              </div>

              <h2 className="text-xl font-bold">
                Пока нет уведомлений
              </h2>

              <p className="text-sm opacity-50 mt-2">
                Здесь появятся ваши новые заявки и знакомства
              </p>

            </div>

          )}

      </div>
    </div>
  );
};

export default NotificationsPage;