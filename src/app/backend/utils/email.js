import nodemailer from "nodemailer";
import dotenv from "dotenv";
if(!process.env.EMAIL_USER){
  dotenv.config();
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send account verification code email
 * @param {string} email - recipient email
 * @param {string} code - verification code
 */
export async function sendVerificationEmail(email, code) {
  try {
    const mailOptions = {
      from: `"Stitch3D" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Stitch3D Verification Code",
      html: `
        <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2 style="color:#2563eb;">Verify your Stitch3D Account</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="font-size:30px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>Please copy and paste this code into the Stitch3D verification screen.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending verification email:", err);
    throw new Error("Failed to send verification email");
  }
}
/**
 * Send password reset code email
 * @param {string} email - recipient email
 * @param {string} code - reset code
 */
export async function sendResetPasswordEmail(email, code) {
  try {
    const mailOptions = {
      from: `"Stitch3D" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Stitch3D Password Reset Code",
      html: `
        <div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2 style="color:#2563eb;">Reset Your Stitch3D Password</h2>
          <p>Your 6-digit password reset code is:</p>
          <h1 style="font-size:30px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>Enter this code in the Stitch3D password reset screen to set a new password.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (err) {
    console.error("❌ Error sending password reset email:", err);
    throw new Error("Failed to send password reset email");
  }
}
