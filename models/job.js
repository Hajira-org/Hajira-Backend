// models/job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // ✅ Who posted the job (linked to the User collection)
    poster: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // ✅ Core job details
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: [{ type: String, trim: true }],
    salary: { type: String, trim: true },
    location: { type: String, trim: true },

    // ✅ GeoJSON for coordinates
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },

    // ✅ Work model (Remote / Hybrid / etc.)
    workModel: { 
      type: String, 
      enum: ["Same Day", "Scheduled", "Flexible"], 
      default: "Flexible" 
    },

    // ✅ Job status (open or closed)
    status: { 
      type: String, 
      enum: ["open", "closed"], 
      default: "open" 
    },

    // ✅ Optional — useful for showing categories like “Car Washing” or “Tutoring”
    category: { type: String, trim: true },

    // ✅ Applications — users applying for this job
    applications: [
      {
        applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bid: { type: String, trim: true }, // e.g., proposed pay or rate
        message: { type: String, trim: true }, // optional: allow applicant note
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite errors in development
module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);
