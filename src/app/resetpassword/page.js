"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
/**
 * Reset Password Page
 * - Prefills email from ?email= query param (if present)
 * - User provides 6-digit OTP + new password + confirm
 * - Posts to POST http://localhost:5000/api/auth/reset-password
 * - On success redirects to /login
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const emailFromQuery = params?.get("email") ?? "";

  const [form, setForm] = useState({
    email: emailFromQuery,
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRef = useRef(null);
  useEffect(() => {
    // If email was passed via query param, focus OTP input to speed up the UX
    if (emailFromQuery && otpRef.current) otpRef.current.focus();
  }, [emailFromQuery]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function validate() {
    if (!form.email.trim() || !form.code.trim() || !form.newPassword.trim() || !form.confirmPassword.trim()) {
      setMessage("⚠️ All fields are required.");
      return false;
    }
    if (!/^[0-9]{6}$/.test(form.code.trim())) {
      setMessage("⚠️ Please enter the 6-digit code we emailed you.");
      return false;
    }
    if (form.newPassword.length < 6) {
      setMessage("⚠️ Password must be at least 6 characters.");
      return false;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage("⚠️ Passwords do not match.");
      return false;
    }
    return true;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMessage("Resetting password...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.toLowerCase(),
          code: form.code.trim(),
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Backend should provide useful message (Invalid OTP, expired, etc.)
        setMessage(`❌ ${data.message || "Unable to reset password."}`);
      } else {
        setMessage("✅ Password reset successfully. Redirecting to login...");
        // short delay so user sees the success message
        setTimeout(() => router.push("/login"), 1400);
      }
    } catch (err) {
      console.error("Reset error:", err);
      setMessage("❌ Network or server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Your Stitch3D Password</h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter the 6-digit code we emailed you and choose a new password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            name="code"
            ref={otpRef}
            value={form.code}
            onChange={handleChange}
            placeholder="6-digit code"
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New password (min 6 chars)"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <div
            className={`mt-5 text-center text-sm p-4 rounded-lg font-medium ${
              message.startsWith("✅")
                ? "bg-green-900/30 text-green-300 border border-green-800"
                : message.startsWith("❌") || message.startsWith("⚠️")
                ? "bg-rose-900/30 text-rose-300 border border-rose-800"
                : "bg-gray-800 text-gray-300 border border-gray-700"
            }`}
          >
            {message}
          </div>
        )}
        <p className="text-center text-sm mt-6 text-gray-400">
          Didn't receive a code?{" "}
          <a href="/forgot-password" className="text-indigo-400 hover:underline">
            Request a new OTP
          </a>
        </p>
      </div>
    </main>
  );
}
