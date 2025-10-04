const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Role is chosen during profile setup
    role: { type: String, enum: ["seeker", "poster"], default: null },

    // ------------------ Shared fields ------------------
    avatar: { type: String, default: "" }, // 👈 Profile image URL
    location: { type: String, default: "" }, // 👈 Country or city
    bio: { type: String, default: "" }, // 👈 Optional short bio
    stats: {
      totalJobsApplied: { type: Number, default: 0 },
      totalJobsCompleted: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
    },

    // ------------------ Seeker-specific fields ------------------
    seeker: {
      headline: { type: String },
      profilePic: { type: String }, // store file path or URL
      resume: { type: String },
      title: { type: String },
      industry: { type: String },
      salary: { type: String },
      workModel: {
        type: String,
        enum: ["Remote", "Hybrid", "On-site", "Flexible"],
      },
      alerts: {
        type: String,
        enum: ["Daily", "Weekly", "Bi-weekly", "Monthly"],
      },
      skills: [{ type: String }],
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
      notifications: { type: Boolean, default: true },
      applicationHistory: [
        {
          jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
          status: {
            type: String,
            enum: ["applied", "interview", "rejected", "hired"],
          },
          appliedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // ------------------ Poster-specific fields ------------------
    poster: {
      company: { type: String },
      about: { type: String },
      logo: { type: String },
      team: { type: String },
      careerURL: { type: String },
      colors: { type: String },
      ats: { type: String },
      hris: { type: String },
      plan: {
        type: String,
        enum: ["Starter", "Professional", "Enterprise"],
      },
      template: { type: String },
      tracking: { type: Boolean, default: false },
      jobs: [
        {
          title: { type: String },
          description: { type: String },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },

    compliance: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
