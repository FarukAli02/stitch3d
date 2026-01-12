"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatarMenu from "@/app/components/useravatar";
import Footer from "@/app/components/footer";
import { motion } from "framer-motion";
import { ShoppingCart, Sun, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const carouselRef = useRef(null);

  /* ------------------------------------------------------------------ */
  /* Static Data                                                         */
  /* ------------------------------------------------------------------ */

  const trendingJackets = [
    {
      id: 1,
      title: "Midnight Rider",
      img: "https://miro.medium.com/v2/resize:fit:600/1*sJGRHxd0Q5wNXsPs4gZRvg.jpeg",
    },
    {
      id: 2,
      title: "Urban Edge",
      img: "https://tse1.mm.bing.net/th/id/OIP.VGlLe9KI1ULxY2OG5QXePAHaHa?rs=1&pid=ImgDetMain",
    },
    {
      id: 3,
      title: "Classic Noir",
      img: "https://tse2.mm.bing.net/th/id/OIP.XWHyVbqQhjR0BpSWHbCYQwHaJ4?rs=1&pid=ImgDetMain",
    },
    {
      id: 4,
      title: "Vintage Racer",
      img: "https://th.bing.com/th/id/OIP.ergNH0eXxWFFcQTm1HTOZgHaHy?pid=ImgDetMain",
    },
  ];

  const stats = {
    totalOrders: 0,
    activeCustoms: 0,
    savedDesigns: 0,
    inProgress: 0,
  };

  /* ------------------------------------------------------------------ */
  /* Effects                                                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingProfile(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((s, i) => s + (i.quantity || 0), 0));
  }, []);

  /* ------------------------------------------------------------------ */
  /* Handlers                                                           */
  /* ------------------------------------------------------------------ */

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

  const handleAddToCart = (jacket) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const existingItem = cart.find((item) => item.id === jacket.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: jacket.id,
        title: jacket.title,
        img: jacket.img,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.reduce((s, i) => s + (i.quantity || 0), 0));
  };

  const initials = profile?.firstName
    ? profile.firstName[0].toUpperCase()
    : "N";

  /* ------------------------------------------------------------------ */

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading dashboard…</div>
      </main>
    );
  }

  const cardHover = {
    scale: 1.02,
    y: -4,
    boxShadow: "0 12px 30px rgba(99,102,241,0.08)",
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div
            className="text-2xl font-extrabold cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span className="text-slate-900">Stitch</span>
            <span className="text-indigo-600">3D</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/customer/cart"
              className="relative p-2 rounded-lg hover:bg-slate-100"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </a>

            <button className="p-2 rounded-lg hover:bg-slate-100">
              <Sun className="w-5 h-5 text-slate-600" />
            </button>

            <UserAvatarMenu
              initials={initials}
              isOpen={isProfileMenuOpen}
              onToggle={() => setProfileMenuOpen((v) => !v)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold">
                    {profile?.firstName} {profile?.lastName}
                  </div>
                  <div className="text-sm text-slate-500 truncate">
                    {profile?.email}
                  </div>
                </div>
              </div>

              <nav className="space-y-1.5">
                <a className="block px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                  Dashboard
                </a>
                <a href="/customer/orders" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50">
                  My Orders
                </a>
                <a href="/customer/designs" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50">
                  Saved Designs
                </a>
                <a href="/customer/messages" className="block px-3 py-2.5 rounded-lg hover:bg-slate-50">
                  My Messages
                </a>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-9 space-y-8">
            {/* Stats */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats).map(([k, v]) => (
                  <motion.div
                    key={k}
                    whileHover={cardHover}
                    className="bg-white rounded-xl p-5 border shadow-sm"
                  >
                    <p className="text-sm text-slate-600 capitalize">
                      {k.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="mt-3 text-3xl font-bold">{v}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Trending */}
            <section id="trending">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-semibold">Trending Now</h2>
                <a href="/trending" className="flex items-center text-indigo-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>

              <div className="hidden md:grid md:grid-cols-4 gap-4">
                {trendingJackets.map((jacket) => (
                  <div
                    key={jacket.id}
                    className="bg-white rounded-xl overflow-hidden border shadow-sm"
                  >
                    <img
                      src={jacket.img}
                      alt={jacket.title}
                      className="h-56 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">{jacket.title}</h3>
                      <button
                        onClick={() => handleAddToCart(jacket)}
                        className="mt-4 w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </main>
  );
}
