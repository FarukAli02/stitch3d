// controllers/avatarController.js
import db from "../config/db.js";
export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or invalid file type." });
    }

    // 2. Prepare the relative path for the database
    // Note: This matches the destination set in the route configuration
    const filePath = `/uploads/avatars/${req.file.filename}`;
    const userId = req.user.id; // accessing id from the decoded token (req.user)

    // 3. Update the User record in MySQL
    const [result] = await db.query(
      "UPDATE users SET profile_picture = ? WHERE user_id = ?",
      [filePath, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. Respond with the new path so frontend can display it immediately
    res.status(200).json({
      message: "Profile picture updated successfully",
      filePath: filePath
    });

  } catch (error) {
    console.error("Avatar Upload Error:", error);
    res.status(500).json({ message: "Server error processing avatar upload." });
  }
}