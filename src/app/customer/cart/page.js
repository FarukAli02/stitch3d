"use client";
// cart/page.js
import { useState, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react"; // Add lucide-react arrow
import { useRouter } from "next/navigation";

const SHIPPING_FEE = 20.0;

export default function Cart() {
  const router = useRouter(); // Add router
  const [cartItems, setCartItems] = useState([]);

  // load cart from localStorage on mount
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

  // persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  // Memoized calculations for summary
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

  const CartHeader = () => (
    <header className="flex items-center justify-between py-4 sticky top-0 bg-gray-950/90 backdrop-blur-sm z-10 border-b border-gray-800">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/customer/dashboard")}
          className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> 
        </button>

        <div className="text-2xl font-extrabold tracking-tight ml-2">
          <span className="text-white">Stitch</span>
          <span className="text-indigo-400">3D</span>
        </div>
      </div>
      <nav className="flex items-center gap-4" />
    </header>
  );

  return (
    <main className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <CartHeader />

        <h1 className="text-3xl font-extrabold text-white mt-8 mb-6">
          Your Shopping Cart ({cartItems.length} items)
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center p-12 bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
            <p className="text-gray-400 text-lg">Your cart is empty. Time to design your first jacket!</p>
            <a
              href="/customer/dashboard"
              className="mt-6 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-800">
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden mr-4">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                      <p className="text-sm text-gray-400 mt-1">{item.details}</p>

                      {item.isCustom && (
                        <span className="text-xs text-indigo-400 font-medium mt-1 inline-block">✓ Personalized Design</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xl font-bold text-indigo-400">
                        ${((Number(item.price) || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 w-8 h-8 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors disabled:opacity-50"
                          disabled={item.quantity === 1}
                        >
                          -
                        </button>
                        <span className="text-white font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 w-8 h-8 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
                        >
                          +
                        </button>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label="Remove item"
                          className="text-gray-400 hover:text-rose-500 p-2 ml-4 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">Order Summary</h2>

                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <p>Subtotal ({cartItems.length} items)</p>
                    <p className="font-medium">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping Estimate</p>
                    <p className="font-medium">${SHIPPING_FEE.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-700/50 text-white">
                    <p className="text-lg font-bold">Order Total</p>
                    <p className="text-xl font-extrabold text-indigo-400">${total.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full mt-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all duration-300 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="h-16" />
      </div>
    </main>
  );
}
