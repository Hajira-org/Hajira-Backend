// routes/upload.js
const express = require("express");
const router = express.Router();
const { upload } = require("../models/cloudinary");
const { uploadAvatar } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

router.post("/avatar", protect, upload.single("file"), uploadAvatar);


module.exports = router;
