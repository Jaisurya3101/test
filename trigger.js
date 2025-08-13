const io = require("socket.io-client");
const socket = io("https://test-1-tjwx.onrender.com");

socket.on("connect", () => {
    console.log("Controller connected");
    socket.emit("trigger-photo");
    console.log("Photo trigger sent");
});
