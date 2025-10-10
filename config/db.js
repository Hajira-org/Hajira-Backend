const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected");
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${i + 1}):`, error.message);
      if (i < retries - 1) {
        console.log(`🔁 Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
