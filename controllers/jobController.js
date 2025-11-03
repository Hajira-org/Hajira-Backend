const Job = require("../models/job");
const User = require("../models/User"); // import User model to populate

const createJob = async (req, res) => {
  try {
    if (req.user.role !== "poster") {
      return res.status(403).json({ message: "Only posters can create jobs" });
    }

    // Destructure request body
    const {
      title,
      description,
      requirements,
      salary,
      location,
      workModel,
      latitude,
      longitude,
      category,
    } = req.body;

    // 🗺️ Initialize location name
    let locationName = location || "Unknown";

    // ✅ If coordinates exist, reverse geocode them
    if (latitude !== undefined && longitude !== undefined) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const geoData = await geoRes.json();

        if (geoData && geoData.display_name) {
          locationName = geoData.display_name;
        }
      } catch (geoError) {
        console.error("🌍 Reverse geocoding failed:", geoError.message);
      }
    }

    // ✅ Build job data
    const jobData = {
      poster: req.user.id,
      title,
      description,
      requirements: requirements || [],
      salary,
      location: locationName, // Use the resolved human-readable name
      workModel: workModel || "Flexible",
      category,
    };

    // ✅ Add geolocation if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      jobData.geoLocation = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)], // [lng, lat]
      };
    }

    const job = await Job.create(jobData);

    res.status(201).json({
      message: "✅ Job created successfully",
      job,
    });
  } catch (error) {
    console.error("❌ Job creation error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get available jobs (for seekers) with poster object
const getAvailableJobs = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No user found in request" });
    }

    const jobs = await Job.find({ status: "open" })
      .populate({ path: "poster", select: "name email" }) // populate more fields if needed
      .populate({ path: "applications.applicant", select: "name" })
      .sort({ createdAt: -1 });

    const jobsWithApplied = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      description: job.description,
      geoLocation: job.geoLocation,
      location: job.location,
      poster: job.poster || { name: "Unknown" }, // keep as object
      requirements: job.requirements,
      salary: job.salary,
      workModel: job.workModel,
      status: job.status,
      applied: job.applications.some(
        app => app.applicant && app.applicant._id.toString() === req.user.id
      ),
    }));

    res.json({ jobs: jobsWithApplied });
  } catch (error) {
    console.error("Error in getAvailableJobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Other functions stay the same...
// Get jobs for poster (with applications)
// Get jobs for poster (with applications + accepted applicant)
// Get jobs for poster (only open jobs)
const getJobs = async (req, res) => {
  try {
    if (req.user.role !== "poster") {
      return res.status(403).json({ message: "Only posters can view their jobs" });
    }

    // 🟢 Fetch only jobs that are still open
    const jobs = await Job.find({ poster: req.user.id, status: "open" })
      .populate({
        path: "applications.applicant",
        select: "name email",
      })
      .populate({
        path: "acceptedApplicant",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error("Error in getJobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Mark accepted job as completed
const markJobComplete = async (req, res) => {
  try {
    if (req.user.role !== "poster") {
      return res.status(403).json({ message: "Only posters can complete jobs" });
    }

    const job = await Job.findOne({ _id: req.params.id, poster: req.user.id });

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "accepted") {
      return res.status(400).json({ message: "Only accepted jobs can be marked complete" });
    }

    job.status = "closed";
    await job.save();

    res.json({ message: "✅ Job marked as complete", job });
  } catch (error) {
    console.error("Error in markJobComplete:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const acceptJobApplication = async (req, res) => {
  try {
    if (req.user.role !== "poster") {
      return res.status(403).json({ message: "Only posters can accept applicants" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const { applicantId } = req.body;
    if (!applicantId) return res.status(400).json({ message: "Applicant ID required" });

    // ✅ Verify ownership
    if (job.poster.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to accept this job" });
    }

    // ✅ Check applicant exists
    const applicantExists = job.applications.some(
      (app) => app.applicant.toString() === applicantId
    );
    if (!applicantExists) {
      return res.status(400).json({ message: "Applicant not found in this job" });
    }

    // ✅ Mark job as accepted and record accepted applicant
    job.status = "accepted"; // was "closed" before — changed to "accepted"
    job.acceptedApplicant = applicantId;

    // ✅ Clear all applications after accepting
    job.applications = [];

    await job.save();

    res.json({ message: "✅ Applicant accepted successfully", job });
  } catch (error) {
    console.error("Error in acceptJobApplication:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get jobs that have been accepted (poster view)
const getAcceptedJobs = async (req, res) => {
  try {
    if (req.user.role !== "poster") {
      return res.status(403).json({ message: "Only posters can view accepted jobs" });
    }

    const jobs = await Job.find({ poster: req.user.id, status: "accepted" })
      .populate({
        path: "acceptedApplicant",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error("Error in getAcceptedJobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, poster: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, poster: req.user.id });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc Apply to a job
// @route POST /api/jobs/:id/apply
// @access Private (seeker only)
const applyJob = async (req, res) => {
  try {
    if (req.user.role !== "seeker") {
      return res.status(403).json({ message: "Only Job seekers can apply" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const { bid } = req.body;

    const alreadyApplied = job.applications.some(
      app => app.applicant.toString() === req.user.id
    );
    if (alreadyApplied)
      return res.status(400).json({ message: "Already applied" });

    job.applications.push({ applicant: req.user.id, bid: bid || "" });
    await job.save();

    res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getAvailableJobs,
  applyJob,
  acceptJobApplication,
  markJobComplete,
  getAcceptedJobs,
};

