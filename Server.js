const { Server } = require("socket.io");
const io = new Server(3000, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Device connected:", socket.id);

  // Listen for trigger from controller
  socket.on("trigger-photo", () => {
    console.log("Trigger received, broadcasting to all devices...");
    io.emit("take-photo");
  });
});
