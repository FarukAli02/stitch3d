
"use client";
import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

const SHIPPING_FEE = 20.0;

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
      const parsed = raw ? JSON.parse(raw) : [];
      setCartItems(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  }, [cartItems]);
  const total = useMemo(() => subtotal + SHIPPING_FEE, [subtotal]);

  const handleUpdateQuantity = (id, newQuantity) => {
    const quantity = Math.max(1, Math.floor(newQuantity) || 1);
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    alert("Proceeding to secure checkout!");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/customer/dashboard")}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="text-2xl font-extrabold tracking-tight">
              <span className="text-slate-900">Stitch</span>
              <span className="text-indigo-600">3D</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Your Shopping Cart
        </h1>
        <p className="text-slate-600 mb-8">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        {cartItems.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-slate-600 text-lg mb-6">Your cart is empty. Time to design your first jacket!</p>
            <a
              href="/customer/dashboard"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-500/30"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-slate-100 mr-5">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                      {item.details && <p className="text-sm text-slate-600 mt-1">{item.details}</p>}
                      {item.isCustom && (
                        <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          ✓ Personalized Design
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xl font-bold text-slate-900">
                        ${((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40"
                            disabled={item.quantity === 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-slate-900 font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label="Remove item"
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-200">
                  Order Summary
                </h2>
                <div className="space-y-3 text-slate-700">
                  <div className="flex justify-between">
                    <p>Subtotal ({cartItems.length} items)</p>
                    <p className="font-semibold">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping Estimate</p>
                    <p className="font-semibold">${SHIPPING_FEE.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-200 text-slate-900">
                    <p className="text-lg font-bold">Order Total</p>
                    <p className="text-xl font-extrabold text-indigo-600">${total.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/customer/checkout")}
                  disabled={cartItems.length === 0}
                  className="w-full mt-6 py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                <p className="mt-4 text-xs text-center text-slate-500">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}