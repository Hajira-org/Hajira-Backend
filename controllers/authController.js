const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ------------------- SIGNUP -------------------
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["seeker", "poster"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------- SIGNIN -------------------
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        location: user.location,
        stats: user.stats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------- SETUP / UPDATE PROFILE -------------------
// ------------------- SETUP / UPDATE PROFILE -------------------
const setupProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { role, avatar, location, bio, seeker, poster } = req.body;
    const updateData = {};

    if (role) updateData.role = role; // ✅ <-- Add this line
    if (avatar) updateData.avatar = avatar;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;

    if (seeker) updateData.seeker = seeker;
    if (poster) updateData.poster = poster;

    const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      role: user.role, // ✅ include updated role
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------- UPDATE PROFILE -------------------
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, seeker, company, about } = req.body;

    // If file uploaded, get file path
    const logoPath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData = {};

    // ✅ Root-level fields
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;

    // ✅ Nested seeker fields
    if (seeker && seeker.skills) {
      updateData["seeker.skills"] = seeker.skills;
    }

    // ✅ Poster info
    if (company) updateData["poster.company"] = company;
    if (about) updateData["poster.about"] = about;
    if (logoPath) updateData["poster.logo"] = logoPath;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


// ------------------- CHANGE PASSWORD -------------------
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ------------------- FETCH USER -------------------
const getUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



module.exports = { signup, signin, setupProfile, updateProfile, changePassword, getUser };
