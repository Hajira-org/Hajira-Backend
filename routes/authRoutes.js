const express = require("express");
const { signup, signin, setupProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Signup & Signin
router.post("/signup", signup);
router.post("/signin", signin);

// Profile setup (protected route)
router.post("/setup", protect, setupProfile);

module.exports = router;
