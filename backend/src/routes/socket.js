import { Server } from "socket.io";

export const setupSocket = (server) => {
  const isAllowedOrigin = (origin) => {
    if (!origin) {
      return true;
    }

    if (origin === "http://localhost:5173") {
      return true;
    }

    if (
      process.env.CLIENT_URL &&
      origin === process.env.CLIENT_URL
    ) {
      return true;
    }

    if (
      origin.endsWith(".umessage-4yc.pages.dev")
    ) {
      return true;
    }

    return false;
  };

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        console.log(
          "❌ Socket CORS blocked:",
          origin
        );

        return callback(
          new Error(
            "Not allowed by Socket.IO CORS"
          )
        );
      },

      credentials: true,

      methods: [
        "GET",
        "POST",
      ],
    },
  });

  io.on("connection", (socket) => {
    console.log(
      "🟢 Пользователь подключился:",
      socket.id
    );

    socket.on("user-online", (userId) => {
      if (!userId) return;

      socket.join(
        userId.toString()
      );

      console.log(
        "👤 Пользователь online:",
        userId.toString()
      );
    });

    socket.on(
      "call-user",
      ({
        userToCall,
        from,
        signal,
        callType,
      }) => {
        if (!userToCall) return;

        io.to(
          userToCall.toString()
        ).emit(
          "incoming-call",
          {
            signal,
            from,
            callType,
          }
        );
      }
    );

    socket.on(
      "answer-call",
      ({ to, signal }) => {
        if (!to) return;

        io.to(
          to.toString()
        ).emit(
          "call-accepted",
          {
            signal,
          }
        );
      }
    );

    socket.on(
      "ice-candidate",
      ({ to, candidate }) => {
        if (
          !to ||
          !candidate
        ) {
          return;
        }

        io.to(
          to.toString()
        ).emit(
          "ice-candidate",
          {
            candidate,
          }
        );
      }
    );

    socket.on(
      "reject-call",
      ({ to }) => {
        if (!to) return;

        io.to(
          to.toString()
        ).emit(
          "call-rejected"
        );
      }
    );

    socket.on(
      "end-call",
      ({ to }) => {
        if (!to) return;

        io.to(
          to.toString()
        ).emit(
          "call-ended"
        );
      }
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "🔴 Пользователь отключился:",
          socket.id
        );
      }
    );
  });

  return io;
};