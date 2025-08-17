const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Serve static HTML file
app.use(express.static(path.join(__dirname, "public")));

// Replace with your ImageKit credentials
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PRIVATE_KEY = "private_h1lhODU2H93DrmvD5cuRnG9Kp0I=";
const IMAGEKIT_PUBLIC_KEY = "public_v3xvrXwqnm83tFwUn+IDcm4upTc=";

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("trigger-photo", async () => {
    console.log("Trigger received → uploading image...");

    try {
      // Example: using a local placeholder image (test.jpg)
      const filePath = "test.jpg";
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath));
      formData.append("fileName", "captured_" + Date.now() + ".jpg");

      const response = await axios.post(IMAGEKIT_UPLOAD_URL, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Basic ${Buffer.from(IMAGEKIT_PRIVATE_KEY + ":").toString("base64")}`
        }
      });

      console.log("✅ Uploaded to ImageKit:", response.data.url);

      // Send back URL to the web client
      socket.emit("photo-uploaded", response.data.url);

    } catch (err) {
      console.error("❌ Upload failed:", err.message);
      socket.emit("upload-error", err.message);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
