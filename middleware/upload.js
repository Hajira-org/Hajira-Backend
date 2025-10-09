const express = require("express");
const router = express.Router();
const { upload } = require("../models/cloudinary");
const { protect } = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../controllers/uploadController");

// 🔐 Protected route: must be logged in
router.post("/avatar", protect, upload.single("file"), uploadAvatar);

module.exports = router;
