import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../components/axios";
import {
  ChefHat, Clock, CheckCircle2, XCircle, Bell,
  Utensils, Package, AlertCircle, RefreshCw, Table2
} from "lucide-react";

/* ─────────────── CONSTANTS ─────────────── */
const STEPS = ["PENDING", "PREPARING", "READY", "SERVED"];

const STATUS_CONFIG = {
  PENDING: {
    label: "Order Pending",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#F59E0B33",
    glow: "rgba(245,158,11,0.18)",
    icon: Clock,
    pulse: true,
    desc: "Your order has been received.",
  },
  PREPARING: {
    label: "Preparing",
    color: "#0EA5E9",
    bg: "#F0F9FF",
    border: "#0EA5E933",
    glow: "rgba(14,165,233,0.18)",
    icon: ChefHat,
    pulse: true,
    desc: "Our chefs are cooking your meal!",
  },
  READY: {
    label: "Ready!",
    color: "#10B981",
    bg: "#F0FDF4",
    border: "#10B98133",
    glow: "rgba(16,185,129,0.18)",
    icon: Bell,
    pulse: true,
    desc: "Your order is ready. Please wait for service.",
  },
  SERVED: {
    label: "Served",
    color: "#64748B",
    bg: "#F8FAFC",
    border: "#64748B22",
    glow: "rgba(100,116,139,0.12)",
    icon: CheckCircle2,
    pulse: false,
    desc: "Enjoy your meal!",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#EF4444",
    bg: "#FEF2F2",
    border: "#EF444433",
    glow: "rgba(239,68,68,0.15)",
    icon: XCircle,
    pulse: false,
    desc: "Please contact restaurant staff.",
  },
};

/* ─────────────── HELPERS ─────────────── */
function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ─────────────── SUB-COMPONENTS ─────────────── */

function PulsingDot({ color }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: color, opacity: 0.4,
        animation: "pingPulse 1.4s cubic-bezier(0,0,0.2,1) infinite",
      }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <motion.div
      key={status}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "10px 22px", borderRadius: 50,
        background: cfg.bg, border: `1.5px solid ${cfg.border}`,
        boxShadow: `0 0 0 6px ${cfg.glow}`,
        fontSize: 15, fontWeight: 700, color: cfg.color,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {cfg.pulse
        ? <PulsingDot color={cfg.color} />
        : <Icon style={{ width: 16, height: 16 }} />
      }
      {cfg.label}
    </motion.div>
  );
}

function ProgressStepper({ currentStatus }) {
  const cancelledOrUnknown = currentStatus === "CANCELLED" || !STEPS.includes(currentStatus);
  const currentIdx = STEPS.indexOf(currentStatus);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, padding: "8px 0", flexWrap: "nowrap", overflowX: "auto" }}>
      {STEPS.map((step, i) => {
        const isDone = !cancelledOrUnknown && i < currentIdx;
        const isActive = !cancelledOrUnknown && i === currentIdx;
        const isFuture = cancelledOrUnknown || i > currentIdx;

        const cfg = STATUS_CONFIG[step];
        const Icon = cfg.icon;

        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {/* Node */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: isDone ? "#7C5CFC" : isActive ? cfg.bg : "#F1F5F9",
                border: `2px solid ${isDone ? "#7C5CFC" : isActive ? cfg.color : "#E2E8F0"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .35s ease",
                boxShadow: isActive ? `0 0 0 5px ${cfg.glow}` : "none",
              }}>
                {isDone
                  ? <CheckCircle2 style={{ width: 18, height: 18, color: "#fff" }} />
                  : <Icon style={{ width: 17, height: 17, color: isActive ? cfg.color : "#CBD5E1" }} />
                }
              </div>
              <span style={{
                fontSize: 10, fontWeight: isDone || isActive ? 700 : 500,
                color: isDone ? "#7C5CFC" : isActive ? cfg.color : "#94A3B8",
                letterSpacing: 0.3, whiteSpace: "nowrap",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {step === "CENTRAL_KITCHEN" ? "KITCHEN" : step}
              </span>
            </motion.div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 52, height: 3, borderRadius: 2, margin: "0 4px", marginBottom: 18,
                background: isDone ? "#7C5CFC" : "#E2E8F0",
                transition: "background .35s ease",
                position: "relative", overflow: "hidden",
              }}>
                {isDone && (
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: "100%" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    style={{ position: "absolute", inset: 0, background: "#7C5CFC", borderRadius: 2 }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemsList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.07 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderRadius: 10,
            background: "#F8FAFC", border: "1px solid #F1F5F9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Utensils style={{ width: 13, height: 13, color: "#7C5CFC" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", fontFamily: "'DM Sans', sans-serif" }}>
              {item.productName}
            </span>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#7C5CFC",
            background: "#EDE9FE", borderRadius: 20, padding: "3px 10px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ×{item.qty}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function SpecialState({ status, orderData }) {
  if (status === "SERVED") {
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          textAlign: "center", padding: "28px 20px",
          background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
          borderRadius: 16, border: "1.5px solid #86EFAC",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#166534", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          Order Served!
        </div>
        <div style={{ fontSize: 14, color: "#15803D", fontFamily: "'DM Sans', sans-serif" }}>
          Enjoy your meal! 😊
        </div>
      </motion.div>
    );
  }
  if (status === "READY") {
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          textAlign: "center", padding: "24px 20px",
          background: "linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)",
          borderRadius: 16, border: "1.5px solid #6EE7B7",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#065F46", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          Your order is ready!
        </div>
        <div style={{ fontSize: 13, color: "#047857", fontFamily: "'DM Sans', sans-serif" }}>
          Please wait for service.
        </div>
      </motion.div>
    );
  }
  if (status === "CANCELLED") {
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          textAlign: "center", padding: "28px 20px",
          background: "#FEF2F2", borderRadius: 16, border: "1.5px solid #FCA5A5",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 10 }}>❌</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#991B1B", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          Order Cancelled
        </div>
        <div style={{ fontSize: 14, color: "#B91C1C", fontFamily: "'DM Sans', sans-serif" }}>
          Please contact restaurant staff.
        </div>
      </motion.div>
    );
  }
  return null;
}

/* ─────────────── MAIN COMPONENT ─────────────── */
export default function CustomerOrderTracking() {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchStatus = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await api.get(`/customer-order/status/${orderId}`);
      setOrderData(res.data);
      setLastUpdated(new Date());
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchStatus(true);
    intervalRef.current = setInterval(() => fetchStatus(false), 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchStatus]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif",
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          style={{ marginBottom: 18 }}
        >
          <RefreshCw style={{ width: 32, height: 32, color: "#7C5CFC" }} />
        </motion.div>
        <p style={{ color: "#7C5CFC", fontWeight: 600, fontSize: 15 }}>Loading your order…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !orderData) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif",
        padding: 24,
      }}>
        <div style={{
          background: "#fff", borderRadius: 20, padding: "36px 32px",
          textAlign: "center", maxWidth: 360, width: "100%",
          border: "1.5px solid #FEE2E2", boxShadow: "0 8px 32px rgba(239,68,68,0.08)",
        }}>
          <AlertCircle style={{ width: 40, height: 40, color: "#EF4444", margin: "0 auto 14px" }} />
          <p style={{ fontWeight: 700, fontSize: 17, color: "#0F172A", marginBottom: 8 }}>Unable to load order status</p>
          <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
            Please check your connection or contact restaurant staff.
          </p>
          <button
            onClick={() => fetchStatus(true)}
            style={{
              padding: "11px 28px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const status = orderData.orderStatus;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const showStepper = status !== "CANCELLED";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pingPulse {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #C7BCFC; border-radius: 4px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #F4F3FF 0%, #EDE9FE 50%, #F0F9FF 100%)",
        fontFamily: "'DM Sans', sans-serif",
        padding: "0 0 40px",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid #EDE9FE",
          padding: "0 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 58,
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 12px rgba(124,92,252,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Utensils style={{ width: 18, height: 18, color: "#7C5CFC" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", letterSpacing: -0.3 }}>
                🍽️ Order Tracking
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
                Track your order in real time
              </div>
            </div>
          </div>
          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10B981", fontWeight: 600 }}>
            <PulsingDot color="#10B981" />
            LIVE
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 16px" }}>

          {/* ── ORDER CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "#fff", borderRadius: 20,
              border: "1.5px solid #EDE9FE",
              boxShadow: "0 8px 32px rgba(124,92,252,0.10)",
              overflow: "hidden", marginBottom: 16,
            }}
          >
            {/* Card Top */}
            <div style={{
              background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
              padding: "18px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 13, color: "#C7B8FD", fontWeight: 600, marginBottom: 3 }}>ORDER</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
                  #{orderData.orderId}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.15)", borderRadius: 20,
                  padding: "5px 12px",
                }}>
                  <Table2 style={{ width: 13, height: 13, color: "#C7B8FD" }} />
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>
                    Table {orderData.tableId}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, justifyContent: "flex-end" }}>
                  <Clock style={{ width: 12, height: 12, color: "#C7B8FD" }} />
                  <span style={{ fontSize: 12, color: "#C7B8FD", fontWeight: 500 }}>
                    {formatTime(orderData.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: "18px 18px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
                Items Ordered
              </div>
              <ItemsList items={orderData.items || []} />
            </div>
          </motion.div>

          {/* ── STATUS BADGE ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{
              background: "#fff", borderRadius: 20,
              border: "1.5px solid #EDE9FE",
              boxShadow: "0 8px 32px rgba(124,92,252,0.08)",
              padding: "22px 20px", marginBottom: 16, textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 }}>
              Current Status
            </div>
            <StatusBadge status={status} />
            <AnimatePresence mode="wait">
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                style={{
                  marginTop: 12, fontSize: 13, color: "#64748B",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                }}
              >
                {cfg.desc}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* ── PROGRESS STEPPER ── */}
          {showStepper && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              style={{
                background: "#fff", borderRadius: 20,
                border: "1.5px solid #EDE9FE",
                boxShadow: "0 8px 32px rgba(124,92,252,0.08)",
                padding: "22px 16px", marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 18, textAlign: "center" }}>
                Order Progress
              </div>
              <ProgressStepper currentStatus={status} />
            </motion.div>
          )}

          {/* ── SPECIAL STATES ── */}
          <AnimatePresence>
            {(status === "SERVED" || status === "READY" || status === "CANCELLED") && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ delay: 0.35 }}
                style={{
                  background: "#fff", borderRadius: 20,
                  border: "1.5px solid #EDE9FE",
                  boxShadow: "0 8px 32px rgba(124,92,252,0.08)",
                  padding: "20px 18px", marginBottom: 16,
                }}
              >
                <SpecialState status={status} orderData={orderData} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── LAST UPDATED ── */}
          {lastUpdated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                textAlign: "center", fontSize: 11, color: "#94A3B8",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}
            >
              <RefreshCw style={{ width: 10, height: 10 }} />
              Auto-refreshes every 5s · Last updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}