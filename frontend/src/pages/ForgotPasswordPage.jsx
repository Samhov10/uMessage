import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router";

import {
  useMutation,
} from "@tanstack/react-query";

import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  MailIcon,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  forgotPassword,
  resetPassword,
} from "../lib/api.js";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] =
    useState(1);

  const [email, setEmail] =
    useState("");

  const [code, setCode] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const {
    mutate: sendCodeMutation,
    isPending: isSending,
  } = useMutation({
    mutationFn:
      forgotPassword,

    onSuccess: () => {
      toast.success(
        "Код отправлен на вашу почту"
      );

      setStep(2);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data
          ?.message ||
          "Ошибка отправки"
      );
    },
  });

  const {
    mutate: resetMutation,
    isPending: isResetting,
  } = useMutation({
    mutationFn:
      resetPassword,

    onSuccess: () => {
      toast.success(
        "Пароль успешно изменён"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data
          ?.message ||
          "Не удалось изменить пароль"
      );
    },
  });

  const handleSendCode = (
    e
  ) => {
    e.preventDefault();

    sendCodeMutation(
      email.trim()
    );
  };

  const handleReset = (
    e
  ) => {
    e.preventDefault();

    if (
      code.length !== 6
    ) {
      toast.error(
        "Введите 6-значный код"
      );

      return;
    }

    if (
      password.length < 6
    ) {
      toast.error(
        "Минимум 6 символов"
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      toast.error(
        "Пароли не совпадают"
      );

      return;
    }

    resetMutation({
      email:
        email.trim(),

      code,

      password,
    });
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
          border
          border-base-300/70
          rounded-2xl
          sm:rounded-3xl
          shadow-xl
          sm:shadow-2xl
          shadow-black/20
          px-4
          py-5
          min-[360px]:px-5
          sm:p-8
        "
      >
        {/* BACK */}

        <Link
          to="/login"
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            sm:text-sm
            text-base-content/55
            hover:text-cyan-400
            transition-colors
            mb-5
            sm:mb-6
          "
        >
          <ArrowLeftIcon
            className="
              w-4
              h-4
              shrink-0
            "
          />

          Назад ко входу
        </Link>

        {/* HEADER */}

        <div className="text-center">
          <div
            className="
              w-14
              h-14
              sm:w-16
              sm:h-16
              mx-auto
              rounded-2xl
              bg-cyan-400/10
              flex
              items-center
              justify-center
            "
          >
            {step === 1 ? (
              <MailIcon
                className="
                  w-7
                  h-7
                  sm:w-8
                  sm:h-8
                  text-cyan-400
                "
              />
            ) : (
              <KeyRoundIcon
                className="
                  w-7
                  h-7
                  sm:w-8
                  sm:h-8
                  text-cyan-400
                "
              />
            )}
          </div>

          <h1
            className="
              text-xl
              sm:text-2xl
              font-bold
              mt-4
              sm:mt-5
            "
          >
            {step === 1
              ? "Забыли пароль?"
              : "Создайте новый пароль"}
          </h1>

          <p
            className="
              text-xs
              sm:text-sm
              text-base-content/55
              mt-2
              leading-relaxed
              break-words
            "
          >
            {step === 1
              ? "Введите почту, привязанную к вашему аккаунту."
              : "Код отправлен на"}
          </p>

          {step === 2 && (
            <p
              className="
                mt-1
                text-xs
                sm:text-sm
                font-medium
                text-cyan-400
                break-all
                px-2
              "
            >
              {email}
            </p>
          )}
        </div>

        {/* ================= STEP 1 ================= */}

        {step === 1 && (
          <form
            onSubmit={
              handleSendCode
            }
            className="
              mt-6
              sm:mt-7
            "
          >
            <div className="form-control w-full">
              <label className="label py-1.5">
                <span
                  className="
                    label-text
                    text-xs
                    sm:text-sm
                  "
                >
                  Электронная почта
                </span>
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="example@gmail.com"
                className="
                  input
                  input-bordered
                  w-full
                  min-w-0
                  h-11
                  sm:h-12
                  px-3
                  sm:px-4
                  text-sm
                  sm:text-base
                  rounded-xl
                  focus:outline-none
                  focus:border-cyan-400
                "
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={
                isSending
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
                disabled:opacity-60
              "
            >
              {isSending ? (
                <>
                  <LoaderCircleIcon
                    className="
                      animate-spin
                      w-5
                      h-5
                      shrink-0
                    "
                  />

                  Отправляем...
                </>
              ) : (
                "Отправить код"
              )}
            </button>
          </form>
        )}

        {/* ================= STEP 2 ================= */}

        {step === 2 && (
          <form
            onSubmit={
              handleReset
            }
            className="
              mt-6
              sm:mt-7
              space-y-4
            "
          >
            {/* CODE */}

            <div className="form-control w-full">
              <label className="label py-1.5">
                <span
                  className="
                    label-text
                    text-xs
                    sm:text-sm
                  "
                >
                  Код подтверждения
                </span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        6
                      )
                  )
                }
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
                  font-semibold
                  px-3
                  focus:outline-none
                  focus:border-cyan-400
                "
              />
            </div>

            {/* PASSWORD */}

            <div className="form-control w-full">
              <label className="label py-1.5">
                <span
                  className="
                    label-text
                    text-xs
                    sm:text-sm
                  "
                >
                  Новый пароль
                </span>
              </label>

              <div className="relative w-full">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    password
                  }
                  onChange={(
                    e
                  ) =>
                    setPassword(
                      e.target
                        .value
                    )
                  }
                  className="
                    input
                    input-bordered
                    w-full
                    min-w-0
                    h-11
                    sm:h-12
                    pl-3
                    sm:pl-4
                    pr-12
                    text-sm
                    sm:text-base
                    rounded-xl
                    focus:outline-none
                    focus:border-cyan-400
                  "
                  placeholder="Новый пароль"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Скрыть пароль"
                      : "Показать пароль"
                  }
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  className="
                    absolute
                    right-2
                    top-1/2
                    -translate-y-1/2
                    w-9
                    h-9
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-base-content/45
                    hover:text-cyan-400
                    hover:bg-cyan-400/10
                    active:scale-95
                    transition-all
                  "
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-control w-full">
              <label className="label py-1.5">
                <span
                  className="
                    label-text
                    text-xs
                    sm:text-sm
                  "
                >
                  Повторите пароль
                </span>
              </label>

              <div className="relative w-full">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="
                    input
                    input-bordered
                    w-full
                    min-w-0
                    h-11
                    sm:h-12
                    pl-3
                    sm:pl-4
                    pr-12
                    text-sm
                    sm:text-base
                    rounded-xl
                    focus:outline-none
                    focus:border-cyan-400
                  "
                  placeholder="Повторите новый пароль"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Скрыть пароль"
                      : "Показать пароль"
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  className="
                    absolute
                    right-2
                    top-1/2
                    -translate-y-1/2
                    w-9
                    h-9
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-base-content/45
                    hover:text-cyan-400
                    hover:bg-cyan-400/10
                    active:scale-95
                    transition-all
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p
                  className={`
                    mt-1.5
                    text-[11px]
                    sm:text-xs
                    ${
                      password ===
                      confirmPassword
                        ? "text-cyan-400"
                        : "text-red-400"
                    }
                  `}
                >
                  {password ===
                  confirmPassword
                    ? "Пароли совпадают"
                    : "Пароли не совпадают"}
                </p>
              )}
            </div>

            {/* RESET BUTTON */}

            <button
              type="submit"
              disabled={
                isResetting
              }
              className="
                btn
                w-full
                min-h-11
                sm:min-h-12
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
                disabled:opacity-60
              "
            >
              {isResetting ? (
                <>
                  <LoaderCircleIcon
                    className="
                      animate-spin
                      w-5
                      h-5
                      shrink-0
                    "
                  />

                  Изменяем...
                </>
              ) : (
                "Изменить пароль"
              )}
            </button>

            {/* CHANGE EMAIL */}

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="
                w-full
                min-h-10
                rounded-lg
                text-xs
                sm:text-sm
                text-base-content/50
                hover:text-cyan-400
                hover:bg-cyan-400/5
                transition-all
              "
            >
              Использовать другую почту
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;