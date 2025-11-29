// controllers/authcontroller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email.js";
import dotenv from "dotenv";
dotenv.config();

// --- Helper: Find user by email ---
async function findUserByEmail(email) {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
  return rows[0];
}

// --- Helper: Find user by ID (excluding password) ---
async function findUserById(id) {
  const [rows] = await db.query(
    "SELECT user_id, first_name, last_name, email, role, status, created_at, updated_at FROM users WHERE user_id = ?",
    [id]
  );
  return rows[0];
}

async function findCustomerByUserId(userId) {
  const [rows] = await db.query("SELECT * FROM customers WHERE user_id = ?", [userId]);
  return rows[0];
}
async function findSupplierByUserId(userId) {
  const [rows] = await db.query("SELECT * FROM suppliers WHERE user_id = ?", [userId]);
  return rows[0];
}

// =============================
// SIGNUP & EMAIL VERIFICATION
// =============================
export async function signup(req, res) {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role)
      return res.status(400).json({ message: "All fields are required" });

    const normalizedEmail = email.toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users 
       (first_name, last_name, email, password_hash, role, status, two_fa_code, two_fa_expires_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [firstName, lastName, normalizedEmail, hashed, role, otp, expires]
    );

    const userId = result.insertId;

    // Create role-specific row
    if (role === "customer") {
      await db.query(
        `INSERT INTO customers (user_id) VALUES (?)`,
        [userId]
      );
    } else if (role === "supplier") {
      // supplier approved default is 1 per your schema; set to 1 (change to 0 if you want manual approval)
      await db.query(
        `INSERT INTO suppliers (user_id, company_name, phone, address, approved) VALUES (?, ?, ?, ?, ?)`,
        [userId, null, null, null, 1]
      );
    }

    // send verification email (sends code in email body)
    await sendVerificationEmail(normalizedEmail, otp);
    // helpful for dev (remove in prod): console.log("OTP for", normalizedEmail, "is", otp);

    res.status(201).json({
      message: "Signup successful. Check your email for a 6-digit verification code.",
      email: normalizedEmail,
      role,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
}

export async function verifyCode(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email and code are required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status === "active") return res.status(400).json({ message: "Account already verified" });
    if (!user.two_fa_expires_at || new Date(user.two_fa_expires_at) < new Date())
      return res.status(400).json({ message: "Code expired" });
    if (user.two_fa_code !== code) return res.status(400).json({ message: "Invalid verification code" });

    await db.query(
      `UPDATE users SET status = 'active', two_fa_code = NULL, two_fa_expires_at = NULL WHERE email = ?`,
      [email.toLowerCase()]
    );

    res.json({ message: "✅ Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
}

export async function resendCode(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.toLowerCase();
    const user = await findUserByEmail(normalizedEmail);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status === "active") return res.status(400).json({ message: "Account already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `UPDATE users SET two_fa_code = ?, two_fa_expires_at = ? WHERE email = ?`,
      [otp, expires, normalizedEmail]
    );

    await sendVerificationEmail(normalizedEmail, otp);
    // console.log("Resent OTP to", normalizedEmail, "otp:", otp);

    res.json({ message: "📩 New verification code sent successfully." });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Server error during resend" });
  }
}

// =============================
// LOGIN & AUTH
// =============================
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    if (user.status !== "active") return res.status(403).json({ message: "Please verify your email first" });

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
}

export async function logout(req, res) {
  try {
    // no cookies — just tell client to delete token
    res.json({ message: "Logged out successfully. Please clear your token client-side." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
}

// =============================
// USER PROFILE
// =============================
export async function getMe(req, res) {
  try {
    const { id } = req.user;
    const user = await findUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // attach role-specific object
    if (user.role === "customer") {
      const customer = await findCustomerByUserId(id);
      return res.json({ ...user, customer });
    }
    if (user.role === "supplier") {
      const supplier = await findSupplierByUserId(id);
      return res.json({ ...user, supplier });
    }

    // other roles
    res.json(user);
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error fetching user" });
  }
}

/**
 * updateProfile:
 * - does NOT allow changing email (explicitly disabled)
 * - allows updating firstName & lastName
 * - accepts role-specific objects: customer or supplier (optional)
 */
export async function updateProfile(req, res) {
  try {
    const { firstName, lastName, /* email intentionally ignored */ } = req.body;
    const { id } = req.user;

    // if nothing provided, error
    const hasUserFields = !!(firstName || lastName);
    const hasCustomer = !!req.body.customer;
    const hasSupplier = !!req.body.supplier;
    if (!hasUserFields && !hasCustomer && !hasSupplier) {
      return res.status(400).json({ message: "At least one field is required" });
    }

    // Update users table (first/last only)
    const fields = [];
    const values = [];
    if (firstName) { fields.push("first_name = ?"); values.push(firstName); }
    if (lastName) { fields.push("last_name = ?"); values.push(lastName); }
    if (fields.length) {
      values.push(id);
      await db.query(`UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`, values);
    }

    // Update customer table if provided
    if (hasCustomer) {
      const customer = req.body.customer || {};
      // allowed customer fields: phone_number, address, city, country, postal_code
      const cFields = [];
      const cValues = [];
      if (customer.phone_number !== undefined) { cFields.push("phone_number = ?"); cValues.push(customer.phone_number || null); }
      if (customer.address !== undefined) { cFields.push("address = ?"); cValues.push(customer.address || null); }
      if (customer.city !== undefined) { cFields.push("city = ?"); cValues.push(customer.city || null); }
      if (customer.country !== undefined) { cFields.push("country = ?"); cValues.push(customer.country || null); }
      if (customer.postal_code !== undefined) { cFields.push("postal_code = ?"); cValues.push(customer.postal_code || null); }

      if (cFields.length) {
        cValues.push(id);
        await db.query(`UPDATE customers SET ${cFields.join(", ")} WHERE user_id = ?`, cValues);
      }
    }

    // Update supplier table if provided
    if (hasSupplier) {
      const supplier = req.body.supplier || {};
      // allowed supplier fields: company_name, phone, address, approved (be careful with approved)
      const sFields = [];
      const sValues = [];
      if (supplier.company_name !== undefined) { sFields.push("company_name = ?"); sValues.push(supplier.company_name || null); }
      if (supplier.phone !== undefined) { sFields.push("phone = ?"); sValues.push(supplier.phone || null); }
      if (supplier.address !== undefined) { sFields.push("address = ?"); sValues.push(supplier.address || null); }
      if (supplier.approved !== undefined) { sFields.push("approved = ?"); sValues.push(supplier.approved ? 1 : 0); }

      if (sFields.length) {
        sValues.push(id);
        await db.query(`UPDATE suppliers SET ${sFields.join(", ")} WHERE user_id = ?`, sValues);
      }
    }

    const updated = await findUserById(id);
    // attach role-specific info
    if (updated.role === "customer") {
      const customer = await findCustomerByUserId(id);
      return res.json({ message: "Profile updated successfully", user: updated, customer });
    }
    if (updated.role === "supplier") {
      const supplier = await findSupplierByUserId(id);
      return res.json({ message: "Profile updated successfully", user: updated, supplier });
    }
    res.json({ message: "Profile updated successfully", user: updated });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
}

export async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Old and new password required" });
    if (newPassword.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (confirmPassword && newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const [rows] = await db.query("SELECT password_hash FROM users WHERE user_id = ?", [id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) return res.status(400).json({ message: "Incorrect old password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [hashed, id]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("ChangePassword error:", err);
    res.status(500).json({ message: "Server error changing password" });
  }
}

// =============================
// FORGOT PASSWORD / RESET
// =============================
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(`UPDATE users SET reset_code = ?, reset_expires = ? WHERE email = ?`, [otp, expires, email.toLowerCase()]);
    await sendResetPasswordEmail(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ message: "Server error requesting reset" });
  }
}

export async function resetPasswordOTP(req, res) {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ message: "Email, code and new password required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.reset_expires || new Date(user.reset_expires) < new Date())
      return res.status(400).json({ message: "OTP expired" });
    if (user.reset_code !== code)
      return res.status(400).json({ message: "Invalid OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL WHERE email = ?`, [hashed, email.toLowerCase()]);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("ResetPasswordOTP error:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
}
