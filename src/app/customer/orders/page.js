// File: app/customer/orders/page.js
// Purpose: Customer orders management with tracking - Light Theme
// Author: Stitch3D-Dev
// Env Required: None (frontend only)

"use client";
import React, { useEffect, useMemo, useState } from "react";
import Footer from "@/app/components/footer";
import { Eye, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Trash2, Package, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:5000";

const SAMPLE_ORDERS = [
  {
    id: "ORD-1001",
    created_at: "2025-10-01T09:15:00Z",
    items: [
      { name: "Classic Leather Jacket", qty: 1, price: 320.0 },
      { name: "Leather Care Kit", qty: 1, price: 100.0 },
    ],
    items_count: 2,
    total: 420.0,
    status: "in_progress",
    shipping: "Standard",
    can_cancel: false,
    can_reorder: true,
    tracking_url: "",
  },
  {
    id: "ORD-1002",
    created_at: "2025-09-28T11:30:00Z",
    items: [{ name: "Minimalist Jacket", qty: 1, price: 320.0 }],
    items_count: 1,
    total: 320.0,
    status: "completed",
    shipping: "Express",
    can_cancel: false,
    can_reorder: true,
    tracking_url: "https://tracking.example.com/track/ORD-1002",
  },
  {
    id: "ORD-1003",
    created_at: "2025-10-05T14:05:00Z",
    items: [{ name: "Custom Street Jacket", qty: 1, price: 420.0 }],
    items_count: 1,
    total: 420.0,
    status: "pending",
    shipping: "Standard",
    can_cancel: true,
    can_reorder: false,
    tracking_url: "",
  },
];

const STATUS_LABELS = {
  pending: { label: "Pending", style: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "In Progress", style: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "Completed", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", style: "bg-rose-50 text-rose-700 border-rose-200" },
};

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [busyOrders, setBusyOrders] = useState({});

  function showToast(type, message, ms = 4000) {
    setToast({ type, message });
    if (ms) setTimeout(() => setToast({ type: "", message: "" }), ms);
  }

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/orders/my`, {
          headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
        });
        if (!res.ok) {
          console.warn("Orders fetch failed, using sample data");
          setOrders(SAMPLE_ORDERS);
          return;
        }
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : SAMPLE_ORDERS);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setOrders(SAMPLE_ORDERS);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.items && o.items.some((it) => it.name.toLowerCase().includes(q))) ||
        String(o.total).toLowerCase().includes(q) ||
        (o.shipping || "").toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const cancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    const t = getToken();
    if (!t) { router.replace("/login"); return; }
    setBusyOrders((b) => ({ ...b, [orderId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled", can_cancel: false, can_reorder: true } : o)));
      showToast("success", data.message || "Order cancelled");
    } catch (err) {
      console.error("Cancel error:", err);
      showToast("error", err.message || "Failed to cancel order");
    } finally {
      setBusyOrders((b) => ({ ...b, [orderId]: false }));
    }
  };

  const reorder = async (orderId) => {
    const t = getToken();
    if (!t) { router.replace("/login"); return; }
    setBusyOrders((b) => ({ ...b, [orderId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}/reorder`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reorder failed");
      showToast("success", data.message || "Reorder placed");
      if (data.newOrderId) {
        router.push(`/customer/orders/${data.newOrderId}`);
      } else {
        if (data.newOrder) setOrders((p) => [data.newOrder, ...p]);
      }
    } catch (err) {
      console.error("Reorder error:", err);
      showToast("error", err.message || "Failed to reorder");
    } finally {
      setBusyOrders((b) => ({ ...b, [orderId]: false }));
    }
  };

  const trackOrder = (order) => {
    if (order.tracking_url) {
      window.open(order.tracking_url, "_blank", "noopener");
    } else {
      showToast("info", "Tracking information is not available yet.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div 
            className="text-2xl font-extrabold tracking-tight cursor-pointer select-none"
            onClick={() => router.push('/customer/dashboard')} 
          >
            <span className="text-slate-900">Stitch</span>
            <span className="text-indigo-600">3D</span>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Your Orders</h1>
          <p className="text-slate-600">Track and manage all your leather jacket orders in one place</p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-4 py-3 flex-1 border border-slate-200">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by order ID, item name..."
              className="bg-transparent outline-none w-full text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-lg text-slate-700 border border-slate-200">
              <Filter className="w-5 h-5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-slate-900 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => {
                const t = getToken();
                if (!t) { router.replace("/login"); return; }
                (async () => {
                  try {
                    const res = await fetch(`${API_BASE}/api/orders/my`, { headers: { Authorization: `Bearer ${t}` } });
                    if (res.ok) {
                      const data = await res.json();
                      setOrders(Array.isArray(data) ? data : []);
                      showToast("success", "Orders refreshed");
                    }
                  } catch (err) {
                    showToast("error", "Refresh failed");
                  }
                })();
              }}
              className="px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-2 border border-slate-200 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 text-lg mb-2">No orders found</p>
            <p className="text-slate-500 text-sm">Place your first order to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paged.map((o) => (
              <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                      {o.id.split("-")[1]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{o.items?.[0]?.name || o.id}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">{formatDate(o.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_LABELS[o.status]?.style || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                          {STATUS_LABELS[o.status]?.label || o.status}
                        </span>
                        <span className="text-sm text-slate-600">{o.items_count} {o.items_count === 1 ? 'item' : 'items'}</span>
                        <span className="text-sm text-slate-600">•</span>
                        <span className="text-sm text-slate-600">{o.shipping}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-initial">
                      <p className="text-sm text-slate-500">Total</p>
                      <p className="text-lg font-bold text-slate-900">${Number(o.total).toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => setSelected(o)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm font-medium">View</span>
                    </button>

                    {o.can_cancel && (
                      <button
                        onClick={() => cancelOrder(o.id)}
                        disabled={!!busyOrders[o.id]}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                        title="Cancel order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {o.can_reorder && (
                      <button
                        onClick={() => reorder(o.id)}
                        disabled={!!busyOrders[o.id]}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                        title="Reorder"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing <strong className="text-slate-900">{filtered.length}</strong> results — Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong>
            </p>

            <div className="flex items-center gap-2">
              <button onClick={handlePrev} disabled={page === 1} className={`p-2 rounded-lg ${page === 1 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-300 hover:bg-slate-50 text-slate-700"} transition-colors`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNext} disabled={page === totalPages} className={`p-2 rounded-lg ${page === totalPages ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-300 hover:bg-slate-50 text-slate-700"} transition-colors`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />

          <div className="w-full md:w-[520px] bg-white border-l border-slate-200 p-6 overflow-auto shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Order {selected.id}</h2>
                <p className="text-sm text-slate-500 mt-1">{formatDate(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Items</span>
                    <span className="font-medium text-slate-900">{selected.items_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium text-slate-900">{selected.shipping}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Items</h4>
                <ul className="space-y-2">
                  {selected.items?.map((it, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{it.name}</p>
                        <p className="text-xs text-slate-500">Qty: {it.qty}</p>
                      </div>
                      <p className="font-medium text-slate-900">${(it.price * it.qty).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600">Order Total</p>
                  <p className="text-2xl font-bold text-slate-900">${Number(selected.total).toFixed(2)}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_LABELS[selected.status]?.style}`}>
                  {STATUS_LABELS[selected.status]?.label}
                </span>
              </div>

              <div className="flex gap-3">
                {selected.can_reorder && (
                  <button onClick={() => { reorder(selected.id); setSelected(null); }} className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors">
                    Reorder
                  </button>
                )}
                {selected.can_cancel && (
                  <button onClick={() => { cancelOrder(selected.id); setSelected(null); }} className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors">
                    Cancel
                  </button>
                )}
                <button onClick={() => trackOrder(selected)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.message && (
        <div className={`fixed bottom-6 right-6 px-5 py-4 rounded-lg shadow-xl border ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
          toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
          "bg-blue-50 border-blue-200 text-blue-800"
        } z-50`}>
          <p className="font-semibold text-sm">{toast.message}</p>
        </div>
      )}

      <div className="h-16">
        <Footer />
      </div>
    </main>
  );
}