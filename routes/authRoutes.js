const express = require("express");
const {
  signup,
  signin,
  setupProfile,
  updateProfile,
  changePassword,
  getUser, // 👈 added
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../models/cloudinary");

const router = express.Router();

// ---------------- AUTH ----------------
router.post("/signup", signup);
router.post("/signin", signin);

// ---------------- PROFILE ----------------
router.post("/setup", protect, setupProfile);
router.put("/profile", protect, upload.single("logo"), updateProfile);

// ---------------- PASSWORD ----------------
router.put("/change-password", protect, changePassword);

// ---------------- USER ----------------
router.get("/me", protect, getUser); // 👈 new route to fetch user data

module.exports = router;
