
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Eye, X, Scissors, Layers, ArrowLeft } from "lucide-react";
import UserAvatar from "@/app/components/useravatar";

export default function TrendingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [activeVibe, setActiveVibe] = useState("All");
  const [quickLookJacket, setQuickLookJacket] = useState(null);
  const [remixingJacket, setRemixingJacket] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [likes, setLikes] = useState({});

  const vibes = ["All", "Streetwear", "Varsity", "Minimalist", "Cyberpunk", "Heritage", "Avant-Garde"];

  
  const jackets = [
    {
      id: 1,
      name: "Midnight Runner",
      creator: "Alex Chen",
      vibe: "Streetwear",
      uses: 342,
      materials: ["Premium Leather", "Nylon Lining"],
      price: 890,
      img: "https://miro.medium.com/v2/resize:fit:600/1*sJGRHxd0Q5wNXsPs4gZRvg.jpeg",
      tall: false,
    },
    {
      id: 2,
      name: "Varsity Legend",
      creator: "Jamie Park",
      vibe: "Varsity",
      uses: 567,
      materials: ["Wool Body", "Leather Sleeves", "Chenille Patches"],
      price: 720,
      img: "https://tse1.mm.bing.net/th/id/OIP.VGlLe9KI1ULxY2OG5QXePAHaHa?rs=1&pid=ImgDetMain",
      tall: true,
    },
    {
      id: 3,
      name: "Neo Tokyo",
      creator: "Kai Tanaka",
      vibe: "Cyberpunk",
      uses: 891,
      materials: ["Synthetic Leather", "Reflective Trim", "Tech Fabric"],
      price: 1200,
      img: "https://tse2.mm.bing.net/th/id/OIP.XWHyVbqQhjR0BpSWHbCYQwHaJ4?rs=1&pid=ImgDetMain",
      tall: false,
    },
    {
      id: 4,
      name: "Heritage Rider",
      creator: "Marcus Stone",
      vibe: "Heritage",
      uses: 234,
      materials: ["Full Grain Leather", "YKK Zippers", "Brass Hardware"],
      price: 1450,
      img: "https://th.bing.com/th/id/OIP.ergNH0eXxWFFcQTm1HTOZgHaHy?w=172&h=181&c=7&r=0&o=7&dpr=1.3&pid=1.7",
      tall: true,
    },
    {
      id: 5,
      name: "Mono Form",
      creator: "Elena Volkov",
      vibe: "Minimalist",
      uses: 678,
      materials: ["Italian Leather", "Minimal Hardware"],
      price: 980,
      img: "https://miro.medium.com/v2/resize:fit:600/1*sJGRHxd0Q5wNXsPs4gZRvg.jpeg",
      tall: false,
    },
    {
      id: 6,
      name: "Urban Myth",
      creator: "Dev Singh",
      vibe: "Streetwear",
      uses: 445,
      materials: ["Distressed Leather", "Cotton Lining"],
      price: 850,
      img: "https://tse1.mm.bing.net/th/id/OIP.VGlLe9KI1ULxY2OG5QXePAHaHa?rs=1&pid=ImgDetMain",
      tall: false,
    },
  ];

  const filteredJackets = activeVibe === "All" 
    ? jackets 
    : jackets.filter(j => j.vibe === activeVibe);

  // Fetch profile - Fixed with proper error handling
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!res.ok) {
          console.warn("Profile fetch failed:", res.status);
          return;
        }
        
        const data = await res.json();
        setProfile({
          userId: data.user_id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
        // Don't redirect, just continue without profile
      }
    })();
  }, []);

  // Spacebar trigger for Quick Look
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        const hoveredCard = document.querySelector('[data-jacket-card]:hover');
        if (hoveredCard) {
          const jacketId = parseInt(hoveredCard.dataset.jacketId);
          const jacket = jackets.find(j => j.id === jacketId);
          if (jacket) setQuickLookJacket(jacket);
        }
      }
      if (e.code === "Escape" && quickLookJacket) {
        setQuickLookJacket(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickLookJacket]);

  const handleRemix = (jacket) => {
    setRemixingJacket(jacket);
    
    const steps = [
      { delay: 400 },
      { delay: 600 },
      { delay: 500 },
      { delay: 400 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setLoadingStep(currentStep);
      
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          router.push(`/customize?template=${jacket.id}`);
        }, 300);
      }
    }, steps[currentStep]?.delay || 500);
  };

  const toggleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-12 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.push("/customer/dashboard")}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <div className="cursor-pointer" onClick={() => router.push("/customer/dashboard")}>
                  <h1 className="text-2xl font-bold tracking-tight">
                    <span className="text-slate-900">Stitch</span>
                    <span className="text-indigo-600">3D</span>
                  </h1>
                </div>
              </div>
              <UserAvatar profile={profile} />
            </div>

            {/* Vibe Tags */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider mr-2 whitespace-nowrap">
                Filter by Vibe
              </span>
              {vibes.map(vibe => (
                <motion.button
                  key={vibe}
                  onClick={() => setActiveVibe(vibe)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    activeVibe === vibe
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {vibe}
                </motion.button>
              ))}
            </div>
          </div>
        </header>

        {/* Masonry Grid */}
        <div className="max-w-[1800px] mx-auto px-12 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Trending Designs</h2>
            <p className="text-slate-600">Discover and remix jackets crafted by our community</p>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-3 gap-8 auto-rows-[400px]"
            style={{
              gridAutoFlow: "dense"
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredJackets.map((jacket, idx) => (
                <motion.article
                  key={jacket.id}
                  data-jacket-card
                  data-jacket-id={jacket.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: idx * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className={`group relative bg-white rounded-2xl overflow-hidden cursor-pointer border border-slate-200 hover:border-indigo-300 transition-all ${
                    jacket.tall ? "row-span-2" : "row-span-1"
                  }`}
                  style={{
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)"
                  }}
                >
                  {/* Image Container */}
                  <div className="relative w-full h-full overflow-hidden bg-slate-100">
                    <motion.img
                      src={jacket.img}
                      alt={jacket.name}
                      className="w-full h-full object-cover"
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Default State - Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent">
                    <h3 className="text-lg font-bold text-slate-900 mb-0.5">{jacket.name}</h3>
                    <p className="text-sm text-slate-600 font-mono">{jacket.creator}</p>
                  </div>

                  {/* Hover State - UI Reveal */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex flex-col justify-between p-5 opacity-0 group-hover:opacity-100"
                  >
                    {/* Top - Like & Quick Look */}
                    <div className="flex justify-between items-start">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(jacket.id);
                        }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <Heart 
                          className={`w-5 h-5 ${likes[jacket.id] ? "fill-rose-500 text-rose-500" : "text-slate-700"}`}
                        />
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickLookJacket(jacket);
                        }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        <Eye className="w-5 h-5 text-slate-700" />
                      </motion.button>
                    </div>

                    {/* Bottom - Social Proof & CTA */}
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-xs text-white/90 font-mono px-3 py-1.5 bg-slate-900/60 backdrop-blur-sm rounded-full w-fit">
                        <Layers className="w-3 h-3" />
                        <span>Used by {jacket.uses} designers</span>
                      </div>

                      <motion.button
                        onClick={() => handleRemix(jacket)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-600/50 hover:bg-indigo-700 transition-all"
                      >
                        Remix
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Quick Look Modal */}
        <AnimatePresence>
          {quickLookJacket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-12"
              onClick={() => setQuickLookJacket(null)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl overflow-hidden max-w-5xl w-full grid grid-cols-2 gap-8 p-12 shadow-2xl"
              >
                {/* Close Button */}
                <button
                  onClick={() => setQuickLookJacket(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-slate-700" />
                </button>

                {/* Left - Image */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                  <img 
                    src={quickLookJacket.img} 
                    alt={quickLookJacket.name}
                    className="w-full h-[600px] object-cover"
                  />
                </div>

                {/* Right - Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-2">{quickLookJacket.name}</h2>
                    <p className="text-slate-600 font-mono mb-8">by {quickLookJacket.creator}</p>

                    {/* Jacket DNA */}
                    <div className="mb-8">
                      <h3 className="text-sm font-mono uppercase tracking-wider text-slate-500 mb-4">Jacket DNA</h3>
                      <div className="space-y-3">
                        {quickLookJacket.materials.map((material, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <Scissors className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-mono text-slate-700">{material}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <p className="text-xs font-mono uppercase tracking-wider text-indigo-600 mb-1">Estimated Price</p>
                      <p className="text-3xl font-bold text-slate-900">${quickLookJacket.price}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button
                    onClick={() => {
                      setQuickLookJacket(null);
                      handleRemix(quickLookJacket);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-600/50 hover:bg-indigo-700 transition-all"
                  >
                    Remix This Jacket
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Handoff Loading */}
        <AnimatePresence>
          {remixingJacket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mb-8"
                >
                  <Scissors className="w-16 h-16 mx-auto text-indigo-600" />
                </motion.div>

                <motion.h2
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl font-bold text-slate-900 mb-2"
                >
                  {
                    loadingStep === 0 ? "Loading Pattern…" :
                    loadingStep === 1 ? "Cutting Fabric…" :
                    loadingStep === 2 ? "Stitching Sleeves…" :
                    "Ready."
                  }
                </motion.h2>
                <p className="text-slate-600 font-mono text-sm">Building your jacket</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Styles - Moved outside main to prevent hydration issues */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}