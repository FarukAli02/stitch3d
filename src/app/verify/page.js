"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
export default function Verify() {
  const router = useRouter();
  // Ensure email is present before accessing the param
  const email = useSearchParams() ? useSearchParams().get("email") : null; 
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Verifying code..."); 
    setResendMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();     
      if (res.ok) {
        // SUCCESS PATH: Set clear message, then redirect immediately.
        setMessage(`✅ ${data.message || "Verification successful! Redirecting..."}`);
        router.push("/login"); // Immediate redirect
        return; // ⬅️ FIX: Explicit return to terminate the function
      } else {
        // FAILURE PATH: Set clear error message
        setMessage(`❌ ${data.message || "Invalid or expired code."}`);
      }
    } catch (err) {
      setMessage("❌ A network error occurred during verification.");
    }
  };
  const handleResend = async () => {
    if (!email) return setResendMessage("❌ Missing email parameter.");
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
        setResendMessage(`✅ ${data.message || "New code sent successfully!"}`);
      } else {
        setResendMessage(`❌ ${data.message || "Failed to resend code. Try again later."}`);
      }
    } catch (err) {
      setResendMessage("❌ Failed to resend verification code (Network error).");
    } finally {
      setResending(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 shadow-2xl shadow-indigo-900/20 rounded-xl p-6 sm:p-8 transition-all duration-300">     
        <h1 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Verify Your Stitch<span className="text-indigo-400">3D</span> Account
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Enter the 6-digit code sent to <strong className="font-semibold text-gray-200">{email || 'your email'}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} 
            placeholder="— — — — — —"
            className="w-full border border-gray-700 bg-gray-800 rounded-lg p-4 text-center tracking-[0.5em] text-2xl font-mono text-white placeholder-gray-500 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all duration-300 uppercase tracking-wider"
          >
            Verify Account
          </button>
        </form>
        {(message || resendMessage) && (
            <div 
              className={`mt-5 text-center text-sm p-4 rounded-lg font-medium transition-colors ${
                (message.startsWith("✅") || resendMessage.startsWith("✅"))
                  ? "bg-green-900/30 text-green-300 border border-green-800"
                  : (message.startsWith("❌") || resendMessage.startsWith("❌"))
                  ? "bg-rose-900/30 text-rose-300 border border-rose-800"
                  : "bg-gray-800 text-gray-300 border border-gray-700"
              }`}
            >
              {message || resendMessage}
            </div>
          )}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Didn’t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Resending..." : "Resend Code"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}