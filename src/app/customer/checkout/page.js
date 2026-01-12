// File: app/checkout/page.js
// Purpose: Multi-step checkout process - Light Theme
// Author: Stitch3D-Dev
// Env Required: None (frontend only)

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  Lock, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  MapPin,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/app/components/footer";

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const cart = {
    items: [
      { id: 1, name: "Classic Leather Biker Jacket", price: 250.00, size: "M", color: "Black", image: "/jacket1.jpg" },
      { id: 2, name: "Custom Patches Add-on", price: 30.00, size: "-", color: "N/A", image: "/patch.jpg" }
    ],
    subtotal: 280.00,
    shipping: 0,
    tax: 5.0
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    shippingMethod: "standard",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        firstName: "Farrukh", 
        lastName: "Ali",
        email: "farrukh@example.com",
        phone_number: "03001234567",
        address: "123 Leather Lane",
        city: "Karachi",
        country: "Pakistan",
        postal_code: "75500"
      }));
      setLoading(false);
    }, 800);
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStepComplete = (step) => {
    setCurrentStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.push("/customer/orders?success=true");
    }, 2000);
  };

  const shippingCost = formData.shippingMethod === "express" ? 25.00 : 0.00;
  const tax = (cart.subtotal + shippingCost) * 0.05;
  const total = cart.subtotal + shippingCost + tax;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-slate-600">Loading checkout...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-slate-900">Stitch</span>
                <span className="text-indigo-600">3D</span>
              </span>
              <span className="text-slate-300 text-xl font-light">|</span>
              <span className="text-slate-700 font-medium tracking-wide">Checkout</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LEFT: Steps */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STEP 1: Address */}
            <StepCard 
              stepNumber={1} 
              title="Shipping Address" 
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
              icon={<MapPin className="w-5 h-5" />}
              onEdit={() => setCurrentStep(1)}
              summary={currentStep > 1 ? `${formData.address}, ${formData.city}` : null}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} />
                <Input name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} />
                
                <div className="md:col-span-2">
                   <Input name="address" label="Street Address" value={formData.address} onChange={handleChange} required />
                </div>
                
                <Input name="city" label="City" value={formData.city} onChange={handleChange} required />
                <Input name="postal_code" label="Postal Code" value={formData.postal_code} onChange={handleChange} required />
                
                <Input name="country" label="Country" value={formData.country} onChange={handleChange} required />
                <Input name="phone_number" label="Phone Number" value={formData.phone_number} type="tel" onChange={handleChange} required />
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => handleStepComplete(1)}>Continue to Shipping</Button>
              </div>
            </StepCard>

            {/* STEP 2: Shipping */}
            <StepCard 
              stepNumber={2} 
              title="Shipping Method" 
              isActive={currentStep === 2}
              isCompleted={currentStep > 2}
              icon={<Truck className="w-5 h-5" />}
              onEdit={() => setCurrentStep(2)}
              summary={currentStep > 2 ? (formData.shippingMethod === "express" ? "Express ($25.00)" : "Standard (Free)") : null}
            >
              <div className="space-y-4">
                <RadioBox 
                  id="standard"
                  name="shippingMethod"
                  value="standard"
                  checked={formData.shippingMethod === "standard"}
                  onChange={handleChange}
                  title="Standard Delivery"
                  desc="4-7 Business Days"
                  price="FREE"
                />
                <RadioBox 
                  id="express"
                  name="shippingMethod"
                  value="express"
                  checked={formData.shippingMethod === "express"}
                  onChange={handleChange}
                  title="Express Delivery"
                  desc="2-3 Business Days"
                  price="$25.00"
                />
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => handleStepComplete(2)}>Continue to Payment</Button>
              </div>
            </StepCard>

            {/* STEP 3: Payment */}
            <StepCard 
              stepNumber={3} 
              title="Payment" 
              isActive={currentStep === 3}
              isCompleted={false}
              icon={<CreditCard className="w-5 h-5" />}
            >
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mb-6 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-800">All transactions are secure and encrypted.</p>
              </div>

              <div className="space-y-5">
                <Input name="cardNumber" label="Card Number" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleChange} icon={<CreditCard className="w-4 h-4 text-slate-400" />} />
                <div className="grid grid-cols-2 gap-5">
                  <Input name="expiry" label="Expiration (MM/YY)" placeholder="MM/YY" value={formData.expiry} onChange={handleChange} />
                  <Input name="cvc" label="Security Code" placeholder="123" value={formData.cvc} onChange={handleChange} />
                </div>
              </div>

              <div className="mt-8">
                 <Button onClick={handlePlaceOrder} isLoading={submitting} fullWidth>
                    Pay ${total.toFixed(2)} & Place Order
                 </Button>
                 <p className="text-xs text-center text-slate-500 mt-4">
                   By placing this order, you agree to our Terms of Service.
                 </p>
              </div>
            </StepCard>

          </div>

          {/* RIGHT: Summary */}
          <div className="lg:col-span-5">
             <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-bold text-lg text-slate-900">Order Summary</h3>
                      <span className="text-sm text-slate-600">{cart.items.length} Items</span>
                   </div>
                   
                   <div className="px-6 py-6 max-h-80 overflow-y-auto">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-4 mb-6 last:mb-0">
                          <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                             <span className="text-xs text-slate-400">Img</span>
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm text-slate-900">{item.name}</h4>
                                <p className="font-semibold text-sm text-slate-900">${item.price.toFixed(2)}</p>
                             </div>
                             <p className="text-xs text-slate-500 mt-1">Size: {item.size} • Color: {item.color}</p>
                          </div>
                        </div>
                      ))}
                   </div>

                   <div className="border-t border-slate-200 px-6 py-6 space-y-3">
                      <SummaryRow label="Subtotal" value={`$${cart.subtotal.toFixed(2)}`} />
                      <SummaryRow label="Shipping" value={shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`} />
                      <SummaryRow label="Estimated Tax" value={`$${tax.toFixed(2)}`} />
                      <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between items-center">
                         <span className="text-lg font-extrabold text-slate-900">Total</span>
                         <span className="text-2xl font-extrabold text-indigo-600">${total.toFixed(2)}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 opacity-60">
                   <span className="text-xs font-semibold border border-slate-300 px-3 py-1.5 rounded-lg text-slate-600">Cash on Delivery</span>
                   <span className="text-xs font-semibold border border-slate-300 px-3 py-1.5 rounded-lg text-slate-600">JazzCash</span>
                   <span className="text-xs font-semibold border border-slate-300 px-3 py-1.5 rounded-lg text-slate-600">Easypaisa</span>
                </div>
             </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Sub-Components

function StepCard({ stepNumber, title, isActive, isCompleted, icon, children, onEdit, summary }) {
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-indigo-600 shadow-md' : 'border-slate-200 shadow-sm'}`}>
      <div 
        className={`px-6 py-4 flex items-center justify-between cursor-pointer ${!isActive && !isCompleted && 'opacity-50 pointer-events-none'}`}
        onClick={isCompleted ? onEdit : undefined}
      >
        <div className="flex items-center gap-4">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
             isCompleted ? 'bg-emerald-100 text-emerald-700' : 
             isActive ? 'bg-indigo-600 text-white' : 
             'bg-slate-100 text-slate-500'
           }`}>
              {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
           </div>
           <div>
              <h3 className={`text-lg font-bold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h3>
              {!isActive && summary && <p className="text-sm text-slate-500 mt-0.5">{summary}</p>}
           </div>
        </div>
        {isCompleted && (
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline">Edit</button>
        )}
      </div>
      
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, name, icon, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-slate-700 pl-1">{label}</label>
      <div className="relative">
        <input 
          id={name}
          name={name}
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-all"
          {...props}
        />
        {icon && <div className="absolute right-3 top-3">{icon}</div>}
      </div>
    </div>
  );
}

function RadioBox({ id, name, value, checked, onChange, title, desc, price }) {
  return (
    <label htmlFor={id} className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-center gap-3">
        <input 
          type="radio" 
          id={id} 
          name={name} 
          value={value} 
          checked={checked} 
          onChange={onChange}
          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
        />
        <div>
          <span className="block text-sm font-bold text-slate-900">{title}</span>
          <span className="block text-xs text-slate-600">{desc}</span>
        </div>
      </div>
      <span className="text-sm font-bold text-slate-900">{price}</span>
    </label>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
       <span className="text-slate-600">{label}</span>
       <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function Button({ children, onClick, isLoading, fullWidth }) {
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        children
      )}
    </button>
  );
}