"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Bell,
  Lock,
  Pencil,
  CreditCard,
  Globe,
  Trash2,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import Footer from "@/app/components/footer";
const API_BASE = "http://localhost:5000/api/auth";
export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Security Settings
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notification Settings (stored in localStorage for now)
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newArrivals: true,
    promotions: false,
    emailNotifications: false
  });

  // Privacy Settings (stored in localStorage for now)
  const [privacy, setPrivacy] = useState({
    showActivity: true,
    allowDataSharing: false
  });

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

    // Load saved preferences from localStorage
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedPrivacy = localStorage.getItem("privacy");
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));

    setLoading(false);
  }, [router]);

  // Backend Connected: Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert("error", "New passwords do not match");
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      showAlert("error", "Password must be at least 6 characters");
      return false;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password update failed");

      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      showAlert("success", "Password changed successfully");
      return true; // Return success status
    } catch (err) {
      showAlert("error", err.message);
      return false; // Return failure status
    } finally {
      setSubmitting(false);
    }
  };

  // LocalStorage: Save Notification Preferences
  const handleNotificationsSave = () => {
    setSubmitting(true);
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
      showAlert("success", "Notification preferences saved");
    } catch (err) {
      showAlert("error", "Failed to save preferences");
    } finally {
      setSubmitting(false);
    }
  };

  // LocalStorage: Save Privacy Settings
  const handlePrivacySave = () => {
    setSubmitting(true);
    try {
      localStorage.setItem("privacy", JSON.stringify(privacy));
      showAlert("success", "Privacy settings saved");
    } catch (err) {
      showAlert("error", "Failed to save settings");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "account", label: "Account", icon: Trash2 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
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
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account preferences and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "security" && (
                  <SecuritySection
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    handlePasswordChange={handlePasswordChange}
                    submitting={submitting}
                  />
                )}

                {activeTab === "notifications" && (
                  <NotificationsSection
                    notifications={notifications}
                    setNotifications={setNotifications}
                    handleSave={handleNotificationsSave}
                    submitting={submitting}
                  />
                )}

                {activeTab === "privacy" && (
                  <PrivacySection
                    privacy={privacy}
                    setPrivacy={setPrivacy}
                    handleSave={handlePrivacySave}
                    submitting={submitting}
                  />
                )}

                {activeTab === "payment" && <PaymentSection />}
                {activeTab === "preferences" && <PreferencesSection />}
                {activeTab === "account" && <AccountSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />

      {/* Alert Toast */}
      <AnimatePresence>
        {alert.message && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 max-w-sm backdrop-blur-sm ${
              alert.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {alert.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
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

// Security Section - Updated with Pencil Icon & Toggle Logic
function SecuritySection({ passwordForm, setPasswordForm, handlePasswordChange, submitting }) {
  const [isEditing, setIsEditing] = useState(false);

  // Wrapper to handle closing the form on success
  const onSave = async (e) => {
    const success = await handlePasswordChange(e);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Section
        title="Password"
        icon={Lock}
        // Action prop renders the pencil icon when not editing
        action={
          !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
              title="Edit Password"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )
        }
      >
        {!isEditing ? (
          // View Mode
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none pt-1">••••••••••••••••</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Encrypted</span>
          </div>
        ) : (
          // Edit Mode
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={onSave}
            className="space-y-4"
          >
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              required
              placeholder="Enter your current password"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                placeholder="Min. 6 characters"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                placeholder="Re-enter new password"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {submitting ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={submitting}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </Section>

      <Section title="Two-Factor Authentication" icon={Shield}>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Two-factor authentication is managed during account creation and cannot be modified here.
          </p>
        </div>
      </Section>
    </div>
  );
}

// Notifications Section
function NotificationsSection({ notifications, setNotifications, handleSave, submitting }) {
  return (
    <Section title="Notification Preferences" icon={Bell}>
      <div className="space-y-4">
        <ToggleSwitch
          label="Order Updates"
          description="Get notified about order status changes"
          enabled={notifications.orderUpdates}
          onChange={(val) => setNotifications({ ...notifications, orderUpdates: val })}
        />
        <ToggleSwitch
          label="New Arrivals"
          description="Be the first to know about new products"
          enabled={notifications.newArrivals}
          onChange={(val) => setNotifications({ ...notifications, newArrivals: val })}
        />
        <ToggleSwitch
          label="Promotions & Offers"
          description="Receive exclusive deals and discounts"
          enabled={notifications.promotions}
          onChange={(val) => setNotifications({ ...notifications, promotions: val })}
        />
        <ToggleSwitch
          label="Email Notifications"
          description="Get important updates via text message"
          enabled={notifications.emailNotifications}
          onChange={(val) => setNotifications({ ...notifications, emailNotifications: val })}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={submitting}
        className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {submitting ? "Saving..." : "Save Preferences"}
      </button>
    </Section>
  );
}

// Privacy Section
function PrivacySection({ privacy, setPrivacy, handleSave, submitting }) {
  return (
    <Section title="Privacy Settings" icon={Lock}>
      <div className="space-y-4">
        <ToggleSwitch
          label="Show Activity"
          description="Allow others to see your recent activity"
          enabled={privacy.showActivity}
          onChange={(val) => setPrivacy({ ...privacy, showActivity: val })}
        />
        <ToggleSwitch
          label="Data Sharing"
          description="Share anonymized data to improve services"
          enabled={privacy.allowDataSharing}
          onChange={(val) => setPrivacy({ ...privacy, allowDataSharing: val })}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={submitting}
        className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {submitting ? "Saving..." : "Save Settings"}
      </button>
    </Section>
  );
}

// Payment Section
function PaymentSection() {
  return (
    <Section title="Payment Methods" icon={CreditCard}>
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-600 mb-4">No saved payment methods</p>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all">
          Add Payment Method
        </button>
      </div>
    </Section>
  );
}

// Preferences Section
function PreferencesSection() {
  return (
    <Section title="Preferences" icon={Globe}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
          <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
          <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900">
            <option>USD ($)</option>
            <option>PKR(PKR)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </select>
        </div>
      </div>
    </Section>
  );
}

// Account Section
function AccountSection() {
  return (
    <Section title="Account Management" icon={Trash2}>
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Download Your Data</h4>
          <p className="text-sm text-blue-700 mb-4">
            Request a copy of your personal data and order history
          </p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all">
            Request Data Export
          </button>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <h4 className="font-semibold text-rose-900 mb-2">Delete Account</h4>
          <p className="text-sm text-rose-700 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-all">
            Delete My Account
          </button>
        </div>
      </div>
    </Section>
  );
}

// Reusable Components - Updated to accept 'action' prop for header buttons
function Section({ title, icon: Icon, action, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

function ToggleSwitch({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-slate-900">{label}</p>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}