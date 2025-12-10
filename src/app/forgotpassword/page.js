"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ import router
import { Mail, CheckCircle, AlertTriangle } from "lucide-react";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter(); // ✅ router hook
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setMessage("⚠️ Please enter a valid email address.");
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
        setMessage(`✅ ${data.message || "Password reset code sent! Check your email."}`);
        setIsSuccess(true);
        // ✅ Redirect to reset-password page after short delay
        setTimeout(() => {
          router.push(`/resetpassword?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setMessage(`❌ ${data.message || "Failed to find account or send code. Try again."}`);
        setIsSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network error. Please try again later.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 shadow-2xl shadow-indigo-900/20 rounded-xl p-6 sm:p-8 transition-all duration-300">
        <div className="text-center mb-6">
          <Mail className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-gray-400">
            We'll send you a code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 pl-11 text-sm text-white placeholder-gray-500 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
        {message && (
          <div
            className={`mt-5 text-center text-sm p-4 rounded-lg font-medium transition-colors flex items-center gap-3 justify-center ${
              message.startsWith("✅")
                ? "bg-green-900/30 text-green-300 border border-green-800"
                : message.startsWith("❌") || message.startsWith("⚠️")
                ? "bg-rose-900/30 text-rose-300 border border-rose-800"
                : "bg-gray-800 text-gray-300 border border-gray-700"
            }`}
          >
            {message.startsWith("✅") ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            {message.substring(2).trim()}
          </div>
        )}
        <p className="text-center text-sm mt-6 text-gray-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}
