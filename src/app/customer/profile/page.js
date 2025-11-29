"use client";
import React, { useEffect, useRef, useState } from "react";
import { Pencil, X, Home, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:5000/api/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const firstNameRef = useRef(null);

  const showAlert = (type, message, ms = 4000) => {
    setAlert({ type, message });
    if (ms) setTimeout(() => setAlert({ type: "", message: "" }), ms);
  };

  const token = () => (typeof window === "undefined" ? null : localStorage.getItem("token"));

  useEffect(() => {
    const t = token();
    if (!t) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${t}` } });
        const data = await res.json();
        setProfile(data);
        setForm({ firstName: data.first_name, lastName: data.last_name, email: data.email });
      } catch {
        showAlert("error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const inputClass = `
    mt-1 block w-full rounded-lg border border-gray-700/70
    px-4 py-2 bg-gray-800/70 text-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-indigo-500 transition
  `;

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const cancelEdit = () => {
    if (!profile) return;
    setForm({ firstName: profile.first_name, lastName: profile.last_name, email: profile.email });
    setEditing(false);
  };

  if (loading)
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-300 text-lg">
        Loading profile...
      </main>
    );

  if (!profile)
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        No profile data.
      </main>
    );

  const displayName = profile.first_name || profile.email.split("@")[0];

  return (
    <main className="min-h-screen bg-[url('/textures/dark-leather.jpg')] bg-cover bg-center bg-fixed relative text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95 backdrop-blur-[2px]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-10 border-b border-indigo-500/20 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-500 drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]">
            Stitch<span className="text-white">3D</span> Profile
          </h1>
          <div className="flex gap-3">
            <button onClick={() => router.push("/customer/dashboard")} className="px-4 py-2 rounded-lg border border-indigo-500/40 hover:bg-indigo-600/30 transition-all duration-300">
              <Home className="inline w-4 h-4 mr-1" /> Home
            </button>
            <button onClick={() => { localStorage.removeItem("token"); router.replace("/login"); }} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 transition-all duration-300">Logout</button>
          </div>
        </header>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.3)]">
          <img src="/generated_images/backgroundimage.png" alt="" className="w-full h-56 object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
            <div className="pl-10 max-w-xl">
              <h2 className="text-4xl font-bold text-white">
                Welcome, <span className="text-indigo-400">{displayName}</span>
              </h2>
              <p className="mt-2 text-gray-300">Manage your profile, security, and order details.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <aside className="bg-gradient-to-b from-gray-900/80 to-gray-800/70 rounded-2xl border border-gray-700/60 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] p-6 flex flex-col gap-6 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-2xl font-bold shadow-inner">
                {profile.first_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{profile.first_name} {profile.last_name}</h3>
                <p className="text-sm text-gray-400">{profile.email}</p>
              </div>
            </div>

            <div className="border-t border-dashed border-indigo-500/30 my-2" />

            <button onClick={() => router.push("/customer/orders")} className="flex items-center gap-3 px-4 py-2 bg-indigo-600/70 hover:bg-indigo-500 rounded-md transition-all">
              <ClipboardList className="w-4 h-4" /> My Orders
            </button>

            <button onClick={() => navigator.clipboard.writeText(profile.email)} className="text-left text-gray-400 hover:text-indigo-300 mt-auto text-sm">
              Copy Email
            </button>
          </aside>

          {/* Right content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile card */}
            <section className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 border border-gray-700/60 rounded-2xl p-6 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-indigo-300">Personal Info</h3>
                <button onClick={() => setEditing(!editing)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">
                  {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <label>
                    <span className="text-sm text-gray-300">First Name</span>
                    <input name="firstName" value={form.firstName} onChange={onChange} className={inputClass} disabled={!editing} />
                  </label>
                  <label>
                    <span className="text-sm text-gray-300">Last Name</span>
                    <input name="lastName" value={form.lastName} onChange={onChange} className={inputClass} disabled={!editing} />
                  </label>
                </div>

                <label>
                  <span className="text-sm text-gray-300">Email</span>
                  <input type="email" value={form.email} className={`${inputClass} bg-gray-900/80`} disabled />
                </label>

                <div className="pt-3 flex gap-3">
                  <button type="button" disabled={!editing} className={`px-4 py-2 rounded-md ${editing ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-700/40"} transition`}>
                    Save
                  </button>
                  <button onClick={cancelEdit} className="px-4 py-2 rounded-md border border-gray-700 text-gray-300">Reset</button>
                </div>
              </form>
            </section>

            {/* Password card */}
            <section className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 border border-gray-700/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-amber-300">Security</h3>
                <button onClick={() => setPwOpen(!pwOpen)} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600">
                  {pwOpen ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
              </div>
              {pwOpen && (
                <form className="space-y-4">
                  <input type="password" placeholder="Current Password" className={inputClass} />
                  <input type="password" placeholder="New Password" className={inputClass} />
                  <input type="password" placeholder="Confirm New Password" className={inputClass} />
                  <button className="bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-md text-black font-semibold">Change Password</button>
                </form>
              )}
            </section>

          </div>
        </div>

        {/* Alert */}
        {alert.message && (
          <div className="fixed bottom-6 right-6 bg-black/60 backdrop-blur-md border border-indigo-500/30 px-5 py-3 rounded-xl shadow-lg animate-fade-in">
            <p className="text-sm text-white">
              <strong className="text-indigo-300">{alert.type.toUpperCase()}:</strong> {alert.message}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
