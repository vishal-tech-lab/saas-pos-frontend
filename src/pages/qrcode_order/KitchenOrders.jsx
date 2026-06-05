import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  UtensilsCrossed,
  FlameKindling,
  BadgeCheck,
  ConciergeBell,
  X,
  ShoppingBag,
} from "lucide-react";
import api from "../../components/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-500",
    border: "border-orange-200",
    headerBg: "bg-orange-500",
    lightBg: "bg-orange-50",
    accent: "#f97316",
  },
  PREPARING: {
    label: "Preparing",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-200",
    headerBg: "bg-blue-500",
    lightBg: "bg-blue-50",
    accent: "#3b82f6",
  },
  READY: {
    label: "Ready",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
    headerBg: "bg-emerald-500",
    lightBg: "bg-emerald-50",
    accent: "#10b981",
  },
  SERVED: {
    label: "Served",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    border: "border-slate-200",
    headerBg: "bg-slate-400",
    lightBg: "bg-slate-50",
    accent: "#94a3b8",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
    headerBg: "bg-rose-500",
    lightBg: "bg-rose-50",
    accent: "#ef4444",
  },
};

const FILTER_TABS = ["ALL", "PENDING", "PREPARING", "READY", "SERVED"];

const NEXT_STATUS = {
  PENDING: { next: "PREPARING", label: "Start Cooking", icon: FlameKindling, color: "bg-orange-500 hover:bg-orange-600 shadow-orange-200" },
  PREPARING: { next: "READY", label: "Mark Ready", icon: BadgeCheck, color: "bg-blue-500 hover:bg-blue-600 shadow-blue-200" },
  READY: { next: "SERVED", label: "Serve Order", icon: ConciergeBell, color: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" },
};

// ─── Animation Variants ────────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

const orderCardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
  exit: { opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.25 } },
};

const toastVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

const getElapsed = (iso) => {
  if (!iso) return null;
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff === 1) return "1 min ago";
  return `${diff} mins ago`;
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ label, value, color, icon: Icon, index }) => (
  <motion.div
    custom={index}
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  </motion.div>
);

const Toast = ({ toast }) => (
  <motion.div
    variants={toastVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
    }`}
  >
    {toast.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
    {toast.message}
  </motion.div>
);

// ─── Order Card ───────────────────────────────────────────────────────────────

const OrderCard = ({ order, index, onStatusUpdate, updatingId }) => {
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
  const nextAction = NEXT_STATUS[order.orderStatus];
  const isUpdating = updatingId === order.orderId;
  const isServed = order.orderStatus === "SERVED";
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <motion.div
      custom={index}
      variants={orderCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
    >
      {/* Card Header */}
      <div className={`px-5 py-3.5 flex items-center justify-between ${cfg.lightBg} border-b ${cfg.border}`}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: cfg.accent + "22" }}
          >
            <UtensilsCrossed size={15} style={{ color: cfg.accent }} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Order</p>
            <p className="text-sm font-bold text-slate-800 leading-none">#{order.orderId}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500">Table</p>
          <p className="text-sm font-bold text-slate-800 leading-none">{order.tableId}</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-4 flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">
          Items ({order.items?.length || 0})
        </p>
        <div className="flex flex-col gap-1.5">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: cfg.accent }}
              >
                {item.qty}
              </span>
              <span className="text-sm text-slate-700 font-medium">{item.productName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex flex-col gap-3">
        {/* Status + Time row */}
        <div className="flex items-center justify-between">
          <StatusBadge status={order.orderStatus} />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} />
            <span>{formatTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Elapsed */}
        <p className="text-xs text-slate-400">{getElapsed(order.createdAt)}</p>

        {/* Action Button */}
        {isServed || isCancelled ? (
          <div
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
              isServed
                ? "bg-slate-100 text-slate-400 border border-slate-200"
                : "bg-rose-50 text-rose-400 border border-rose-200"
            }`}
          >
            <CheckCircle2 size={15} />
            {isServed ? "Completed" : "Cancelled"}
          </div>
        ) : nextAction ? (
          <button
            onClick={() => onStatusUpdate(order.orderId, nextAction.next)}
            disabled={isUpdating}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${nextAction.color}`}
          >
            {isUpdating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <nextAction.icon size={15} />
            )}
            {nextAction.label}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function KitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch Orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setFetching(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get("/kitchen/orders");
      setOrders(Array.isArray(data) ? data : data.data || []);
      setLastRefresh(new Date());
    } catch {
      if (!silent) addToast("Failed to load orders", "error");
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    fetchOrders(false);
  }, [fetchOrders]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchOrders(true);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchOrders]);

  // ── Update Status ─────────────────────────────────────────────────────────
  const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/kitchen/order/${orderId}/status?status=${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      const labels = { PREPARING: "Cooking Started!", READY: "Order Marked Ready!", SERVED: "Order Served!" };
      addToast(labels[newStatus] || "Status Updated");
    } catch {
      addToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  }, [addToast]);

  // ── Derived Data ──────────────────────────────────────────────────────────
  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "ALL" || o.orderStatus === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      String(o.orderId).includes(q) ||
      String(o.tableId).includes(q);
    return matchTab && matchSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "PENDING").length,
    preparing: orders.filter((o) => o.orderStatus === "PREPARING").length,
    ready: orders.filter((o) => o.orderStatus === "READY").length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <motion.div
        className="max-w-7xl mx-auto"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFC] flex items-center justify-center shadow-md shadow-purple-200">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none flex items-center gap-1.5">
                🍳 Kitchen Orders
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Live Restaurant Orders</p>
            </div>
          </div>

          {/* Refresh indicator */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {lastRefresh && (
              <p className="text-xs text-slate-400 hidden sm:block">
                Updated {formatTime(lastRefresh.toISOString())}
              </p>
            )}
            <button
              onClick={() => fetchOrders(false)}
              disabled={fetching || refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw
                size={15}
                className={refreshing || fetching ? "animate-spin text-[#7C5CFC]" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Live Pulse Indicator ── */}
        <div className="flex items-center gap-2 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Auto-refreshing every 5 seconds
          </span>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard index={0} label="Total Orders" value={stats.total} color="bg-[#7C5CFC]" icon={ShoppingBag} />
          <StatCard index={1} label="Pending" value={stats.pending} color="bg-orange-500" icon={Clock} />
          <StatCard index={2} label="Preparing" value={stats.preparing} color="bg-blue-500" icon={FlameKindling} />
          <StatCard index={3} label="Ready" value={stats.ready} color="bg-emerald-500" icon={BadgeCheck} />
        </div>

        {/* ── Search & Filter ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-5">
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-slate-50"
                placeholder="Search by Order ID or Table Number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex px-4 gap-1 overflow-x-auto">
            {FILTER_TABS.map((tab) => {
              const cfg = STATUS_CONFIG[tab];
              const count =
                tab === "ALL"
                  ? orders.length
                  : orders.filter((o) => o.orderStatus === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab ? "text-[#7C5CFC]" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "ALL" ? "All" : cfg?.label || tab}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab
                        ? "bg-purple-100 text-purple-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="kitchenTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C5CFC] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Order Grid / States ── */}
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin text-[#7C5CFC]" />
            <p className="text-sm text-slate-500 font-medium">Loading kitchen orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-700">No Kitchen Orders</p>
              <p className="text-sm text-slate-400 mt-1">Waiting for customer orders…</p>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((order, i) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    index={i}
                    onStatusUpdate={handleStatusUpdate}
                    updatingId={updatingId}
                  />
                ))}
              </AnimatePresence>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-right">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </>
        )}
      </motion.div>

      {/* ── Toast Container ── */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}