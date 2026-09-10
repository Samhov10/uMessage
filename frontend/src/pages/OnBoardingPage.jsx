import { useState } from "react";

import { useNavigate } from "react-router";

import useAuthUser from "../hooks/useAuthUser.js";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { completeOnboarding } from "../lib/api.js";

import {
  LoaderIcon,
  MapPinIcon,
  CameraIcon,
  UserIcon,
} from "lucide-react";

import toast from "react-hot-toast";

const OnBoardingPage = () => {
  const { authUser } = useAuthUser();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [formState, setFormState] = useState({
  fullName: authUser?.fullName || "",
  bio: authUser?.bio || "Здравствуйте, я использую uMessage.",
  location: authUser?.location || "",
  profilePic: authUser?.profilePic || "",
});

  const [profileImage, setProfileImage] = useState(null);

  const {
    mutate: onboardingMutation,
    isPending,
  } = useMutation({
    mutationFn: completeOnboarding,

    onSuccess: async () => {
      toast.success("Профиль успешно заполнен");

      await queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });

      navigate("/homepage", {
        replace: true,
      });
    },

    onError: (error) => {
      console.error(
        "Ошибка сохранения профиля:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Не удалось сохранить профиль"
      );
    },
  });

  // ================= SUBMIT =================

  const handleSubmit = (e) => {
  e.preventDefault();

  const data = new FormData();

  data.append("fullName", formState.fullName.trim());
  data.append("bio", formState.bio.trim());

  if (profileImage) {
    data.append("profilePic", profileImage);
  }
    onboardingMutation(data);
  };

  // ================= IMAGE =================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setProfileImage(file);

    const imageUrl =
      URL.createObjectURL(file);

    setFormState((prev) => ({
      ...prev,
      profilePic: imageUrl,
    }));
  };

  return (
    <div
      className="
        min-h-screen
        bg-base-100
        flex
        items-center
        justify-center
        p-4
        sm:p-6
      "
      data-theme="forest"
    >
      <div
        className="
          w-full
          max-w-2xl
          bg-base-200
          border
          border-base-300/70
          rounded-3xl
          shadow-2xl
          shadow-black/20
          overflow-hidden
        "
      >
        <div className="p-6 sm:p-10">

          {/* HEADER */}

          <div className="text-center mb-8">
            <div
              className="
                w-14
                h-14
                mx-auto
                mb-4
                rounded-2xl
                bg-cyan-400/10
                border
                border-cyan-400/20
                flex
                items-center
                justify-center
              "
            >
              <UserIcon
                className="
                  w-7
                  h-7
                  text-cyan-400
                "
              />
            </div>

            <h1
              className="
                text-2xl
                sm:text-3xl
                font-bold
              "
            >
              Настройте свой профиль
            </h1>

            <p
              className="
                text-sm
                text-base-content/50
                mt-2
              "
            >
              Добавьте информацию о себе,
              чтобы друзья могли узнать вас.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ================= PROFILE PHOTO ================= */}

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-4
              "
            >
              <div
                className="
                  relative
                  w-32
                  h-32
                  rounded-full
                  bg-base-300
                  overflow-hidden
                  ring-4
                  ring-cyan-400/10
                  border
                  border-cyan-400/20
                "
              >
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Аватар профиля"
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                    onError={(e) => {
                      e.currentTarget.src =
                        "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      h-full
                    "
                  >
                    <CameraIcon
                      className="
                        size-12
                        text-base-content/30
                      "
                    />
                  </div>
                )}
              </div>

              <label
                className="
                  btn
                  bg-cyan-800
                  hover:bg-cyan-700
                  border-none
                  text-white
                  rounded-xl
                  cursor-pointer
                "
              >
                <CameraIcon className="size-4" />

                Выбрать аватарку

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              <p
                className="
                  text-xs
                  text-base-content/40
                "
              >
                Вы можете изменить фотографию позже
              </p>
            </div>

            {/* ================= NAME ================= */}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">
                  Имя и фамилия
                </span>
              </label>

              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="
                  input
                  input-bordered
                  w-full
                  rounded-xl
                  focus:outline-none
                  focus:border-cyan-400
                "
                placeholder="Введите ваше имя и фамилию"
                required
              />
            </div>

            {/* ================= BIO ================= */}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">
                  О себе
                </span>
              </label>

              <textarea
                name="bio"
                value={formState.bio}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                className="
                  textarea
                  textarea-bordered
                  w-full
                  h-28
                  resize-none
                  rounded-xl
                  focus:outline-none
                  focus:border-cyan-400
                "
                placeholder="Расскажите немного о себе..."
                maxLength={250}
                required
              />

              <div
                className="
                  flex
                  justify-end
                  mt-1.5
                "
              >
                <span
                  className="
                    text-xs
                    text-base-content/35
                  "
                >
                  {formState.bio.length}/250
                </span>
              </div>
            </div>
            {/* ================= BUTTON ================= */}

            <button
              type="submit"
              disabled={isPending}
              className="
                btn
                w-full
                min-h-12
                rounded-xl
                border-none
                bg-gradient-to-r
                from-cyan-700
                to-blue-700
                hover:from-cyan-600
                hover:to-blue-600
                text-white
                shadow-lg
                shadow-cyan-950/20
                disabled:opacity-60
              "
            >
              {!isPending ? (
                "Завершить настройку"
              ) : (
                <>
                  <LoaderIcon
                    className="
                      animate-spin
                      size-5
                    "
                  />

                  Сохранение профиля...
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default OnBoardingPage;