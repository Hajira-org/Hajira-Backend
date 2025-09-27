const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Roles: 'seeker' (job seeker), 'poster' (job poster)
    role: { type: String, enum: ["seeker", "poster"], required: true },

    age: { type: Number },
    skills: [{ type: String }],

    profile: {
      bio: String,
      location: String,
      experience: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
