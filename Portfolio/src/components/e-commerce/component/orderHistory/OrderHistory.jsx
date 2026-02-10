import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import NavBars from "../NavBars";

const statusStyles = {
  pending: {
    text: "Pending",
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-400",
  },
  shipped: {
    text: "Shipped",
    badge: "bg-sky-50 text-sky-700 border border-sky-100",
    dot: "bg-sky-400",
  },
  delivered: {
    text: "Delivered",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-400",
  },
  cancelled: {
    text: "Cancelled",
    badge: "bg-rose-50 text-rose-700 border border-rose-100",
    dot: "bg-rose-400",
  },
};

function formatCurrency(amount, currency = "INR") {
  if (amount == null || isNaN(amount)) return "₹0.00";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${Number(amount).toFixed(2)}`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeItemsCount(order) {
  if (!order || !Array.isArray(order.items)) return 0;
  return order.items.reduce(
    (sum, item) => sum + (item.qty || item.quantity || 1),
    0,
  );
}

const OrderHistory = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortValue, setSortValue] = useState("newest");
  const [activeOrderId, setActiveOrderId] = useState(null);

  // Fetch real orders from your backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "https://grocery-ai.onrender.com/api/order-history",
          {
            headers: { Authorization: token },
          },
        );

        const fetched = response.data || [];

        // Normalise backend data to match template a bit
        const normalised = fetched.map((o) => ({
          id: String(o.id ?? o.order_id ?? ""),
          orderNumber: o.order_number, // Added numeric order number
          status: (o.status || o.order_status || "pending").toLowerCase(),
          total: Number(o.total ?? o.total_amount ?? 0),
          currency: "INR",
          createdAt: o.created_at || o.createdAt || new Date().toISOString(),
          paymentMethod: o.payment_method || null,
          addressId:
            o.address_id?.id || o.address_id?._id || o.addressId || null,
          address: o.address_id
            ? {
                name: o.address_id.full_name,
                line1: o.address_id.address_line1,
                line2: o.address_id.address_line2,
                city: o.address_id.city,
                state: o.address_id.state,
                postalCode: o.address_id.postal_code,
                country: o.address_id.country,
                phone: o.address_id.phone,
              }
            : null,
          items: (o.items || []).map((item) => {
            const product = item.product_id || {};
            return {
              name: product.name || "Unknown Product",
              image: product.image_url || "/placeholder-product.png", // Fallback image
              qty: item.quantity || item.qty || 1,
              price: item.price || 0,
              currency: "INR",
            };
          }),
          shippingFee: Number(o.shipping_fee ?? 0),
          trackingId: o.tracking_id || null,
          expectedDelivery: o.expected_delivery || null,
          shippingSpeed: o.shipping_speed || "Standard (3–5 days)",
        }));

        setOrders(normalised);
        if (normalised.length > 0) {
          setActiveOrderId(normalised[0].id);
        }
      } catch (err) {
        console.error("Error fetching order history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Derived: filtered + sorted orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // filter by status
    list = list.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      if (!matchesStatus) return false;

      if (!search.trim()) return true;

      const term = search.trim().toLowerCase();
      const statusText =
        statusStyles[order.status]?.text.toLowerCase() || order.status;

      return (
        order.id.toLowerCase().includes(term) ||
        (order.orderNumber &&
          String(order.orderNumber).toLowerCase().includes(term)) ||
        statusText.includes(term) ||
        (order.trackingId && order.trackingId.toLowerCase().includes(term))
      );
    });

    // sort
    list.sort((a, b) => {
      if (sortValue === "high") return b.total - a.total;
      if (sortValue === "low") return a.total - b.total;
      if (sortValue === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      // newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [orders, search, statusFilter, sortValue]);

  // Active order object
  const activeOrder =
    filteredOrders.find((o) => o.id === activeOrderId) ||
    filteredOrders[0] ||
    null;

  useEffect(() => {
    if (
      filteredOrders.length &&
      !filteredOrders.some((o) => o.id === activeOrderId)
    ) {
      setActiveOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, activeOrderId]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortValue("newest");
  };

  const handleDownloadSummary = () => {
    const lines = [
      "Order ID,Order Number,Status,Date,Total,Currency,Address ID",
    ];
    orders.forEach((o) => {
      const statusText = statusStyles[o.status]?.text || o.status;
      lines.push(
        [
          o.id,
          o.orderNumber || "",
          statusText,
          formatDate(o.createdAt),
          o.total,
          o.currency || "INR",
          o.addressId || "",
        ].join(","),
      );
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "order-summary.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-md px-6 py-4 text-center border border-slate-200">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-800">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                MS
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">
                  MyShop
                </div>
                <div className="text-xs text-slate-500 hidden xs:block">
                  Order history
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="hidden xs:inline-flex items-center gap-2 h-9 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                onClick={() => navigate("/grocery/home")}
              >
                <span>Account</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <h1 className="text-lg font-semibold text-slate-900 mb-2">
              No orders yet
            </h1>
            <p className="text-sm text-slate-500 mb-4">
              You haven&apos;t placed any orders yet. Start shopping to see your
              order history here.
            </p>
            <button
              onClick={() => navigate("/grocery/home")}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Start shopping
            </button>
          </div>
        </main>
      </div>
    );
  }

  const activeStatusStyle =
    activeOrder && (statusStyles[activeOrder.status] || statusStyles.pending);
  const activeItemsCount = computeItemsCount(activeOrder);

  const statusFilterText =
    statusFilter === "all"
      ? ""
      : statusStyles[statusFilter]?.text || statusFilter;

  const filterBadgeText = [statusFilterText, search && `“${search}”`]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Custom scrollbar styling */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f3f4f6; }
        ::-webkit-scrollbar-thumb { background: #cbd5f5; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      {/* Top nav */}
      <NavBars />

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Page heading */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Order history
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-500">
                Track the status of your recent purchases and view order
                details.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="inline-flex items-center gap-2 h-9 rounded-full border border-slate-200 bg-white px-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12l3 3m0 0l3-3m-3 3V4.5M5.25 19.5h13.5"
                  />
                </svg>
                <span className="hidden xs:inline">Download summary</span>
                <span className="xs:hidden">Export</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/grocery/home")}
                className="inline-flex items-center gap-2 h-9 rounded-full bg-slate-900 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <span>New order</span>
              </button>
            </div>
          </div>

          {/* Filters & search */}
          <section className="mb-4 sm:mb-6">
            <div className="bg-white border border-slate-200 rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <div className="flex-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search by Order ID or status"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:bg-white"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={sortValue}
                    onChange={(e) => setSortValue(e.target.value)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="high">Amount: High to low</option>
                    <option value="low">Amount: Low to high</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
                <div className="hidden sm:block">
                  {filteredOrders.length} order(s)
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4.5 4.5l15 15M19.5 4.5l-15 15"
                    />
                  </svg>
                  Clear
                </button>
              </div>
            </div>
          </section>

          {/* Content layout */}
          <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 lg:gap-6 items-start">
            {/* Orders list */}
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span>Orders</span>
                  {filterBadgeText ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {filterBadgeText}
                    </span>
                  ) : null}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="hidden sm:inline">
                    Tap an order to view full details
                  </span>
                  <span className="inline sm:hidden">Tap for details</span>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {filteredOrders.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No orders match your filters. Try changing the status or
                    search query.
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const styles =
                      statusStyles[order.status] || statusStyles.pending;
                    const isActive = order.id === activeOrderId;
                    const itemsCount = computeItemsCount(order);
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setActiveOrderId(order.id)}
                        className={`w-full text-left px-3 py-3 flex gap-3 ${
                          isActive ? "bg-indigo-50/70" : "bg-white"
                        } hover:bg-slate-50`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <div className="text-xs font-semibold text-slate-900">
                              #{order.orderNumber || order.id}
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                              />
                              {styles.text}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between gap-3">
                            <div>
                              <div>{formatDate(order.createdAt)}</div>
                              <div className="text-[10px] text-slate-400">
                                {itemsCount} item
                                {itemsCount !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold text-slate-900">
                                {formatCurrency(order.total, order.currency)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Tap for details
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Table (sm and up) */}
              <div className="hidden sm:block max-h-[60vh] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Order</th>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Status
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Total
                      </th>
                      <th className="px-4 py-2 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                          No orders match your filters. Try changing the status
                          or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const styles =
                          statusStyles[order.status] || statusStyles.pending;
                        const isActive = order.id === activeOrderId;
                        const itemsCount = computeItemsCount(order);

                        return (
                          <tr
                            key={order.id}
                            className={`cursor-pointer hover:bg-slate-50 ${
                              isActive ? "bg-indigo-50/60" : ""
                            }`}
                            onClick={() => setActiveOrderId(order.id)}
                          >
                            <td className="px-4 py-2 align-middle">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-slate-900">
                                    #{order.orderNumber || order.id}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {itemsCount} item
                                    {itemsCount !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 align-middle text-xs text-slate-600">
                              <div>{formatDate(order.createdAt)}</div>
                              <div className="text-[11px] text-slate-400">
                                {formatTime(order.createdAt)}
                              </div>
                            </td>
                            <td className="px-4 py-2 align-middle text-xs">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${styles.badge}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                                />
                                {styles.text}
                              </span>
                            </td>
                            <td className="px-4 py-2 align-middle text-right text-xs font-semibold text-slate-900">
                              {formatCurrency(order.total, order.currency)}
                            </td>
                            <td className="px-4 py-2 align-middle text-right text-xs">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveOrderId(order.id);
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Order detail */}
            <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-4">
              {!activeOrder ? (
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Order details
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Select an order to see full information.
                    </p>
                  </div>
                </header>
              ) : (
                <>
                  <header className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Order details
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Order #{activeOrder.orderNumber || activeOrder.id} •
                        Placed on {formatDate(activeOrder.createdAt)} at{" "}
                        {formatTime(activeOrder.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                        activeStatusStyle?.badge || ""
                      }`}
                    >
                      {activeStatusStyle?.text || activeOrder.status}
                    </span>
                  </header>

                  <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                    <div className="flex-1 min-w-[140px] bg-slate-50/80 rounded-xl p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Order total
                      </div>
                      <div className="mt-1 text-base font-semibold text-slate-900">
                        {formatCurrency(
                          activeOrder.total,
                          activeOrder.currency,
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {activeItemsCount} item
                        {activeItemsCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex-1 min-w-[140px] bg-slate-50/80 rounded-xl p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Placed on
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(activeOrder.createdAt)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {activeOrder.paymentMethod || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
                    <div className="bg-slate-50/70 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Shipping address
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-slate-700 leading-relaxed">
                        {activeOrder.address ? (
                          <>
                            {activeOrder.address.name}
                            <br />
                            {activeOrder.address.line1}
                            <br />
                            {activeOrder.address.line2}
                            <br />
                            {activeOrder.address.city},{" "}
                            {activeOrder.address.state}{" "}
                            {activeOrder.address.postalCode}
                            <br />
                            {activeOrder.address.country}
                            <br />
                            Phone: {activeOrder.address.phone}
                          </>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-50/70 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Delivery
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          {activeOrder.status === "delivered"
                            ? "Delivered"
                            : activeOrder.status === "shipped"
                              ? "On the way"
                              : activeOrder.status === "pending"
                                ? "Awaiting dispatch"
                                : "Not applicable"}
                        </span>
                      </div>
                      <dl className="mt-1 space-y-0.5 text-xs text-slate-700">
                        <div className="flex justify-between gap-2">
                          <dt>Expected:</dt>
                          <dd>
                            {activeOrder.expectedDelivery
                              ? formatDate(activeOrder.expectedDelivery)
                              : "—"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Shipping:</dt>
                          <dd>
                            {activeOrder.shippingSpeed || "—"} •{" "}
                            {activeOrder.shippingFee
                              ? formatCurrency(
                                  activeOrder.shippingFee,
                                  activeOrder.currency,
                                )
                              : "Free"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>Tracking:</dt>
                          <dd>{activeOrder.trackingId || "—"}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Items in this order
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {activeItemsCount} item
                        {activeItemsCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {activeOrder.items && activeOrder.items.length > 0 ? (
                        activeOrder.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-2 rounded-lg bg-white border border-slate-100 px-2.5 py-1.5"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-10 w-10 flex-shrink-0 rounded-md bg-slate-100 border border-slate-200 overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/40";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-900 truncate">
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {item.variant || ""}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-slate-600">
                              <div>Qty: {item.qty}</div>
                              <div className="font-semibold text-slate-900">
                                {formatCurrency(
                                  item.price * item.qty,
                                  item.currency || activeOrder.currency,
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          No item details available for this order.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4.5 6.75h15M4.5 12h15m-7.5 5.25h7.5"
                        />
                      </svg>
                      View invoice
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4.5 4.5h15v15h-15zM4.5 9.75h15"
                        />
                      </svg>
                      Download receipt
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12A9 9 0 113 12a9 9 0 0118 0z"
                        />
                      </svg>
                      Cancel order
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} MyShop. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="hover:text-slate-700">Privacy</button>
            <button className="hover:text-slate-700">Terms</button>
            <button className="hover:text-slate-700">Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrderHistory;
