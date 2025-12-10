"use client";
import React, { useEffect, useMemo, useState } from "react";
import Footer from "@/app/home/components/Footer";
import { Eye, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * src/app/Customer/Orders/page.js
 *
 * Customer-facing Orders page (single file).
 * - Shows only the current customer's orders (fetches from backend with Bearer token)
 * - Dark, high-contrast styling consistent with your Dashboard/Profile pages
 * - Search, filter, pagination, details panel
 * - Actions suitable for customers: View details, Reorder, Cancel (when allowed), Track
 * - Uses safe fallbacks (sample orders) if backend not available during testing
 *
 * Backend expectations (unchanged server):
 * GET  http://localhost:5000/api/orders/my        -> returns array of orders for logged-in user
 * POST http://localhost:5000/api/orders/:id/cancel -> cancels order (if allowed)
 * POST http://localhost:5000/api/orders/:id/reorder -> creates a reorder (returns new order or success)
 *
 * Auth: reads Bearer token from localStorage 'token'
 *
 * Drop this file in: src/app/Customer/Orders/page.js
 */
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
  pending: { label: "Pending", style: "bg-yellow-700/15 text-yellow-300 border-yellow-700/30" },
  in_progress: { label: "In Progress", style: "bg-indigo-700/15 text-indigo-300 border-indigo-700/30" },
  completed: { label: "Completed", style: "bg-emerald-700/15 text-emerald-300 border-emerald-700/30" },
  cancelled: { label: "Cancelled", style: "bg-rose-700/15 text-rose-300 border-rose-700/30" },
};
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
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
  const [busyOrders, setBusyOrders] = useState({}); // { orderId: true }
  function showToast(type, message, ms = 4000) {
    setToast({ type, message });
    if (ms) setTimeout(() => setToast({ type: "", message: "" }), ms);
  }

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  // Fetch customer's orders
  useEffect(() => {
    const t = getToken();
    if (!t) {
      // not logged in — redirect to login
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
          // fallback to sample list gracefully
          console.warn("Orders fetch failed, using sample data");
          setOrders(SAMPLE_ORDERS);
          return;
        }
        const data = await res.json();
        // expected: array of orders shaped similarly to SAMPLE_ORDERS
        setOrders(Array.isArray(data) ? data : SAMPLE_ORDERS);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setOrders(SAMPLE_ORDERS);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Derived filtered & paged lists
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

  // Cancel order (customer action) — only if backend supports it and order.can_cancel true
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
      // update local order status
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled", can_cancel: false, can_reorder: true } : o)));
      showToast("success", data.message || "Order cancelled");
    } catch (err) {
      console.error("Cancel error:", err);
      showToast("error", err.message || "Failed to cancel order");
    } finally {
      setBusyOrders((b) => ({ ...b, [orderId]: false }));
    }
  };

  // Reorder (create a new order based on existing one)
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
      // optionally navigate to new order or refresh
      // if backend returned a new order ID, open details
      if (data.newOrderId) {
        // refetch or open new order
        router.push(`/Customer/Orders/${data.newOrderId}`);
      } else {
        // refresh orders list: quick local append if provided
        if (data.newOrder) setOrders((p) => [data.newOrder, ...p]);
      }
    } catch (err) {
      console.error("Reorder error:", err);
      showToast("error", err.message || "Failed to reorder");
    } finally {
      setBusyOrders((b) => ({ ...b, [orderId]: false }));
    }
  };

  // Track — opens tracking_url if present
  const trackOrder = (order) => {
    if (order.tracking_url) {
      window.open(order.tracking_url, "_blank", "noopener");
    } else {
      showToast("info", "Tracking information is not available yet.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between py-4 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 border-b border-gray-800">
          <div className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">Stitch</span>
            <span className="text-indigo-400">3D</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/customer/dashboard")} className="px-3 py-2 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800">Dashboard</button>
            <button onClick={() => router.push("/customer/profile")} className="px-3 py-2 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800">Profile</button>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-6">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/20">
            <img src="https://placehold.co/1200x240/0f172a/94a3b8?text=Your+Orders" alt="orders hero" className="w-full h-36 object-cover brightness-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center pl-6 md:pl-12">
              <div className="max-w-2xl text-white py-4">
                <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">Your Orders</h1>
                <p className="mt-1 text-sm text-gray-300">View orders you placed, track shipments and reorder favorite items.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2 flex-1">
            <Search className="w-4 h-4 text-gray-300" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by order id, item name or amount..."
              className="bg-transparent outline-none w-full text-white placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg text-gray-200">
              <Filter className="w-4 h-4 text-gray-300" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-white"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => {
                // quick client-side refresh: try re-fetch, otherwise keep current
                const t = getToken();
                if (!t) { router.replace("/login"); return; }
                (async () => {
                  try {
                    const res = await fetch(`${API_BASE}/api/orders/my`, { headers: { Authorization: `Bearer ${t}` } });
                    if (res.ok) {
                      const data = await res.json();
                      setOrders(Array.isArray(data) ? data : []);
                      showToast("success", "Orders refreshed");
                    } else {
                      showToast("info", "Unable to refresh from server — using cached view.");
                    }
                  } catch (err) {
                    console.warn("Refresh failed", err);
                    showToast("error", "Refresh failed");
                  }
                })();
              }}
              className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </section>

        {/* Orders list */}
        <section className="mt-6">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-gray-800 rounded-xl" />
              <div className="h-20 bg-gray-800 rounded-xl" />
              <div className="h-20 bg-gray-800 rounded-xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center text-gray-300">
              No orders found. Place your first order — we ship worldwide.
            </div>
          ) : (
            <div className="grid gap-4">
              {paged.map((o) => (
                <div key={o.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4 w-full md:w-2/3">
                    <div className="w-14 h-14 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-semibold">
                      {o.id.split("-")[1]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-gray-200 font-semibold">{o.items && o.items[0]?.name ? o.items[0].name : o.id}</div>
                          <div className="text-xs text-gray-400">{formatDate(o.created_at)}</div>
                        </div>

                        <div className="hidden md:block text-sm text-gray-300">
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Items</div>
                            <div className="font-medium text-white">{o.items_count}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <div className={`px-3 py-1 rounded-full text-sm border ${STATUS_LABELS[o.status]?.style || "bg-gray-700 text-gray-300 border-gray-700"}`}>
                          {STATUS_LABELS[o.status]?.label || o.status}
                        </div>
                        <div className="text-sm text-gray-300">Shipping: <span className="text-white">{o.shipping || "Standard"}</span></div>
                        <div className="text-sm text-gray-400">Order #{o.id}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="text-right mr-2 md:mr-0">
                      <div className="text-sm text-gray-400">Total</div>
                      <div className="text-lg font-bold text-white">${Number(o.total).toFixed(2)}</div>
                    </div>

                    <button
                      onClick={() => setSelected(o)}
                      className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Details</span>
                    </button>

                    {o.can_cancel && (
                      <button
                        onClick={() => cancelOrder(o.id)}
                        disabled={!!busyOrders[o.id]}
                        className="px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2"
                        title="Cancel order"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{busyOrders[o.id] ? "Cancelling..." : "Cancel"}</span>
                      </button>
                    )}

                    {o.can_reorder && (
                      <button
                        onClick={() => reorder(o.id)}
                        disabled={!!busyOrders[o.id]}
                        className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
                        title="Reorder"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">{busyOrders[o.id] ? "Processing..." : "Reorder"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => trackOrder(o)}
                      className="px-3 py-2 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800"
                      title="Track order"
                    >
                      Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Showing <strong className="text-white">{filtered.length}</strong> results — page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={handlePrev} disabled={page === 1} className={`p-2 rounded-md ${page === 1 ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700 text-white"}`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNext} disabled={page === totalPages} className={`p-2 rounded-md ${page === totalPages ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700 text-white"}`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Details drawer */}
        {selected && (
          <div className="fixed inset-0 z-40 flex">
            <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />

            <div className="w-full md:w-[520px] bg-gray-900 border-l border-gray-700 p-6 overflow-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Order {selected.id}</h2>
                  <p className="text-sm text-gray-400">{formatDate(selected.created_at)}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-300 bg-gray-800 px-3 py-1 rounded-md">Close</button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm text-gray-300 font-medium">Summary</h4>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-gray-400">Items</div>
                    <div className="text-sm text-white font-medium">{selected.items_count}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-sm text-gray-400">Shipping</div>
                    <div className="text-sm text-white">{selected.shipping || "Standard"}</div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm text-gray-300 font-medium">Items</h4>
                  <ul className="mt-2 space-y-2">
                    {selected.items && selected.items.length ? selected.items.map((it, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm text-gray-200">
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-gray-400">Qty: {it.qty}</div>
                        </div>
                        <div className="text-sm text-gray-300">${(it.price * it.qty).toFixed(2)}</div>
                      </li>
                    )) : <li className="text-sm text-gray-400">No item details available.</li>}
                  </ul>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">Order total</div>
                    <div className="text-xl font-bold text-white">${Number(selected.total).toFixed(2)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 text-right">Status</div>
                    <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${STATUS_LABELS[selected.status]?.style || "bg-gray-700 text-gray-200"}`}>{STATUS_LABELS[selected.status]?.label || selected.status}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selected.can_reorder && <button onClick={() => { reorder(selected.id); setSelected(null); }} className="flex-1 px-4 py-2 rounded-md bg-emerald-600 text-white">Reorder</button>}
                  {selected.can_cancel && <button onClick={() => { cancelOrder(selected.id); setSelected(null); }} className="flex-1 px-4 py-2 rounded-md bg-rose-600 text-white">Cancel Order</button>}
                  <button onClick={() => trackOrder(selected)} className="flex-1 px-4 py-2 rounded-md border border-gray-700 text-gray-200">Track</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* toast */}
        {toast.message && (
          <div className="fixed bottom-6 right-6 bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="text-sm text-white">
              <strong className="block mb-1">{toast.type === "success" ? "Success" : toast.type === "error" ? "Error" : "Info"}</strong>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
        <div className="h-16" >
              <Footer />
            </div>
    </main>
  );
}
