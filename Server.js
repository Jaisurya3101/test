require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary from environment variable
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Multer memory storage (no temp files on Render)
const upload = multer({ storage: multer.memoryStorage() });

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("Device connected:", socket.id);

  socket.on("trigger-photo", () => {
    console.log("Trigger received, broadcasting to all devices...");
    io.emit("take-photo");
  });
});

// HTTP POST /upload endpoint for Android uploads
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload directly from buffer to Cloudinary
    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: "uploads" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }
        console.log("Cloudinary Upload Success:", result.secure_url);
        res.json({ url: result.secure_url });
      }
    );

    // Write buffer to Cloudinary upload stream
    uploadResult.end(req.file.buffer);
  } catch (err) {
    console.error("Server Upload Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
