require("dotenv").config();
const express = require("express");
const http = require("http");              
const { Server } = require("socket.io");  
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const uploadRoutes = require("./routes/upload");
const Message = require("./models/message.model");
const User = require("./models/User"); 



connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- Your existing routes ---
app.use("/api/jobs", jobRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Hajira Backend API Running...");
});

// GET /api/messages/:roomId
app.get("/api/messages/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ roomId }).sort({ time: 1 }); // oldest first
    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

app.get("/api/chats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // 1️⃣ Fetch all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ time: -1 }); // newest first

    // 2️⃣ Group messages by the other participant
    const chatMap = new Map();

    for (const msg of messages) {
      const otherUserId = msg.sender === userId ? msg.receiver : msg.sender;

      if (!chatMap.has(otherUserId)) {
        // Fetch the other user's details
        const otherUser = await User.findById(otherUserId).select("name email avatar");

        chatMap.set(otherUserId, {
          applicantId: otherUserId,
          name: otherUser?.name || "Unknown",
          email: otherUser?.email || "Unknown",
          avatar: otherUser?.avatar || null,
          lastMessage: msg.message,
          lastMessageTime: msg.time,
        });
      }
    }

    // 3️⃣ Convert map to array
    const chats = Array.from(chatMap.values());

    res.json({ chats });
  } catch (err) {
    console.error("Failed to fetch chats:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// --- Create HTTP server ---
const server = http.createServer(app);

// --- Initialize Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: 
    ["https://hajira-org.netlify.app", // the first link
      "http://hajira-org.vercel.app/", //alternative link if experiencing downtimes
      "http://localhost:3000"
    ], //  will be updated to my React frontend URL
    methods: ["GET", "POST"],
  },
});



io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined ${roomId}`);
  
    try {
      const history = await Message.find({ roomId }).sort({ time: 1 });
      socket.emit("messageHistory", history);
    } catch (err) {
      console.error(err);
    }
  });
  

  socket.on("sendMessage", async (data) => {
    const { roomId, sender, receiver, message } = data;

    // ✅ Save to DB
    const newMessage = await Message.create({
      roomId,
      sender,
      receiver,
      message,
    });

    // ✅ Emit to everyone in that room
    io.to(roomId).emit("receiveMessage", {
      sender,
      receiver,
      message,
      time: newMessage.time,
    });
  });
});


// --- Start server ---
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
