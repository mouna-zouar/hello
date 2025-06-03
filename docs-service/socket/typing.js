const { Server } = require("socket.io");

let userSockets = new Map();

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Nouvel utilisateur connecté");

    // Enregistrement de l'utilisateur avec son ID
    socket.on("register", (userId) => {
      socket.userId = userId;
      userSockets.set(userId, socket);
      console.log(`👤 Utilisateur enregistré : ${userId}`);
    });

    // Gestion de l'état "en train d'écrire"
    socket.on("typing", ({ senderId, receiverId }) => {
      const targetSocket = userSockets.get(receiverId);
      if (targetSocket) {
        targetSocket.emit("typing", { senderId, isTyping: true });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const targetSocket = userSockets.get(receiverId);
      if (targetSocket) {
        targetSocket.emit("typing", { senderId, isTyping: false });
      }
    });

    // Envoi d'un nouveau message
    socket.on("newMessage", ({ message, receiverId }) => {
      const targetSocket = userSockets.get(receiverId);
      if (targetSocket) {
        targetSocket.emit("newMessage", message);
      }
      socket.emit("messageSent", message); // pour l'expéditeur
    });

    // Déconnexion
    socket.on("disconnect", () => {
      console.log("🔌 Utilisateur déconnecté");
      userSockets.delete(socket.userId);
    });
  });

  return io;
};

module.exports = { setupSocket };
