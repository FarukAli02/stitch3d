// File: app/forgotpassword/page.js
// Purpose: Forgot password request interface - Light Theme
// Author: Stitch3D-Dev
// Env Required: None (frontend only)

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle, AlertTriangle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      setIsSuccess(false);
      return;
    }
    setLoading(true);
    setMessage("Sending password reset code...");
    setIsSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Password reset code sent! Check your email.");
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/resetpassword?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setMessage(data.message || "Failed to find account or send code. Try again.");
        setIsSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again later.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
            <Mail className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Forgot Password
          </h1>
          <p className="text-slate-600 text-sm">
            We'll send you a code to reset your password
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-5 text-sm p-4 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}