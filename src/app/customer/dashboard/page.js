// pages/dashboard.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Moon,
  User as UserIcon,
  LogOut,
  Settings,
} from "lucide-react";

/**
 * Single-file Dashboard page with Framer Motion + lucide-react
 * - Paste into pages/dashboard.jsx (Page Router)
 * - Requires: tailwindcss, framer-motion, lucide-react
 */

export default function DashboardPage() {
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const [products, setProducts] = useState([
    {
      id: 1,
      title: "Classic Leather",
      price: 390,
      img: "https://miro.medium.com/v2/resize:fit:600/1*sJGRHxd0Q5wNXsPs4gZRvg.jpeg",
    },
    {
      id: 2,
      title: "Custom Street Jacket",
      price: 420,
      img: "https://tse1.mm.bing.net/th/id/OIP.VGlLe9KI1ULxY2OG5QXePAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: 3,
      title: "Minimalist Leather",
      price: 320,
      img: "https://tse2.mm.bing.net/th/id/OIP.XWHyVbqQhjR0BpSWHbCYQwHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: 4,
      title: "Vintage Motor Jacket",
      price: 390,
      img: "https://th.bing.com/th/id/OIP.ergNH0eXxWFFcQTm1HTOZgHaHy?w=172&h=181&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    },
  ]);

  const [stats, setStats] = useState({
    totalOrders: 8,
    activeCustoms: 3,
    savedDesigns: 5,
    inProgress: 2,
  });

  const menuRef = useRef(null);

  // profile fetch
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoadingProfile(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          setLoadingProfile(false);
          return;
        }
        const data = await res.json();
        setProfile({
          firstName: data.first_name || data.firstName || "",
          lastName: data.last_name || data.lastName || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // init cart
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((s, i) => s + (i.quantity || 0), 0));
  }, []);

  // close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setProfileMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout network error:", err);
    } finally {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  };

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((i) => i.id === product.id);
    if (idx > -1) cart[idx].quantity = (cart[idx].quantity || 0) + 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.reduce((s, i) => s + (i.quantity || 0), 0));
    if (typeof window !== "undefined") {
      // animate simple feedback
      const toast = document.createElement("div");
      toast.innerText = `${product.title} added to cart`;
      toast.className = "fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    }
  };

  const initials = (profile?.firstName?.[0] || "N").toUpperCase();

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-gray-300">Loading dashboard…</div>
      </main>
    );
  }

  // framer motion variants
  const heroVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardHover = { scale: 1.02, y: -4, boxShadow: "0 12px 30px rgba(37,99,235,0.12)" };
  const btnTap = { scale: 0.98 };

  const gridStagger = {
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };
  const gridItem = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-extrabold tracking-tight select-none">
              <span className="text-gray-900">Stitch</span>
              <span className="text-indigo-600">3D</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* cart */}
            <a href="/customer/cart" className="relative p-2 rounded-md hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </a>

            {/* theme */}
            <button aria-label="toggle-theme" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Moon className="w-5 h-5 text-gray-600" />
            </button>

            {/* profile */}
            <div className="relative" ref={menuRef}>
              <motion.button
                onClick={() => setProfileMenuOpen((s) => !s)}
                whileTap={{ scale: 0.96 }}
                className="p-2 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
              </motion.button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-3 w-44 bg-white rounded-lg shadow-lg border z-40 overflow-hidden"
                  >
                    <a className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" href="/customer/profile">
                      <UserIcon className="w-4 h-4 text-indigo-500" /> Profile
                    </a>
                    <a className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" href="/settings">
                      <Settings className="w-4 h-4 text-gray-500" /> Settings
                    </a>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-gray-50">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-xl shadow-sm border p-5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
                <div>
                  <div className="text-lg font-medium">{profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ""}` : "Guest"}</div>
                  <div className="text-sm text-gray-500 truncate">{profile?.email ?? "—"}</div>
                </div>
              </div>
              <nav className="space-y-2">
                <a className="block px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">Dashboard</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-50">My Orders</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-50">Saved Designs</a>
                <a className="block px-3 py-2 rounded-lg hover:bg-gray-50">Account</a>
              </nav>
              <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <button onClick={handleLogout} className="mt-2 w-full text-left text-rose-600">
                  Sign out
                </button>
              </div>
            </motion.div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-9 space-y-8">
            {/* Hero */}
            <motion.section initial="hidden" animate="visible" variants={heroVariants}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/20">
                <img
                  src="https://placehold.co/1200x380/374151/9ca3af?text=Leather+Customization+Studio"
                  alt="hero"
                  className="w-full h-48 md:h-64 lg:h-72 object-cover object-center brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent flex items-center pl-6 md:pl-12">
                  <div className="max-w-2xl text-white py-8">
                    <motion.h1
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06, duration: 0.5 }}
                      className="text-3xl md:text-5xl font-extrabold leading-snug"
                    >
                      Welcome back, <span className="text-indigo-400">{profile?.firstName ?? "there"}</span>!
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="mt-3 text-base md:text-xl text-gray-300">
                      Ready to craft your next leather masterpiece?
                    </motion.p>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="mt-6 flex flex-col sm:flex-row gap-4">
                      <motion.a
                        whileHover={{ y: -2 }}
                        whileTap={btnTap}
                        href="/customize"
                        className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm md:text-base font-semibold shadow-lg shadow-indigo-600/30 transition-all uppercase tracking-wider text-center"
                      >
                        Start Customizing
                      </motion.a>

                      <motion.a
                        whileHover={{ y: -2 }}
                        whileTap={btnTap}
                        href="#trending"
                        className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-gray-200 rounded-lg text-sm md:text-base font-medium shadow-sm transition-colors text-center"
                      >
                        Explore Trending Jackets
                      </motion.a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.section>
            {/* Quick Stats */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800">Quick Stats</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div whileHover={cardHover} className="bg-white rounded-xl p-5 shadow-sm border">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </motion.div>
                <motion.div whileHover={cardHover} className="bg-white rounded-xl p-5 shadow-sm border">
                  <p className="text-sm text-gray-500">Active Custom Designs</p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">{stats.activeCustoms}</p>
                </motion.div>
                <motion.div whileHover={cardHover} className="bg-white rounded-xl p-5 shadow-sm border">
                  <p className="text-sm text-gray-500">Saved Designs</p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">{stats.savedDesigns}</p>
                </motion.div>
                <motion.div whileHover={cardHover} className="bg-indigo-50 rounded-xl p-5 shadow-sm border border-indigo-100">
                  <p className="text-sm text-indigo-600">In Progress Orders</p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                </motion.div>
              </div>
            </section>
            {/* Trending grid */}
            <section id="trending">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Trending Jackets</h2>
                <div className="text-sm text-gray-500">Hand-picked for you</div>
              </div>
              <div className="mt-4 mb-2">
                <div className="inline-block px-3 py-2 border rounded-md bg-white">All</div>
              </div>
              <motion.div
                variants={gridStagger}
                initial="hidden"
                animate="visible"
                className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                {products.map((p) => (
                  <motion.article key={p.id} variants={gridItem} whileHover={{ scale: 1.02 }} className="bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-all">
                    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.35 }} className="w-full h-56 bg-gray-100 overflow-hidden">
                      <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                    </motion.div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-gray-900">{p.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">${p.price}</p>
                      <motion.button
                        onClick={() => handleAddToCart(p)}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-semibold transition-colors shadow-md"
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </section>
          </main>
        </div>
      </div>

      <div className="h-16" />
    </main>
  );
}
