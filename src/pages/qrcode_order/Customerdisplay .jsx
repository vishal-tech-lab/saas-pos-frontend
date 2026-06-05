import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  UtensilsCrossed,
  Loader2,
  WifiOff,
  ShoppingBag,
  Receipt,
  Sparkles,
  ChefHat,
} from "lucide-react";
import api from "../../components/axios";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "../../services/websocketService";

// ─── Constants ────────────────────────────────────────────────────────────────

const RESTAURANT_NAME = "MasalaRoast";
const THANK_YOU_DURATION = 5000;

// ─── Animation Variants ────────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
};

const thankYouVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 22 },
  },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.35 } },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.04, 1],
    transition: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
  },
};

const totalVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        }`}
      />
      {isActive ? "ACTIVE" : "CLEARED"}
    </span>
  );
};

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-sm border border-slate-100">
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={17} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-semibold leading-none">{label}</p>
      <p className="text-lg font-bold text-slate-800 leading-tight mt-0.5">{value}</p>
    </div>
  </div>
);

// ─── Thank You Screen ─────────────────────────────────────────────────────────

const ThankYouScreen = () => (
  <motion.div
    key="thankyou"
    variants={thankYouVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#7C5CFC] via-[#9b7dfd] to-[#c4b5fd] px-6 text-center"
  >
    {/* Animated ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      className="absolute w-[420px] h-[420px] rounded-full border-2 border-white/10"
    />
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      className="absolute w-[280px] h-[280px] rounded-full border border-white/15"
    />

    {/* Icon */}
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      className="relative z-10 w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/30 shadow-2xl"
    >
      <span className="text-5xl">🙏</span>
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative z-10 text-6xl sm:text-7xl font-black text-white tracking-tight mb-3"
    >
      Thank You!
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative z-10 text-2xl text-white/80 font-semibold mb-2"
    >
      Visit Again
    </motion.p>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="relative z-10 text-lg text-white/60 font-medium"
    >
      {RESTAURANT_NAME}
    </motion.p>

    {/* Sparkles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute z-0"
        style={{
          top: `${15 + (i * 14) % 70}%`,
          left: `${8 + (i * 17) % 84}%`,
        }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
          y: [0, -20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2 + (i % 3),
          delay: i * 0.4,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={18} className="text-white/40" />
      </motion.div>
    ))}
  </motion.div>
);

// ─── Waiting / Empty Screen ───────────────────────────────────────────────────

const WaitingScreen = () => (
  <motion.div
    key="waiting"
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 text-center"
  >
    {/* Subtle bg pattern */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #7C5CFC 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    />

    <motion.div
      variants={pulseVariants}
      animate="animate"
      className="relative z-10 w-28 h-28 rounded-3xl bg-white shadow-xl border border-slate-100 flex items-center justify-center mb-8"
    >
      <span className="text-6xl">🍽️</span>
    </motion.div>

    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p className="text-4xl sm:text-5xl font-black text-slate-800 mb-3 tracking-tight">
        Welcome To
      </p>
      <p
        className="text-5xl sm:text-6xl font-black mb-6 tracking-tight"
        style={{ color: "#7C5CFC" }}
      >
        {RESTAURANT_NAME}
      </p>
      <p className="text-xl text-slate-400 font-semibold">
        Waiting For Order…
      </p>
    </motion.div>

    {/* Animated dots */}
    <motion.div
      className="relative z-10 flex gap-2 mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-[#7C5CFC]/40"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.25 }}
        />
      ))}
    </motion.div>
  </motion.div>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
    <Loader2 size={36} className="animate-spin text-[#7C5CFC]" />
    <p className="text-slate-500 font-semibold text-sm">Connecting to display…</p>
  </div>
);

// ─── Error Screen ─────────────────────────────────────────────────────────────

const ErrorScreen = ({ onRetry, message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-5 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
      <WifiOff size={28} className="text-rose-500" />
    </div>
    <div>
      <p className="text-xl font-bold text-slate-800">Unable To Load Display</p>
      <p className="text-sm text-slate-400 mt-1">
        {message || "Check your network connection."}
      </p>
    </div>
    <button
      onClick={onRetry}
      className="px-6 py-2.5 rounded-xl bg-[#7C5CFC] text-white text-sm font-semibold hover:bg-[#6a4de0] transition-all active:scale-95"
    >
      Retry
    </button>
  </div>
);

// ─── Active Bill Display ──────────────────────────────────────────────────────

const ActiveDisplay = ({ data }) => {
  const items = data.items || [];

  return (
    <motion.div
      key="active"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Top Header Bar ── */}
      <div
        className="px-6 sm:px-10 py-4 flex items-center justify-between"
        style={{ background: "#7C5CFC" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <ChefHat size={19} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">{RESTAURANT_NAME}</p>
            <p className="text-white/60 text-xs font-medium mt-0.5">Customer Facing Display</p>
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 px-4 sm:px-8 lg:px-12 py-6 flex flex-col gap-5 max-w-5xl mx-auto w-full">

        {/* Bill Header + Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <motion.div
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC] flex items-center justify-center shadow-lg shadow-purple-200">
              <Receipt size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Bill Number</p>
              <p className="text-2xl font-black text-slate-800 leading-tight">{data.billno}</p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="flex gap-3 flex-wrap"
          >
            <StatPill
              icon={ShoppingBag}
              label="Items"
              value={items.length}
              color="bg-[#7C5CFC]"
            />
            <StatPill
              icon={Receipt}
              label="Total"
              value={`₹${data.total?.toLocaleString("en-IN") || 0}`}
              color="bg-emerald-500"
            />
          </motion.div>
        </div>

        {/* Items Table */}
        <motion.div
          variants={fadeUp}
          custom={2}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1"
        >
          {/* Table Header */}
          <div className="bg-slate-50/80 border-b border-slate-100 px-5 sm:px-8 py-3.5 grid grid-cols-12 gap-2">
            {[
              { label: "Item", col: "col-span-6" },
              { label: "Qty", col: "col-span-2 text-center" },
              { label: "Price", col: "col-span-2 text-right" },
              { label: "Total", col: "col-span-2 text-right" },
            ].map(({ label, col }) => (
              <p
                key={label}
                className={`text-xs font-bold text-slate-500 uppercase tracking-widest ${col}`}
              >
                {label}
              </p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  key="noitems"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-16 gap-3 text-slate-300"
                >
                  <UtensilsCrossed size={28} />
                  <span className="text-sm font-semibold">No items yet</span>
                </motion.div>
              ) : (
                items.map((item, i) => (
                  <motion.div
                    key={`${item.itemname}-${i}`}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="px-5 sm:px-8 py-4 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Item Name */}
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                        <span className="text-base">🍛</span>
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                        {item.itemname}
                      </p>
                    </div>

                    {/* Qty */}
                    <div className="col-span-2 flex justify-center">
                      <span className="w-7 h-7 rounded-lg bg-[#7C5CFC]/10 text-[#7C5CFC] text-sm font-bold flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>

                    {/* Unit Price */}
                    <p className="col-span-2 text-right text-sm text-slate-500 font-medium">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </p>

                    {/* Row Total */}
                    <p className="col-span-2 text-right text-sm sm:text-base font-bold text-slate-800">
                      ₹{item.total?.toLocaleString("en-IN")}
                    </p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Subtotal row */}
          {items.length > 0 && (
            <motion.div
              layout
              className="px-5 sm:px-8 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end"
            >
              <p className="text-xs text-slate-400 font-semibold">
                {items.length} item{items.length !== 1 ? "s" : ""} in this order
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Row: Total + QR */}
        <motion.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-5 gap-4"
        >
          {/* Total Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={data.total}
              variants={totalVariants}
              initial="hidden"
              animate="visible"
              className="sm:col-span-3 bg-gradient-to-br from-[#7C5CFC] to-[#9b7dfd] rounded-2xl p-7 flex flex-col justify-between shadow-xl shadow-purple-200 relative overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -left-6 w-44 h-44 rounded-full bg-white/5" />

              <p className="text-white/70 text-sm font-bold uppercase tracking-widest relative z-10">
                Total Amount
              </p>
              <div className="relative z-10 mt-3">
                <p className="text-6xl sm:text-7xl font-black text-white leading-none tracking-tight">
                  ₹{data.total?.toLocaleString("en-IN") || 0}
                </p>
              </div>
              <p className="text-white/50 text-xs font-semibold mt-3 relative z-10">
                Inclusive of all taxes
              </p>
            </motion.div>
          </AnimatePresence>

          {/* QR / Scan to Pay */}
          <div className="sm:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
              <QrCode size={32} className="text-[#7C5CFC]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">Scan To Pay</p>
              <p className="text-xs text-slate-400 mt-0.5">UPI / Card / Wallet</p>
            </div>
            <div className="flex gap-2 mt-1">
              {["UPI", "Card", "Cash"].map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CustomerDisplay() {
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  const prevStatusRef = useRef(null);
  const thankYouTimerRef = useRef(null);
  const { tenant, branchId } = useParams();

  console.log("Tenant:", tenant);
  console.log("Branch:", branchId);
  const fetchDisplay = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(false);
      setErrorMessage("");

      if (!branchId) {
        if (!silent) {
          setError(true);
          setErrorMessage("Branch ID missing. Please sign in again.");
        }
        setLoading(false);
        return;
      }

      try {
        const { data: res } = await api.get(
          `/customer-display/current/${branchId}`
        );
        const incoming = res?.data || null;

        // Thank You logic: ACTIVE → CLEARED
        if (
          prevStatusRef.current === "ACTIVE" &&
          incoming?.status === "CLEARED"
        ) {
          setShowThankYou(true);
          clearTimeout(thankYouTimerRef.current);
          thankYouTimerRef.current = setTimeout(() => {
            setShowThankYou(false);
          }, THANK_YOU_DURATION);
        }

        prevStatusRef.current = incoming?.status || null;
        setDisplayData(incoming);
      } catch {
        if (!silent) {
          setError(true);
          setErrorMessage("Unable to load display. Please retry.");
        }
      } finally {
        setLoading(false);
      }
    },
    [branchId]
  );

  // Initial load
  useEffect(() => {
    fetchDisplay(false);
  }, [fetchDisplay]);

  useEffect(() => {
    if (!branchId) return;

    connectWebSocket(branchId, (incoming) => {
      if (
        prevStatusRef.current === "ACTIVE" &&
        incoming?.status === "CLEARED"
      ) {
        setShowThankYou(true);
        clearTimeout(thankYouTimerRef.current);
        thankYouTimerRef.current = setTimeout(() => {
          setShowThankYou(false);
        }, THANK_YOU_DURATION);
      }

      prevStatusRef.current = incoming?.status || null;
      setDisplayData(incoming);
    });

    return () => {
      disconnectWebSocket();
      clearTimeout(thankYouTimerRef.current);
    };
  }, [branchId]);

  const isActive =
    displayData?.status === "ACTIVE" && (displayData?.items?.length || 0) > 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');`}</style>

      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" />
        ) : error ? (
          <ErrorScreen
            key="error"
            onRetry={() => fetchDisplay(false)}
            message={errorMessage}
          />
        ) : showThankYou ? (
          <ThankYouScreen key="thankyou" />
        ) : isActive ? (
          <ActiveDisplay key={`active-${displayData.billno}`} data={displayData} />
        ) : (
          <WaitingScreen key="waiting" />
        )}
      </AnimatePresence>
    </>
  );
}