"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Box, Package, DollarSign, UserCog } from "lucide-react";

export default function SupplierDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); // ✅ fixed path
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.replace("/login"); // ✅ fixed path
          return;
        }

        const data = await res.json();
        if (data.role !== "supplier") {
          router.replace("/");
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error(err);
        router.replace("/login"); // ✅ fixed path
      }
    })();
  }, [router]);

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading your supplier dashboard...
      </div>
    );
  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400 tracking-tight">
              Welcome back, {profile.first_name}! 👋
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your products, pricing, profile, and orders efficiently.
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login"); // ✅ fixed path
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 transition rounded-md font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </header>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-amber-500 transition cursor-pointer"
          >
            <Box className="text-amber-400 w-8 h-8 mb-3" />
            <h2 className="text-xl font-semibold mb-1">Inventory</h2>
            <p className="text-gray-400 text-sm">
              Track available stock and update quantities.
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-500 transition cursor-pointer"
          >
            <Package className="text-green-400 w-8 h-8 mb-3" />
            <h2 className="text-xl font-semibold mb-1">Orders</h2>
            <p className="text-gray-400 text-sm">
              View and manage vendor orders in real time.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition cursor-pointer"
          >
            <DollarSign className="text-blue-400 w-8 h-8 mb-3" />
            <h2 className="text-xl font-semibold mb-1">Materials & Pricing</h2>
            <p className="text-gray-400 text-sm">
              Adjust material costs and product pricing.
            </p>
          </motion.div>
          {/* Profile Management Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/supplier/profile")}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-purple-500 transition cursor-pointer"
          >
            <UserCog className="text-purple-400 w-8 h-8 mb-3" />
            <h2 className="text-xl font-semibold mb-1">Profile Management</h2>
            <p className="text-gray-400 text-sm">
              Update your account info and supplier details.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
