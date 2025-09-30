const express = require("express");
const router = express.Router();
const { createJob, getJobs, updateJob, deleteJob, getAvailableJobs, applyJob } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// Poster job routes
router.post("/", protect, createJob);
router.get("/", protect, getJobs);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, applyJob); // seekers apply


// Seeker job route
router.get("/available", protect, getAvailableJobs);

module.exports = router;
