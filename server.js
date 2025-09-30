const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const jobRoutes = require("./routes/jobRoutes");

dotenv.config();

const app = express();

// Connect to MongoDB Atlas
connectDB();

// CORS
app.use(cors({
  origin: 'https://hajira-org.netlify.app', 
}));
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hajira Backend API Running...");
});

// Use dynamic PORT for Render
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
