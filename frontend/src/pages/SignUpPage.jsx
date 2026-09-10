import { useState } from "react";

import { Link } from "react-router";

import {
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  MailCheckIcon,
  XCircleIcon,
} from "lucide-react";

import UseSignUp from "../hooks/UseSignUp.js";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [localError, setLocalError] = useState("");

  const { isPending, error, signupMutation } = UseSignUp();

  // ================= EMAIL =================

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    signupData.email
  );

  // ================= PASSWORD =================

  const passwordsMatch =
    confirmPassword.length > 0 &&
    signupData.password === confirmPassword;

  const getPasswordStrength = () => {
    const password = signupData.password;

    if (!password) {
      return {
        level: 0,
        text: "",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        level: 1,
        text: "Слабый пароль",
      };
    }

    if (score <= 3) {
      return {
        level: 2,
        text: "Средний пароль",
      };
    }

    return {
      level: 3,
      text: "Надёжный пароль",
    };
  };

  const passwordStrength = getPasswordStrength();

  // ================= ERROR =================

  const getErrorMessage = () => {
    if (localError) {
      return localError;
    }

    const serverMessage =
      error?.response?.data?.message ||
      error?.message ||
      "";

    if (
      serverMessage.includes("Пользователь с таким адресом") ||
      serverMessage.includes("уже существует") ||
      serverMessage.includes("уже используется") ||
      serverMessage.toLowerCase().includes("email already")
    ) {
      return "Данный адрес электронной почты уже используется";
    }

    if (
      serverMessage.includes("Пароль должен содержать") ||
      serverMessage.toLowerCase().includes("password")
    ) {
      return "Пароль должен состоять минимум из 6 символов";
    }

    return (
      serverMessage ||
      "Произошла ошибка при регистрации"
    );
  };

  // ================= SUBMIT =================

  const handleSignup = (e) => {
    e.preventDefault();

    setLocalError("");

    if (signupData.fullName.trim().length < 2) {
      setLocalError(
        "Имя пользователя должно содержать минимум 2 символа"
      );

      return;
    }

    if (!isEmailValid) {
      setLocalError(
        "Введите корректный адрес электронной почты"
      );

      return;
    }

    if (signupData.password.length < 6) {
      setLocalError(
        "Пароль должен содержать минимум 6 символов"
      );

      return;
    }

    if (signupData.password !== confirmPassword) {
      setLocalError("Пароли не совпадают");

      return;
    }

    if (!acceptedTerms) {
      setLocalError(
        "Необходимо принять условия использования"
      );

      return;
    }

    signupMutation({
      fullName: signupData.fullName.trim(),
      email: signupData.email.trim(),
      password: signupData.password,
    });
  };

  return (
    <div
      className="
        min-h-screen
        w-full
        bg-base-100
        flex
        items-center
        justify-center
        px-3
        py-4
        sm:px-5
        sm:py-6
        md:px-8
        md:py-8
      "
      data-theme="forest"
    >
      <div
        className="
          w-full
          max-w-[1050px]
          mx-auto
          flex
          flex-col
          lg:flex-row
          bg-base-100
          rounded-2xl
          sm:rounded-3xl
          border
          border-base-300/60
          shadow-xl
          sm:shadow-2xl
          shadow-black/20
          overflow-hidden
        "
      >
        {/* ================= LEFT ================= */}

        <div
          className="
            w-full
            lg:w-1/2
            px-4
            py-5
            sm:px-6
            sm:py-7
            md:px-8
            md:py-8
            lg:p-9
            flex
            flex-col
          "
        >
          {/* LOGO */}

          <Link
            to="/"
            className="
              mb-5
              sm:mb-6
              flex
              items-center
              justify-start
              gap-1.5
              sm:gap-2
              w-fit
              max-w-full
            "
          >
            <img
              src="/umessagelogo.png"
              alt="uMessage Logo"
              className="
                w-14
                h-14
                sm:w-16
                sm:h-16
                md:w-20
                md:h-20
                object-contain
                shrink-0
              "
            />

            <span
              className="
                text-2xl
                min-[380px]:text-3xl
                sm:text-4xl
                font-extrabold
                font-mono
                tracking-tight
                bg-gradient-to-r
                from-cyan-400
                via-sky-500
                to-blue-600
                bg-clip-text
                text-transparent
                whitespace-nowrap
              "
            >
              uMessage
            </span>
          </Link>

          {/* TITLE */}

          <div className="mb-5">
            <h2
              className="
                text-lg
                min-[380px]:text-xl
                sm:text-2xl
                font-semibold
              "
            >
              Регистрация аккаунта
            </h2>

            <p
              className="
                text-xs
                sm:text-sm
                text-base-content/55
                mt-1.5
                leading-relaxed
              "
            >
              uMessage — общайтесь с людьми, где бы вы ни
              находились.
            </p>
          </div>

          {/* ERROR */}

          {(error || localError) && (
            <div
              className="
                flex
                items-start
                gap-2.5
                sm:gap-3
                mb-5
                px-3
                sm:px-4
                py-3
                rounded-xl
                border
                border-red-500/25
                bg-red-500/10
                text-red-400
              "
            >
              <XCircleIcon
                className="
                  w-5
                  h-5
                  shrink-0
                  mt-0.5
                "
              />

              <span
                className="
                  text-xs
                  sm:text-sm
                  font-medium
                  leading-relaxed
                  break-words
                  min-w-0
                "
              >
                {getErrorMessage()}
              </span>
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSignup}
            className="w-full"
          >
            <div
              className="
                space-y-3.5
                sm:space-y-4
              "
            >
              {/* NAME */}

              <div className="form-control w-full">
                <label className="label py-1.5">
                  <span
                    className="
                      label-text
                      text-xs
                      sm:text-sm
                    "
                  >
                    Имя пользователя
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Введите ваше имя пользователя"
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
                  value={signupData.fullName}
                  onChange={(e) => {
                    setSignupData({
                      ...signupData,
                      fullName: e.target.value,
                    });

                    setLocalError("");
                  }}
                  required
                />
              </div>

              {/* EMAIL */}

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

                <div className="relative w-full">
                  <input
                    type="email"
                    placeholder="Введите ваш электронный адрес"
                    className="
                      input
                      input-bordered
                      w-full
                      min-w-0
                      h-11
                      sm:h-12
                      pl-3
                      sm:pl-4
                      pr-11
                      sm:pr-12
                      text-sm
                      sm:text-base
                      rounded-xl
                      focus:outline-none
                      focus:border-cyan-400
                    "
                    value={signupData.email}
                    onChange={(e) => {
                      setSignupData({
                        ...signupData,
                        email: e.target.value,
                      });

                      setLocalError("");
                    }}
                    required
                  />

                  {signupData.email.length > 0 &&
                    isEmailValid && (
                      <MailCheckIcon
                        className="
                          absolute
                          right-3
                          sm:right-4
                          top-1/2
                          -translate-y-1/2
                          w-4.5
                          h-4.5
                          sm:w-5
                          sm:h-5
                          text-cyan-400
                          pointer-events-none
                        "
                      />
                    )}
                </div>

                {signupData.email.length > 0 && (
                  <div className="mt-1.5">
                    {isEmailValid ? (
                      <p
                        className="
                          text-[11px]
                          sm:text-xs
                          text-cyan-400
                          flex
                          items-center
                          gap-1
                        "
                      >
                        <CheckCircle2Icon
                          className="
                            w-3.5
                            h-3.5
                            shrink-0
                          "
                        />

                        Адрес выглядит правильно
                      </p>
                    ) : (
                      <p
                        className="
                          text-[11px]
                          sm:text-xs
                          text-red-400
                        "
                      >
                        Введите корректный email
                      </p>
                    )}
                  </div>
                )}
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
                    Пароль
                  </span>
                </label>

                <div className="relative w-full">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Придумайте пароль"
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
                    value={signupData.password}
                    onChange={(e) => {
                      setSignupData({
                        ...signupData,
                        password: e.target.value,
                      });

                      setLocalError("");
                    }}
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
                        (prev) => !prev
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

                {/* STRENGTH */}

                {signupData.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1.5">
                      <div
                        className={`
                          h-1
                          flex-1
                          rounded-full
                          ${
                            passwordStrength.level >= 1
                              ? "bg-cyan-500"
                              : "bg-base-300"
                          }
                        `}
                      />

                      <div
                        className={`
                          h-1
                          flex-1
                          rounded-full
                          ${
                            passwordStrength.level >= 2
                              ? "bg-cyan-500"
                              : "bg-base-300"
                          }
                        `}
                      />

                      <div
                        className={`
                          h-1
                          flex-1
                          rounded-full
                          ${
                            passwordStrength.level >= 3
                              ? "bg-cyan-500"
                              : "bg-base-300"
                          }
                        `}
                      />
                    </div>

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-2
                        mt-1.5
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          min-[360px]:text-[11px]
                          sm:text-xs
                          text-base-content/50
                        "
                      >
                        Минимум 6 символов
                      </p>

                      <p
                        className={`
                          text-[10px]
                          min-[360px]:text-[11px]
                          sm:text-xs
                          text-right
                          ${
                            passwordStrength.level === 1
                              ? "text-red-400"
                              : passwordStrength.level === 2
                                ? "text-yellow-400"
                                : "text-cyan-400"
                          }
                        `}
                      >
                        {passwordStrength.text}
                      </p>
                    </div>
                  </div>
                )}
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
                    placeholder="Введите пароль ещё раз"
                    className={`
                      input
                      input-bordered
                      w-full
                      min-w-0
                      h-11
                      sm:h-12
                      pl-3
                      sm:pl-4
                      pr-20
                      text-sm
                      sm:text-base
                      rounded-xl
                      focus:outline-none
                      ${
                        confirmPassword.length > 0
                          ? passwordsMatch
                            ? "border-cyan-400"
                            : "border-red-400"
                          : ""
                      }
                    `}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(
                        e.target.value
                      );

                      setLocalError("");
                    }}
                    required
                  />

                  <div
                    className="
                      absolute
                      right-1.5
                      sm:right-2
                      top-1/2
                      -translate-y-1/2
                      flex
                      items-center
                      gap-0.5
                      sm:gap-1
                    "
                  >
                    {confirmPassword.length > 0 &&
                      (passwordsMatch ? (
                        <CheckCircle2Icon
                          className="
                            w-4
                            h-4
                            sm:w-5
                            sm:h-5
                            text-cyan-400
                            shrink-0
                          "
                        />
                      ) : (
                        <XCircleIcon
                          className="
                            w-4
                            h-4
                            sm:w-5
                            sm:h-5
                            text-red-400
                            shrink-0
                          "
                        />
                      ))}

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Скрыть пароль"
                          : "Показать пароль"
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="
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
                </div>

                {confirmPassword.length > 0 && (
                  <p
                    className={`
                      text-[11px]
                      sm:text-xs
                      mt-1.5
                      ${
                        passwordsMatch
                          ? "text-cyan-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {passwordsMatch
                      ? "Пароли совпадают"
                      : "Пароли не совпадают"}
                  </p>
                )}
              </div>

              {/* TERMS */}

              <div className="form-control pt-1">
                <label
                  className="
                    flex
                    items-start
                    gap-2.5
                    sm:gap-3
                    cursor-pointer
                    px-3
                    py-3
                    rounded-xl
                    border
                    border-base-300/70
                    hover:border-cyan-400/30
                    transition-all
                  "
                >
                  <input
                    type="checkbox"
                    className="
                      checkbox
                      checkbox-sm
                      checkbox-info
                      mt-0.5
                      shrink-0
                    "
                    checked={acceptedTerms}
                    onChange={(e) =>
                      setAcceptedTerms(
                        e.target.checked
                      )
                    }
                  />

                  <span
                    className="
                      min-w-0
                      text-[11px]
                      sm:text-xs
                      leading-relaxed
                      text-base-content/70
                    "
                  >
                    Я согласен(на) с{" "}
                    <span
                      className="
                        text-cyan-400
                        hover:underline
                      "
                    >
                      Условиями использования
                    </span>{" "}
                    и{" "}
                    <span
                      className="
                        text-cyan-400
                        hover:underline
                      "
                    >
                      политикой конфиденциальности
                    </span>
                  </span>
                </label>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={isPending}
                className="
                  btn
                  w-full
                  min-h-11
                  sm:min-h-12
                  border-none
                  rounded-xl
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
                  mt-2
                "
              >
                {isPending ? (
                  <>
                    <LoaderCircleIcon
                      className="
                        w-5
                        h-5
                        animate-spin
                      "
                    />

                    <span className="truncate">
                      Создание аккаунта...
                    </span>
                  </>
                ) : (
                  "Создать аккаунт"
                )}
              </button>

              {/* LOGIN */}

              <div
                className="
                  text-center
                  pt-1
                  pb-1
                "
              >
                <p
                  className="
                    text-xs
                    sm:text-sm
                    leading-relaxed
                  "
                >
                  У вас уже есть аккаунт?{" "}

                  <Link
                    to="/login"
                    className="
                      text-cyan-400
                      hover:text-cyan-300
                      hover:underline
                      transition-colors
                      font-medium
                    "
                  >
                    Войти
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* ================= RIGHT ================= */}

        <div
          className="
            hidden
            lg:flex
            w-1/2
            items-center
            justify-center
            relative
            overflow-hidden
          "
        >
          <div
            className="
              max-w-md
              w-full
              p-8
            "
          >
            <div
              className="
                relative
                aspect-square
                max-w-sm
                mx-auto
                flex
                items-center
                justify-center
              "
            >
              <img
                src="/i.png"
                alt="Иллюстрация общения без границ"
                className="
                  w-full
                  h-full
                  object-contain
                  scale-150
                  drop-shadow-2xl
                "
              />
            </div>

            <div
              className="
                text-center
                space-y-3
                mt-12
              "
            >
              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Общайтесь с людьми со всего мира
              </h2>

              <p
                className="
                  text-sm
                  text-base-content/55
                  leading-relaxed
                "
              >
                Общайтесь, заводите друзей и вместе
                общайтесь с uMessage.
              </p>

              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-4
                  pt-3
                  text-xs
                  text-base-content/40
                "
              >
                <span>Быстро</span>

                <span
                  className="
                    w-1
                    h-1
                    rounded-full
                    bg-cyan-400
                  "
                />

                <span>Просто</span>

                <span
                  className="
                    w-1
                    h-1
                    rounded-full
                    bg-cyan-400
                  "
                />

                <span>uMessage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;