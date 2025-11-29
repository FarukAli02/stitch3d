"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupplierLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Logging in...");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${data.message || "Login failed"}`);
      } else {
        localStorage.setItem("token", data.token);
        // route based on role returned from backend
        if (data.role === "supplier") router.push("/supplier/dashboard");
        else router.push("/customer/dashboard");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network error");
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[url('/leather-bg.jpg')] bg-cover p-6">
      <div className="w-full max-w-md bg-gray-900/95 border border-gray-800 rounded-xl p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Supplier Login</h1>
        <p className="text-sm text-gray-300 text-center mb-6">Sign in to manage materials and supply inventory.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email"
            className="w-full rounded-lg px-4 py-3 bg-gray-800 text-white border border-gray-700" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password"
            className="w-full rounded-lg px-4 py-3 bg-gray-800 text-white border border-gray-700" />

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message && <div className="mt-4 p-3 rounded bg-gray-800 text-gray-200 text-sm">{message}</div>}

        <div className="mt-4 flex justify-between text-sm text-gray-300">
          <a href="/forgotpassword" className="text-indigo-300">Forgot password?</a>
          <a href="/supplier/signup" className="text-amber-300">Create supplier account</a>
        </div>
      </div>
    </main>
  );
}
