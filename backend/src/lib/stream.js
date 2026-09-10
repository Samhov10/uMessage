import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "uMessage <onboarding@resend.dev>";

// ==================================================
// CHECK CONFIG
// ==================================================

function checkResendConfig() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY отсутствует"
    );
  }
}

// ==================================================
// VERIFICATION EMAIL
// ==================================================

export const sendVerificationEmail =
  async (email, code) => {
    try {
      checkResendConfig();

      const {
        data,
        error,
      } =
        await resend.emails.send({
          from: FROM_EMAIL,

          to: [email],

          subject:
            "Код подтверждения uMessage",

          text:
            `Ваш код подтверждения uMessage: ${code}. ` +
            "Код действителен 10 минут.",

          html: `
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background-color:#f4f7fb;
      font-family:Arial,Helvetica,sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding:40px 15px;"
    >
      <tr>
        <td align="center">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width:520px;
              background:#ffffff;
              border-radius:20px;
              overflow:hidden;
            "
          >

            <tr>
              <td
                align="center"
                style="
                  padding:35px 30px 20px;
                "
              >
                <div
                  style="
                    font-size:30px;
                    font-weight:700;
                    color:#0ea5e9;
                  "
                >
                  uMessage
                </div>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                style="
                  padding:0 35px 35px;
                "
              >

                <h2
                  style="
                    margin:10px 0;
                    color:#111827;
                  "
                >
                  Подтверждение почты
                </h2>

                <p
                  style="
                    color:#6b7280;
                    font-size:15px;
                    line-height:24px;
                  "
                >
                  Используйте этот код,
                  чтобы подтвердить адрес
                  электронной почты в uMessage.
                </p>

                <div
                  style="
                    margin:30px 0;
                    padding:18px 30px;
                    background:#f0f9ff;
                    border-radius:14px;
                    font-size:34px;
                    font-weight:700;
                    letter-spacing:8px;
                    color:#0284c7;
                  "
                >
                  ${code}
                </div>

                <p
                  style="
                    color:#9ca3af;
                    font-size:13px;
                  "
                >
                  Код действителен 10 минут.
                </p>

                <p
                  style="
                    margin-top:25px;
                    color:#9ca3af;
                    font-size:13px;
                  "
                >
                  Если вы не создавали
                  аккаунт uMessage,
                  просто проигнорируйте
                  это письмо.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
          `,
        });

      if (error) {
        console.error(
          "❌ Resend verification error:",
          error
        );

        throw new Error(
          error.message ||
            "Ошибка отправки письма"
        );
      }

      console.log(
        "✅ Verification email sent via Resend"
      );

      console.log(
        "Email ID:",
        data?.id
      );

      return data;
    } catch (error) {
      console.error(
        "❌ Verification email error:",
        error
      );

      throw error;
    }
  };

// ==================================================
// PASSWORD RESET EMAIL
// ==================================================

export const sendPasswordResetEmail =
  async (email, code) => {
    try {
      checkResendConfig();

      const {
        data,
        error,
      } =
        await resend.emails.send({
          from: FROM_EMAIL,

          to: [email],

          subject:
            "Восстановление пароля uMessage",

          text:
            `Ваш код восстановления пароля uMessage: ${code}. ` +
            "Код действителен 10 минут.",

          html: `
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background-color:#f4f7fb;
      font-family:Arial,Helvetica,sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding:40px 15px;"
    >
      <tr>
        <td align="center">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width:520px;
              background:#ffffff;
              border-radius:20px;
              overflow:hidden;
            "
          >

            <tr>
              <td
                align="center"
                style="
                  padding:35px 30px 20px;
                "
              >
                <div
                  style="
                    font-size:30px;
                    font-weight:700;
                    color:#0ea5e9;
                  "
                >
                  uMessage
                </div>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                style="
                  padding:0 35px 35px;
                "
              >

                <h2
                  style="
                    margin:10px 0;
                    color:#111827;
                  "
                >
                  Восстановление пароля
                </h2>

                <p
                  style="
                    color:#6b7280;
                    font-size:15px;
                    line-height:24px;
                  "
                >
                  Используйте этот код
                  для создания нового
                  пароля uMessage.
                </p>

                <div
                  style="
                    margin:30px 0;
                    padding:18px 30px;
                    background:#f0f9ff;
                    border-radius:14px;
                    font-size:34px;
                    font-weight:700;
                    letter-spacing:8px;
                    color:#0284c7;
                  "
                >
                  ${code}
                </div>

                <p
                  style="
                    color:#9ca3af;
                    font-size:13px;
                  "
                >
                  Код действителен 10 минут.
                </p>

                <p
                  style="
                    margin-top:25px;
                    color:#9ca3af;
                    font-size:13px;
                  "
                >
                  Если вы не запрашивали
                  восстановление пароля,
                  просто проигнорируйте
                  это письмо.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
          `,
        });

      if (error) {
        console.error(
          "❌ Resend password reset error:",
          error
        );

        throw new Error(
          error.message ||
            "Ошибка отправки письма"
        );
      }

      console.log(
        "✅ Password reset email sent via Resend"
      );

      console.log(
        "Email ID:",
        data?.id
      );

      return data;
    } catch (error) {
      console.error(
        "❌ Password reset email error:",
        error
      );

      throw error;
    }
  };

// ==================================================
// CONNECTION CHECK
// ==================================================

export const verifyEmailConnection =
  async () => {
    try {
      checkResendConfig();

      console.log(
        "✅ Resend API настроен"
      );

      return true;
    } catch (error) {
      console.error(
        "❌ Resend configuration error:",
        error.message
      );

      return false;
    }
  };