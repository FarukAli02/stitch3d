"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pencil, 
  X, 
  LogOut, 
  User as UserIcon, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Shield,
  Mail,
  Settings,
  ShoppingBag,
  Phone
} from "lucide-react";
import Footer from "@/app/components/footer";
import UserAvatarMenu from "@/app/components/useravatar";
const API_BASE = "http://localhost:5000/api/auth";
export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "",
    phone_number: "",
    address: "",
    city: "",
    country: "",
    postal_code: ""
  });
  
  const [alert, setAlert] = useState({ type: "", message: "" });

  const token = () => (typeof window === "undefined" ? null : localStorage.getItem("token"));

  const showAlert = (type, message, ms = 4000) => {
    setAlert({ type, message });
    if (ms) setTimeout(() => setAlert({ type: "", message: "" }), ms);
  };

  useEffect(() => {
    const t = token();
    if (!t) {
      router.replace("/login");
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, { 
          headers: { Authorization: `Bearer ${t}` } 
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error("Failed to fetch profile");

        setProfile(data);
        
        // Handle both user data and customer data
        const customer = data.customer || {};
        setForm({ 
          firstName: data.first_name || "", 
          lastName: data.last_name || "", 
          email: data.email || "",
          phone_number: customer.phone_number || "",
          address: customer.address || "",
          city: customer.city || "",
          country: customer.country || "",
          postal_code: customer.postal_code || ""
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        showAlert("error", "Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cancelEdit = () => {
    if (!profile) return;
    const customer = profile.customer || {};
    setForm({ 
      firstName: profile.first_name || "", 
      lastName: profile.last_name || "", 
      email: profile.email,
      phone_number: customer.phone_number || "",
      address: customer.address || "",
      city: customer.city || "",
      country: customer.country || "",
      postal_code: customer.postal_code || ""
    });
    setEditing(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) {
      return showAlert("error", "First and Last name are required");
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token()}` 
        },
        body: JSON.stringify({ 
          firstName: form.firstName, 
          lastName: form.lastName,
          customer: {
            phone_number: form.phone_number || null,
            address: form.address || null,
            city: form.city || null,
            country: form.country || null,
            postal_code: form.postal_code || null
          }
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Update local state with returned data
      setProfile(data.user ? { ...data.user, customer: data.customer } : data);
      setEditing(false);
      showAlert("success", "Profile updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      showAlert("error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const initials = profile ? (profile.first_name?.[0] || "U").toUpperCase() : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div 
              className="flex items-center gap-1 cursor-pointer" 
              onClick={() => router.push("/customer/dashboard")}
            >
              <span className="text-xl font-bold text-slate-900">Stitch</span>
              <span className="text-xl font-bold text-indigo-600">3D</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-200">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
                  {initials}
                </div>
                <h2 className="text-lg font-bold text-slate-900 truncate w-full">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-sm text-slate-500 truncate w-full">{profile.email}</p>
                <span className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {profile.role || "Customer"}
                </span>
              </div>
              
              <nav className="mt-6 space-y-1">
                <button 
                  onClick={() => router.push("/customer/dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Dashboard
                </button>
                <div className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </div>
                <button 
                  onClick={() => router.push("/customer/settings")}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 space-y-6">
            
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-slate-900">Profile Information</h1>
              <p className="text-slate-600">Manage your personal details and contact information.</p>
            </div>

            {/* Personal Info */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Personal Details</h3>
                </div>
                {!editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      name="firstName"
                      disabled={!editing}
                      value={form.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      disabled={!editing}
                      value={form.lastName}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="email"
                          disabled
                          value={form.email}
                          className="block w-full pl-10 rounded-lg border-transparent bg-slate-50 text-slate-500 text-sm py-2.5 px-3.5 cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> 
                        Email cannot be changed for security
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {editing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 flex items-center gap-3 pt-4 border-t border-slate-200"
                      >
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-70"
                        >
                          {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-5 py-2.5 bg-white text-slate-700 border border-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </section>

            {/* Contact Info */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Contact Information</h3>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Phone Number"
                    name="phone_number"
                    type="tel"
                    disabled={!editing}
                    value={form.phone_number}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="City"
                    name="city"
                    disabled={!editing}
                    value={form.city}
                    onChange={handleInputChange}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Address"
                      name="address"
                      disabled={!editing}
                      value={form.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Input
                    label="Country"
                    name="country"
                    disabled={!editing}
                    value={form.country}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Postal Code"
                    name="postal_code"
                    disabled={!editing}
                    value={form.postal_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
      
      {/* Alert */}
      <AnimatePresence>
        {alert.message && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 max-w-sm backdrop-blur-sm ${
              alert.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {alert.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{alert.message}</p>
            <button onClick={() => setAlert({ type: "", message: "" })} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        disabled={disabled}
        className={`block w-full rounded-lg text-sm py-2.5 px-3.5 transition-all ${
          disabled 
            ? 'bg-slate-50 text-slate-500 cursor-not-allowed border-transparent' 
            : 'bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
        }`}
        {...props}
      />
    </div>
  );
}