const express = require("express");
const {
  signup,
  signin,
  setupProfile,
  updateProfile,
  changePassword, // 👈 added here
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// ---------------- AUTH ----------------
router.post("/signup", signup);
router.post("/signin", signin);

// ---------------- PROFILE ----------------
router.post("/setup", protect, setupProfile);
router.put("/profile", protect, upload.single("logo"), updateProfile);

// ---------------- PASSWORD ----------------
router.put("/change-password", protect, changePassword); // 👈 new route

module.exports = router;
