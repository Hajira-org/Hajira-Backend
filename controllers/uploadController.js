const { cloudinary } = require("../models/cloudinary");
const User = require("../models/User");

// Upload Avatar Controller
exports.uploadAvatar = async (req, res) => {
  try {
    // Multer-storage-cloudinary already uploaded the file to Cloudinary
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = req.file.url || req.file.path; // ✅ use URL if available
    const userId = req.user?.id;

    console.log("✅ Uploaded to Cloudinary:", fileUrl);

    // Update user’s avatar in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: fileUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Only respond here, after updatedUser exists
    res.status(200).json({
      message: "Avatar uploaded and user updated successfully",
      url: fileUrl,
      user: updatedUser,
    });

  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};
