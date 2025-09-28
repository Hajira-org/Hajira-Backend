const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Role is optional at signup, chosen later in setup wizard
    role: { type: String, enum: ["seeker", "poster"], default: null },

    age: { type: Number },
    skills: [{ type: String }],

    profile: {
      bio: { type: String },
      location: { type: String },
      experience: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
