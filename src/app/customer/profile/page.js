// File: app/customer/profile/page.js
// Purpose: Customer profile management (Light Theme)
// Note: Logic aligned with authcontroller.js and authroute.js

"use client";

import React, { useEffect, useState } from "react";
import { 
  Pencil, 
  X, 
  Home, 
  ClipboardList, 
  LogOut, 
  User as UserIcon, 
  Lock, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Keeping your existing API path
const API_BASE = "http://localhost:5000/api/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  // State: Profile Form (firstName/lastName matches backend controller expectations)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  
  // State: Password Form
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  
  // State: UI
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const showAlert = (type, message, ms = 4000) => {
    setAlert({ type, message });
    if (ms) setTimeout(() => setAlert({ type: "", message: "" }), ms);
  };

  const token = () => (typeof window === "undefined" ? null : localStorage.getItem("token"));

  // --- 1. Fetch Profile ---
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
        
        // Map DB 'first_name' -> State 'firstName'
        setForm({ 
          firstName: data.first_name || "", 
          lastName: data.last_name || "", 
          email: data.email 
        });
      } catch {
        showAlert("error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Input Handlers
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onPwChange = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  const cancelEdit = () => {
    if (!profile) return;
    setForm({ firstName: profile.first_name, lastName: profile.last_name, email: profile.email });
    setEditing(false);
  };

  // --- 2. Update Profile Logic ---
  const handleUpdateProfile = async () => {
    if (!form.firstName || !form.lastName) return showAlert("error", "First and Last name are required");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        // Body keys match authcontroller.js: { firstName, lastName }
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Update local state immediately
      setProfile({ ...profile, first_name: form.firstName, last_name: form.lastName });
      setEditing(false);
      showAlert("success", "Profile updated successfully!");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. Update Password Logic ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) return showAlert("error", "New passwords do not match");
    if (pw.newPassword.length < 6) return showAlert("error", "Password must be at least 6 characters");

    setSubmitting(true);
    try {
      // URL matches authroute.js: /profile/password
      const res = await fetch(`${API_BASE}/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ 
          oldPassword: pw.oldPassword, 
          newPassword: pw.newPassword, 
          confirmPassword: pw.confirmPassword 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password update failed");

      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPwOpen(false);
      showAlert("success", "Password changed successfully!");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Styles (Light Theme)
  const inputClass = `
    mt-1 block w-full rounded-lg border border-gray-300
    px-4 py-2 bg-white text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
    disabled:bg-gray-100 disabled:text-gray-500
  `;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-indigo-600 font-medium">Loading profile...</div>
      </main>
    );
  }

  if (!profile) return null;

  const initials = (profile.first_name?.[0] || "U").toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Header (Aligned with Dashboard) */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push("/customer/dashboard")}>
            <div className="text-2xl font-extrabold tracking-tight select-none">
              <span className="text-gray-900">Stitch</span>
              <span className="text-indigo-600">3D</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push("/customer/dashboard")} 
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> Home
            </button>
            <button 
              onClick={() => { localStorage.removeItem("token"); router.replace("/login"); }} 
              className="px-4 py-2 rounded-lg text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6 sticky top-24"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold mb-3 shadow-inner">
                  {initials}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <div className="mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {profile.role || "Customer"}
                </div>
              </div>

              <nav className="space-y-1">
                <button onClick={() => router.push("/customer/orders")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors font-medium">
                  <ClipboardList className="w-4 h-4" /> My Orders
                </button>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                  <UserIcon className="w-4 h-4" /> Profile Settings
                </div>
              </nav>

              <div className="border-t my-4"></div>
              
              <button onClick={() => navigator.clipboard.writeText(profile.email)} className="w-full text-left text-xs text-gray-400 hover:text-indigo-500 transition-colors px-3">
                Copy Email Address
              </button>
            </motion.div>
          </aside>

          {/* Forms Section */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* 1. Profile Information Card */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500">Update your personal details.</p>
                </div>
                <button 
                  onClick={() => setEditing(!editing)} 
                  className={`p-2 rounded-lg transition-colors ${editing ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-6">
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input name="firstName" value={form.firstName} onChange={onChange} className={inputClass} disabled={!editing} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input name="lastName" value={form.lastName} onChange={onChange} className={inputClass} disabled={!editing} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={form.email} className={inputClass} disabled />
                    <p className="mt-1 text-xs text-gray-400">Email cannot be changed manually.</p>
                  </div>

                  <AnimatePresence>
                    {editing && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 flex gap-3"
                      >
                        <button 
                          type="button" 
                          onClick={handleUpdateProfile} 
                          disabled={submitting} 
                          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all disabled:opacity-70"
                        >
                          {submitting ? "Saving..." : "Save Changes"}
                        </button>
                        <button 
                          type="button" 
                          onClick={cancelEdit} 
                          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.section>

            {/* 2. Security Card */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Security</h3>
                    <p className="text-sm text-gray-500">Change your password.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPwOpen(!pwOpen)} 
                  className={`p-2 rounded-lg transition-colors ${pwOpen ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {pwOpen ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {pwOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">
                      <form className="space-y-4 max-w-lg" onSubmit={handleUpdatePassword}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input 
                            type="password" name="oldPassword" 
                            value={pw.oldPassword} onChange={onPwChange} 
                            className={inputClass} required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input 
                            type="password" name="newPassword" 
                            value={pw.newPassword} onChange={onPwChange} 
                            className={inputClass} required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input 
                            type="password" name="confirmPassword" 
                            value={pw.confirmPassword} onChange={onPwChange} 
                            className={inputClass} required
                          />
                        </div>
                        <div className="pt-2">
                          <button 
                            type="submit" 
                            disabled={submitting} 
                            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm transition-all disabled:opacity-70"
                          >
                            {submitting ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

          </div>
        </div>

        {/* Floating Toast Alert */}
        <AnimatePresence>
          {alert.message && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-xl border flex items-center gap-3 z-50 ${
                alert.type === 'error' 
                  ? 'bg-white border-red-200 text-red-700' 
                  : 'bg-white border-green-200 text-green-700'
              }`}
            >
              {alert.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              <div>
                <p className="text-sm font-bold">{alert.type === 'error' ? 'Error' : 'Success'}</p>
                <p className="text-sm">{alert.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}