import { Server } from "socket.io";

export const setupSocket = (server) => {
  const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log("❌ Socket CORS blocked:", origin);

        return callback(
          new Error("Not allowed by Socket.IO CORS")
        );
      },

      credentials: true,

      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(
      "🟢 Пользователь подключился:",
      socket.id
    );

    // ========================================
    // USER ONLINE
    // ========================================

    socket.on("user-online", (userId) => {
      if (!userId) return;

      const roomId = userId.toString();

      socket.join(roomId);

      console.log(
        "👤 Пользователь online:",
        roomId
      );
    });

    // ========================================
    // CALL USER
    // ========================================

    socket.on(
      "call-user",
      ({
        userToCall,
        from,
        signal,
        callType,
      }) => {
        if (!userToCall) return;

        io.to(userToCall.toString()).emit(
          "incoming-call",
          {
            signal,
            from,
            callType,
          }
        );

        console.log(
          `📞 Звонок ${from} → ${userToCall}`
        );
      }
    );

    // ========================================
    // ANSWER CALL
    // ========================================

    socket.on(
      "answer-call",
      ({ to, signal }) => {
        if (!to) return;

        io.to(to.toString()).emit(
          "call-accepted",
          {
            signal,
          }
        );

        console.log(
          `✅ Звонок принят пользователем ${to}`
        );
      }
    );

    // ========================================
    // ICE CANDIDATE
    // ========================================

    socket.on(
      "ice-candidate",
      ({ to, candidate }) => {
        if (!to || !candidate) return;

        io.to(to.toString()).emit(
          "ice-candidate",
          {
            candidate,
          }
        );
      }
    );

    // ========================================
    // REJECT CALL
    // ========================================

    socket.on(
      "reject-call",
      ({ to }) => {
        if (!to) return;

        io.to(to.toString()).emit(
          "call-rejected"
        );

        console.log(
          `❌ Звонок отклонён пользователем ${to}`
        );
      }
    );

    // ========================================
    // END CALL
    // ========================================

    socket.on(
      "end-call",
      ({ to }) => {
        if (!to) return;

        io.to(to.toString()).emit(
          "call-ended"
        );

        console.log(
          `📴 Звонок завершён пользователем ${to}`
        );
      }
    );

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on("disconnect", () => {
      console.log(
        "🔴 Пользователь отключился:",
        socket.id
      );
    });
  });

  return io;
};