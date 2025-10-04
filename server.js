const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const jobRoutes = require("./routes/jobRoutes");


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("Hajira Backend API Running...");
});
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
