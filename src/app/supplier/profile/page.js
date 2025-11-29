"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pencil, X, Truck, ClipboardList, Copy, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const API_BASE = "http://localhost:5000/api/auth";

export default function SupplierProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [editing, setEditing] = useState(false);
  const firstNameRef = useRef(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const [alert, setAlert] = useState({ type: "", message: "" });

  function showAlert(type, message, ms = 4500) {
    setAlert({ type, message });
    if (ms) setTimeout(() => setAlert({ type: "", message: "" }), ms);
  }

  function token() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  useEffect(() => {
    const t = token();
    if (!t) {
      showAlert("error", "Not authenticated — redirecting to login...", 2000);
      setTimeout(() => router.replace("/login"), 1200);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || "Failed to fetch profile");
        }
        const data = await res.json();
        if (data.role && data.role !== "supplier") {
          // protect supplier route
          showAlert("error", "Unauthorized — redirecting...", 1600);
          setTimeout(() => router.replace("/login"), 1200);
          setLoading(false);
          return;
        }
        setProfile(data);
        setForm({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Profile load error:", err);
        showAlert("error", err.message || "Unable to load profile", 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (editing) {
      setTimeout(() => firstNameRef.current?.focus(), 50);
    }
  }, [editing]);

  const inputClass = `
    mt-1 block w-full rounded-lg border border-transparent
    px-4 py-2 bg-gray-800 text-white placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-amber-500
  `;

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const cancelEdit = () => {
    if (!profile) return;
    setForm({ firstName: profile.first_name, lastName: profile.last_name, email: profile.email });
    setEditing(false);
    setAlert({ type: "", message: "" });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showAlert("warning", "First and last name are required.");
      return;
    }
    setSubmitting(true);
    const t = token();
    if (!t) {
      showAlert("error", "Not authenticated.");
      setSubmitting(false);
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      if (data.user) {
        setProfile(data.user);
        setForm({ firstName: data.user.first_name, lastName: data.user.last_name, email: data.user.email });
      } else {
        const fresh = await fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${t}` } });
        if (fresh.ok) {
          const freshData = await fresh.json();
          setProfile(freshData);
          setForm({ firstName: freshData.first_name, lastName: freshData.last_name, email: freshData.email });
        }
      }

      showAlert("success", data.message || "Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      console.error("Update profile error:", err);
      showAlert("error", err.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    setAlert({ type: "", message: "" });

    if (!pw.oldPassword || !pw.newPassword) {
      showAlert("warning", "Please complete password fields.");
      return;
    }
    if (pw.newPassword.length < 8) {
      showAlert("warning", "New password must be at least 8 characters.");
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      showAlert("warning", "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const t = token();
    if (!t) {
      showAlert("error", "Not authenticated.");
      setSubmitting(false);
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ oldPassword: pw.oldPassword, newPassword: pw.newPassword, confirmPassword: pw.confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");
      showAlert("success", data.message || "Password changed successfully.");
      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPwOpen(false);
    } catch (err) {
      console.error("Change password error:", err);
      showAlert("error", err.message || "Change password failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, { method: "POST" });
    } catch (e) {
      /* ignore */
    } finally {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-44 bg-gray-800 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="h-64 bg-gray-800 rounded-xl" />
            <div className="lg:col-span-2 h-64 bg-gray-800 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-white">Unable to load profile. Please log in.</div>
      </main>
    );
  }

  const displayName = (profile.first_name || profile.email || "Supplier").split(" ")[0];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between py-4 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600 rounded-md shadow">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-white">Supplier Portal</div>
              <div className="text-sm text-gray-400">Manage supplier account & security</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/supplier/dashboard")} className="px-3 py-2 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800">
              Dashboard
            </button>
            <button onClick={() => router.push("/supplier/orders")} className="px-3 py-2 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800">
              Orders
            </button>
            <button onClick={handleLogout} className="px-3 py-2 rounded-md bg-amber-600 text-black font-medium hover:bg-amber-500">
              <LogOut className="inline w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-900/20">
            <img
              src="https://placehold.co/1200x380/0f172a/94a3b8?text=Supplier+Studio"
              alt="hero"
              className="w-full h-44 md:h-56 lg:h-64 object-cover brightness-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center pl-6 md:pl-12">
              <div className="max-w-2xl text-white py-6">
                <h1 className="text-3xl md:text-4xl font-extrabold leading-snug">
                  Supplier Profile — <span className="text-amber-400">{displayName}</span>
                </h1>
                <p className="mt-2 text-base md:text-lg text-gray-300">Update your supplier account, security and business details.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <aside className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center text-2xl font-bold">
                {String((profile.first_name || "S").charAt(0)).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{profile.first_name} {profile.last_name}</div>
                <div className="text-xs text-gray-300 truncate" title={profile.email}>{profile.email}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                profile.status === "active" ? "bg-emerald-700/10 text-emerald-300 border border-emerald-700/20" : "bg-yellow-700/10 text-yellow-300 border border-yellow-700/20"
              }`}>
                <span className={`w-2 h-2 rounded-full ${profile.status === "active" ? "bg-emerald-400" : "bg-yellow-400"}`} />
                <span className="text-sm">{profile.status || "pending"}</span>
              </div>

              <div className="flex gap-3">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Products</div>
                  <div className="text-lg font-semibold text-white">—</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400">Orders</div>
                  <div className="text-lg font-semibold text-white">—</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => router.push("/supplier/dashboard")} className="flex items-center gap-3 px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-black">
                <Truck className="w-4 h-4" /> Dashboard
              </button>

              <button onClick={() => router.push("/supplier/orders")} className="flex items-center gap-3 px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white border border-gray-700">
                <ClipboardList className="w-4 h-4" /> Orders
              </button>
            </div>

            <div className="mt-auto border-t border-gray-700 pt-4 text-sm text-gray-400 flex flex-col gap-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(profile.email);
                  showAlert("success", "Email copied to clipboard");
                }}
                className="flex items-center gap-2 hover:text-white"
              >
                <Copy className="w-4 h-4" /> Copy email
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-rose-400 hover:text-rose-200">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </aside>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">My Profile</h3>
                  <p className="text-sm text-gray-400">Edit your personal information (email is read-only)</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!editing) {
                        setForm({ firstName: profile.first_name || "", lastName: profile.last_name || "", email: profile.email || "" });
                        setEditing(true);
                      } else {
                        cancelEdit();
                      }
                    }}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white"
                    aria-label={editing ? "Cancel edit" : "Edit profile"}
                  >
                    {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label>
                    <span className="text-sm text-gray-200">First name</span>
                    <input
                      name="firstName"
                      ref={firstNameRef}
                      value={form.firstName}
                      onChange={onChange}
                      className={inputClass}
                      placeholder="First name"
                      disabled={!editing}
                    />
                  </label>

                  <label>
                    <span className="text-sm text-gray-200">Last name</span>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      className={inputClass}
                      placeholder="Last name"
                      disabled={!editing}
                    />
                  </label>
                </div>

                <label>
                  <span className="text-sm text-gray-200">Email address</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    className={`${inputClass} bg-gray-800 placeholder-gray-400`}
                    placeholder="you@example.com"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support if you need to update it.</p>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!editing || submitting}
                    className={`px-4 py-2 rounded-md text-black ${editing ? "bg-amber-500 hover:bg-amber-400" : "bg-gray-700/50 cursor-not-allowed"}`}
                  >
                    {submitting ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-md border border-gray-700 text-gray-200 bg-transparent"
                  >
                    Reset
                  </button>

                  {alert.message && (
                    <div className={`ml-auto text-sm px-3 py-2 rounded ${alert.type === "success" ? "bg-emerald-700/10 text-emerald-200" : alert.type === "warning" ? "bg-yellow-700/10 text-yellow-200" : "bg-rose-700/10 text-rose-200"}`}>
                      {alert.message}
                    </div>
                  )}
                </div>
              </form>
            </section>

            {/* Security / Password */}
            <section className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Update your Password</h3>
                  <p className="text-sm text-gray-400">Change your password periodically for safety.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setPwOpen((s) => !s); setPw({ oldPassword: "", newPassword: "", confirmPassword: "" }); setAlert({ type: "", message: "" }); }}
                    className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white"
                    aria-label={pwOpen ? "Cancel password change" : "Change password"}
                  >
                    {pwOpen ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <label>
                  <span className="text-sm text-gray-200">Current password</span>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="Current password"
                    value={pw.oldPassword}
                    onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })}
                    disabled={!pwOpen}
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label>
                    <span className="text-sm text-gray-200">New password</span>
                    <input
                      type="password"
                      className={inputClass}
                      placeholder="New password (min 8 chars)"
                      value={pw.newPassword}
                      onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                      disabled={!pwOpen}
                    />
                  </label>

                  <label>
                    <span className="text-sm text-gray-200">Confirm new password</span>
                    <input
                      type="password"
                      className={inputClass}
                      placeholder="Repeat new password"
                      value={pw.confirmPassword}
                      onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })}
                      disabled={!pwOpen}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!pwOpen || submitting}
                    className={`px-4 py-2 rounded-md text-black ${pwOpen ? "bg-amber-500 hover:bg-amber-400" : "bg-gray-700/50 cursor-not-allowed"}`}
                  >
                    {submitting ? "Changing..." : "Change password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPw({ oldPassword: "", newPassword: "", confirmPassword: "" })}
                    className="px-4 py-2 rounded-md border border-gray-700 text-gray-200 bg-transparent"
                  >
                    Clear
                  </button>

                  <div className="ml-auto text-sm text-gray-400">Password not shown for security.</div>
                </div>
              </form>
            </section>
          </div>
        </div>

        {/* floating alert */}
        {alert.message && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="fixed bottom-6 right-6 bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="text-sm text-white">
              <strong className="block mb-1">{alert.type === "success" ? "Success" : alert.type === "warning" ? "Notice" : "Error"}</strong>
              <span>{alert.message}</span>
            </div>
            <div className="mt-2 text-right">
              <button onClick={() => setAlert({ type: "", message: "" })} className="text-xs text-gray-400">Dismiss</button>
            </div>
          </motion.div>
        )}

        <div className="h-16" />
      </div>
    </main>
  );
}
