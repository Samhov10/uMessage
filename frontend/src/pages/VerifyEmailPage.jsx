import { useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  MailCheckIcon,
  LoaderCircleIcon,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  verifyEmail,
  resendVerificationCode,
  getAuthUser,
} from "../lib/api.js";

const VerifyEmailPage = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");

  const {
    mutate: verifyMutation,
    isPending,
  } = useMutation({
    mutationFn: verifyEmail,

    onSuccess: async () => {
      try {
        toast.success("Почта успешно подтверждена");

        const authData = await getAuthUser();

        queryClient.setQueryData(
          ["authUser"],
          authData
        );

        navigate("/onboarding", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "Ошибка получения пользователя после подтверждения:",
          error
        );

        toast.error(
          "Почта подтверждена, но авторизация не была сохранена"
        );
      }
    },

    onError: (error) => {
      console.error(
        "Ошибка подтверждения email:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Неверный код"
      );
    },
  });

  const {
    mutate: resendMutation,
    isPending: isResending,
  } = useMutation({
    mutationFn: resendVerificationCode,

    onSuccess: () => {
      toast.success("Новый код отправлен");
    },

    onError: (error) => {
      console.error(
        "Ошибка повторной отправки:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Ошибка отправки"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      toast.error(
        "Email не найден. Зарегистрируйтесь ещё раз."
      );

      return;
    }

    if (code.length !== 6) {
      toast.error(
        "Введите 6-значный код"
      );

      return;
    }

    verifyMutation({
      email,
      code,
    });
  };

  const handleResend = () => {
    if (!email) {
      toast.error(
        "Email не найден"
      );

      return;
    }

    resendMutation(email);
  };

  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        bg-base-100
        px-3
        py-4
        sm:px-5
        sm:py-6
        md:px-8
      "
      data-theme="forest"
    >
      <div
        className="
          w-full
          max-w-md
          bg-base-200
          rounded-2xl
          sm:rounded-3xl
          border
          border-base-300/70
          shadow-xl
          sm:shadow-2xl
          shadow-black/20
          px-4
          py-6
          min-[360px]:px-5
          sm:p-8
        "
      >
        {/* ICON + TITLE */}

        <div className="text-center">
          <div
            className="
              w-14
              h-14
              sm:w-16
              sm:h-16
              rounded-2xl
              bg-cyan-400/10
              flex
              items-center
              justify-center
              mx-auto
              mb-4
              sm:mb-5
            "
          >
            <MailCheckIcon
              className="
                w-7
                h-7
                sm:w-8
                sm:h-8
                text-cyan-400
              "
            />
          </div>

          <h1
            className="
              text-xl
              sm:text-2xl
              font-bold
            "
          >
            Подтвердите почту
          </h1>

          <p
            className="
              text-xs
              sm:text-sm
              text-base-content/55
              mt-2
            "
          >
            Мы отправили 6-значный код на
          </p>

          <p
            className="
              text-cyan-400
              text-xs
              sm:text-sm
              font-medium
              mt-1
              break-all
              px-2
            "
          >
            {email || "Email не найден"}
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="
            mt-6
            sm:mt-7
          "
        >
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const value =
                e.target.value.replace(
                  /\D/g,
                  ""
                );

              setCode(value);
            }}
            placeholder="000000"
            className="
              input
              input-bordered
              w-full
              h-14
              sm:h-16
              rounded-xl
              text-center
              text-2xl
              min-[380px]:text-3xl
              tracking-[0.30em]
              min-[380px]:tracking-[0.45em]
              px-3
              font-semibold
              focus:outline-none
              focus:border-cyan-400
            "
          />

          <button
            type="submit"
            disabled={
              isPending ||
              code.length !== 6 ||
              !email
            }
            className="
              btn
              w-full
              min-h-11
              sm:min-h-12
              mt-4
              sm:mt-5
              rounded-xl
              border-none
              bg-gradient-to-r
              from-cyan-700
              to-blue-700
              hover:from-cyan-600
              hover:to-blue-600
              active:scale-[0.99]
              text-white
              text-sm
              sm:text-base
              shadow-lg
              shadow-cyan-950/20
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isPending ? (
              <>
                <LoaderCircleIcon
                  className="
                    w-5
                    h-5
                    animate-spin
                    shrink-0
                  "
                />

                Проверяем...
              </>
            ) : (
              "Подтвердить почту"
            )}
          </button>
        </form>

        {/* RESEND */}

        <div
          className="
            text-center
            mt-5
            sm:mt-6
          "
        >
          <p
            className="
              text-xs
              sm:text-sm
              text-base-content/55
            "
          >
            Не получили код?
          </p>

          <button
            type="button"
            disabled={
              isResending ||
              !email
            }
            onClick={handleResend}
            className="
              mt-2
              min-h-10
              px-3
              rounded-lg
              text-cyan-400
              hover:text-cyan-300
              hover:bg-cyan-400/5
              active:scale-[0.98]
              text-xs
              sm:text-sm
              font-medium
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isResending
              ? "Отправляем..."
              : "Отправить код повторно"}
          </button>
        </div>

        {/* HELP */}

        <div
          className="
            mt-5
            pt-4
            border-t
            border-base-300/60
            text-center
          "
        >
          <p
            className="
              text-[10px]
              min-[360px]:text-[11px]
              sm:text-xs
              text-base-content/40
              leading-relaxed
            "
          >
            Проверьте папку «Спам», если письмо не
            появилось во входящих.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;