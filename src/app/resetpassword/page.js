// File: app/reset-password/page.js
// Purpose: Password reset interface with OTP validation - Light Theme
// Author: Stitch3D-Dev
// Env Required: None (frontend only)

"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    if (emailFromQuery && otpRef.current) otpRef.current.focus();
  }, [emailFromQuery]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function validate() {
    if (!form.email.trim() || !form.code.trim() || !form.newPassword.trim() || !form.confirmPassword.trim()) {
      setMessage("All fields are required");
      return false;
    }
    if (!/^[0-9]{6}$/.test(form.code.trim())) {
      setMessage("Please enter the 6-digit code");
      return false;
    }
    if (form.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return false;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
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
        setMessage(data.message || "Unable to reset password");
      } else {
        setMessage("Password reset successful");
        setTimeout(() => router.push("/login"), 1200);
      }
    } catch (err) {
      setMessage("Connection error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Reset Password
          </h1>
          <p className="text-slate-600 text-sm">
            Enter the code we sent and choose a new password
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                ref={otpRef}
                value={form.code}
                onChange={handleChange}
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {message && (
            <div className={`mt-5 text-center text-sm py-3 px-4 rounded-lg ${
              message.includes("successful")
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Didn't receive a code?{" "}
              <a href="/forgotpassword" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Request new OTP
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}