const express = require("express");
const { signup, signin } = require("../controllers/authController");
const router = express.Router();

// Register new user
router.post("/signup", signup);

// Login existing user
router.post("/signin", signin);

module.exports = router;
