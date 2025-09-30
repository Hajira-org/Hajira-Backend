const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Role is chosen during profile setup
    role: { type: String, enum: ["seeker", "poster"], default: null },

    // ------------------ Seeker-specific fields ------------------
    seeker: {
      headline: { type: String },
      bio: { type: String },
      profilePic: { type: String }, // store file path or URL
      resume: { type: String }, // store file path or URL
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
      logo: { type: String }, // file path or URL
      team: { type: String },
      careerURL: { type: String },
      colors: { type: String }, // hex value
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

    // ------------------ Shared fields ------------------
    compliance: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError in dev (Nodemon reloads)
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
