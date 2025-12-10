"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("✅ Success! Redirecting...");
        setTimeout(() => {
          if (data.role === "customer") router.push("/customer/dashboard");
        }, 400);
      } else {
        setMessage(`❌ ${data.message || "Login failed. Please check your credentials."}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 shadow-2xl shadow-indigo-900/20 rounded-xl p-6 sm:p-8 transition-all duration-300">
        <h1 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Welcome Back to Stitch<span className="text-indigo-400">3D</span>
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Log in to access your customization studio and orders.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none"
            autoComplete="email"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-400 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none"
            autoComplete="current-password"
            required
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <Link href="/forgotpassword" className="hover:text-indigo-400 underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all duration-300 uppercase tracking-wider mt-4 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {message && (
          <div
            className={`mt-5 text-center text-sm p-4 rounded-lg font-medium transition-colors ${
              message.startsWith("✅")
                ? "bg-green-900/30 text-green-300 border border-green-800"
                : message.startsWith("❌")
                ? "bg-rose-900/30 text-rose-300 border border-rose-800"
                : "bg-gray-800 text-gray-300 border border-gray-700"
            }`}
          >
            {message}
          </div>
        )}
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-400">
          <div>Don't have an account?</div>
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}