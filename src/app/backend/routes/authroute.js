// routes/authroute.js
import express from "express";
import db from "../config/db.js";
import {
  signup,
  verifyCode,
  login,
  resendCode,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPasswordOTP,
} from "../controllers/authcontroller.js";
import { protectRoute, requireRole } from "../middleware/authmiddleware.js";
const router = express.Router();
// --- Public routes ---
router.post("/signup", signup);
router.post("/verify", verifyCode);
router.post("/login", login);
router.post("/resend", resendCode);

// --- Forgot password routes ---
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordOTP);

// --- Protected routes ---
router.get("/profile", protectRoute, getMe);
router.put("/profile", protectRoute, updateProfile);
router.put("/profile/password", protectRoute, changePassword);

// --- Supplier-specific routes (example) ---
router.get(
  "/supplier/profile",
  protectRoute,
  requireRole("supplier"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT u.user_id, u.first_name, u.last_name, u.email, s.company_name, s.phone, s.address
         FROM users u 
         JOIN suppliers s ON u.user_id = s.user_id
         WHERE u.user_id = ?`,
        [req.user.id]
      );
      if (!rows.length) return res.status(404).json({ message: "Supplier not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("Supplier profile error:", err?.stack ?? err);
      res.status(500).json({ message: "Error fetching supplier profile" });
    }
  }
);

// --- Customer-specific routes (example) ---
router.get(
  "/customer/profile",
  protectRoute,
  requireRole("customer"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT u.user_id, u.first_name, u.last_name, u.email, c.phone_number, c.city, c.country
         FROM users u 
         JOIN customers c ON u.user_id = c.user_id
         WHERE u.user_id = ?`,
        [req.user.id]
      );
      if (!rows.length) return res.status(404).json({ message: "Customer not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error("Customer profile error:", err?.stack ?? err);
      res.status(500).json({ message: "Error fetching customer profile" });
    }
  }
);

export default router;
