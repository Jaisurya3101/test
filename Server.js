const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Storage for Android photo uploads
const upload = multer({ dest: "uploads/" });

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// ImageKit keys
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PRIVATE_KEY = "your_private_key";
const IMAGEKIT_PUBLIC_KEY = "your_public_key";

// 📌 Route: Android sends photo here
app.post("/upload-photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("fileName", "captured_" + Date.now() + ".jpg");

    const response = await axios.post(IMAGEKIT_UPLOAD_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Basic ${Buffer.from(IMAGEKIT_PRIVATE_KEY + ":").toString("base64")}`
      }
    });

    // Clean up local file
    fs.unlinkSync(filePath);

    console.log("✅ Uploaded to ImageKit:", response.data.url);
    res.json({ url: response.data.url });

    // Also notify socket.io clients
    io.emit("photo-uploaded", response.data.url);

  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Live at: ${process.env.RENDER_EXTERNAL_URL || "http://localhost:" + PORT}`);
});
