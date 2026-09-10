import { useState } from "react";

import { Link } from "react-router";

import {
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  LogInIcon,
  XCircleIcon,
} from "lucide-react";

import useLogin from "../hooks/useLogin.js";

const LoignPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();

    loginMutation({
      email: loginData.email.trim(),
      password: loginData.password,
    });
  };

  const getErrorMessage = () => {
    const serverMessage =
      error?.response?.data?.message ||
      error?.message ||
      "";

    if (
      serverMessage
        .toLowerCase()
        .includes("неверная электронная почта") ||
      serverMessage
        .toLowerCase()
        .includes("неверный пароль") ||
      serverMessage
        .toLowerCase()
        .includes("invalid") ||
      serverMessage
        .toLowerCase()
        .includes("incorrect")
    ) {
      return "Неверная электронная почта или пароль!";
    }

    return (
      serverMessage ||
      "Не удалось войти в аккаунт"
    );
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
                text-xl
                sm:text-2xl
                font-bold
              "
            >
              С возвращением!
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
              Войдите в свой аккаунт и продолжайте
              общение в uMessage.
            </p>
          </div>

          {/* ERROR */}

          {error && (
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
            onSubmit={handleLogin}
            className="w-full"
          >
            <div
              className="
                space-y-4
                sm:space-y-5
              "
            >
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

                <input
                  type="email"
                  placeholder="Введите вашу электронную почту"
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
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  autoComplete="email"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="form-control w-full">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mb-1
                  "
                >
                  <label className="label py-1.5 px-0">
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

                  <Link
                    to="/forgot-password"
                    className="
                      text-[11px]
                      sm:text-xs
                      text-cyan-400
                      hover:text-cyan-300
                      hover:underline
                      transition-colors
                      whitespace-nowrap
                    "
                  >
                    Забыли пароль?
                  </Link>
                </div>

                <div className="relative w-full">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Введите ваш пароль"
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
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    autoComplete="current-password"
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
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={isPending}
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

                    <span className="truncate">
                      Входим в аккаунт...
                    </span>
                  </>
                ) : (
                  <>
                    <LogInIcon
                      className="
                        w-5
                        h-5
                        shrink-0
                      "
                    />

                    Авторизация
                  </>
                )}
              </button>

              {/* REGISTER */}

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
                  Нет аккаунта?{" "}

                  <Link
                    to="/signup"
                    className="
                      text-cyan-400
                      hover:text-cyan-300
                      hover:underline
                      transition-colors
                      font-medium
                    "
                  >
                    Создать аккаунт
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
            overflow-hidden
          "
        >
          <div
            className="
              w-full
              max-w-md
              px-8
              py-10
            "
          >
            {/* IMAGE */}

            <div
              className="
                flex
                items-center
                justify-center
                scale-110
              "
            >
              <img
                src="/i2.png"
                alt="Общение в uMessage"
                className="
                  w-full
                  max-w-sm
                  h-auto
                  object-contain
                  drop-shadow-2xl
                "
              />
            </div>

            {/* TEXT */}

            <div
              className="
                text-center
                space-y-3
                mt-8
              "
            >
              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Всегда оставайтесь на связи
              </h2>

              <p
                className="
                  text-sm
                  text-base-content/55
                  leading-relaxed
                  max-w-md
                  mx-auto
                "
              >
                Общайтесь с друзьями, отправляйте
                сообщения и совершайте аудио- и
                видеозвонки в uMessage.
              </p>

              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  pt-2
                  text-xs
                  text-base-content/35
                "
              >
                <span>Сообщения</span>

                <span
                  className="
                    w-1
                    h-1
                    rounded-full
                    bg-cyan-400
                  "
                />

                <span>Звонки</span>

                <span
                  className="
                    w-1
                    h-1
                    rounded-full
                    bg-cyan-400
                  "
                />

                <span>Друзья</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoignPage;