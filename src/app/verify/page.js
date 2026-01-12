// File: app/verify/page.js
// Purpose: Email verification with OTP input - Light Theme
// Author: Stitch3D-Dev
// Env Required: None (frontend only)

"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function Verify() {
  const router = useRouter();
  const email = useSearchParams()?.get("email") || "";
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Verifying...");
    setResendMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Verification successful");
        router.push("/login");
        return;
      } else {
        setMessage(data.message || "Invalid or expired code");
      }
    } catch (err) {
      setMessage("Connection error occurred");
    }
  };

  const handleResend = async () => {
    if (!email) return setResendMessage("Missing email parameter");
    setResending(true);
    setResendMessage("Sending new code...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setResendMessage(data.message || "New code sent");
      } else {
        setResendMessage(data.message || "Failed to resend code");
      }
    } catch (err) {
      setResendMessage("Connection error occurred");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-slate-600 text-sm">
            Enter the 6-digit code sent to{" "}
            <span className="text-slate-900 font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-300 rounded-lg text-center text-3xl font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-200"
            >
              Verify Account
            </button>
          </form>

          {(message || resendMessage) && (
            <div className={`mt-5 text-center text-sm py-3 px-4 rounded-lg ${
              (message.includes("successful") || resendMessage.includes("sent"))
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {message || resendMessage}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend Code"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}