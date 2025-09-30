// models/job.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    poster: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    salary: { type: String },
    location: { type: String },
    workModel: { type: String, enum: ["Remote", "Hybrid", "On-site", "Flexible"], default: "Flexible" },
    status: { type: String, enum: ["open", "closed"], default: "open" },

    // New: Applications
    applications: [
      {
        applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bid: { type: String },   // e.g., proposed salary or bid
        appliedAt: { type: Date, default: Date.now },
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
