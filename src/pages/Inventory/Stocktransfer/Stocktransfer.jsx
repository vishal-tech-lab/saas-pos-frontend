import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight, Search, Plus, ChevronDown, Eye, Edit3, XCircle,
  CheckCircle2, Clock, AlertCircle, Truck, Package, Building2,
  Hash, FileText, X, Send, RotateCcw, Filter, Soup,
  GitMerge, CalendarDays, BadgeCheck, Ban, RefreshCw,
  ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";
import instances from "../../../components/axios";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STATUS_META = {
  COMPLETED: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: BadgeCheck, dot: "bg-emerald-500" },
  PENDING:   { color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     icon: Clock,      dot: "bg-amber-500"   },
  CANCELLED: { color: "text-red-700",     bg: "bg-red-50 border-red-200",         icon: Ban,        dot: "bg-red-500"     },
};

const TODAY    = new Date().toISOString().slice(0, 10);
const EMPTY_FORM = { from: "", to: "", product: "", qty: "", notes: "" };
const PAGE_SIZE  = 10;

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META["COMPLETED"];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${m.bg} ${m.color}`}>
      <Icon className="w-3 h-3" />{status}
    </span>
  );
}

function ProductPill({ name }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-orange-50 border-orange-200 text-orange-700">
      🍛 {name}
    </span>
  );
}

// ─── TRANSFER FORM MODAL ─────────────────────────────────────────────────────

function TransferFormModal({ open, onClose, branches, products, editTarget, editData, onSuccess }) {
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [productSearch, setProductSearch] = useState("");
  const [productOpen, setProductOpen]     = useState(false);
  const [errors, setErrors]               = useState({});
  const [confirmModal, setConfirmModal]   = useState(false);
  const [done, setDone]                   = useState(false);

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({ from: editData.from, to: editData.to, product: editData.product, qty: String(editData.qty), notes: editData.notes });
        setProductSearch(editData.product);
      } else {
        setForm(EMPTY_FORM);
        setProductSearch("");
      }
      setErrors({});
      setDone(false);
    }
  }, [open, editData]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.from)    e.from    = true;
    if (!form.to)      e.to      = true;
    if (!form.product) e.product = true;
    if (!form.qty || isNaN(form.qty) || Number(form.qty) <= 0) e.qty = true;
    if (form.from && form.to && form.from === form.to) e.same = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openConfirm = () => { if (validate()) setConfirmModal(true); };

  const handleConfirm = async () => {
    const payload = {
      frombranch:  form.from,
      tobranch:    form.to,
      productname: form.product,
      qty:         Number(form.qty),
    };
    try {
      if (editTarget) {
        await instances.put(`/stocktransfer/${editTarget.replace("TRF-", "")}`, payload);
      } else {
        await instances.post("/stocktransfer/register", payload);
      }
      setConfirmModal(false);
      setDone(true);
      await onSuccess();
      setTimeout(() => { setDone(false); onClose(); }, 1400);
    } catch (error) {
      console.log(error);
      setConfirmModal(false);
    }
  };

  const ef = k => errors[k] ? "border-red-300 bg-red-50" : "border-[#E2E8F0] bg-white";

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={() => { if (!confirmModal) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#EDE9FE] bg-[#F4F3FF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7C5CFC] flex items-center justify-center shadow-sm">
                {editTarget ? <Edit3 className="w-4 h-4 text-white" /> : <ArrowLeftRight className="w-4 h-4 text-white" />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">{editTarget ? `Editing ${editTarget}` : "New Stock Transfer"}</h2>
                <p className="text-xs text-slate-500">Fill transfer details below</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* FROM / TO */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "from", label: "From Branch", placeholder: "Source" },
                { key: "to",   label: "To Branch",   placeholder: "Destination" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    {f.label} {errors[f.key] && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <select
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className={`w-full appearance-none pl-8 pr-6 py-2.5 border rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all ${ef(f.key)}`}
                    >
                      <option value="">{f.placeholder}…</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>

            {/* Same-branch error */}
            <AnimatePresence>
              {errors.same && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Source and destination cannot be the same branch.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transfer arrow */}
            {form.from && form.to && !errors.same && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 py-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#F4F3FF] border border-[#C4B5FD] text-xs font-semibold text-[#7C5CFC]">{form.from}</span>
                <ArrowRight className="w-4 h-4 text-[#7C5CFC]" />
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">{form.to}</span>
              </motion.div>
            )}

            {/* Product */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Product {errors.product && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Soup className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setForm({ ...form, product: "" }); setProductOpen(true); }}
                  onFocus={() => setProductOpen(true)}
                  placeholder="Search product…"
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-slate-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all ${ef("product")}`}
                />
                <AnimatePresence>
                  {productOpen && filteredProducts.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xl">
                      {filteredProducts.map(p => (
                        <button key={p.name}
                          onClick={() => { setForm({ ...form, product: p.name }); setProductSearch(p.name); setProductOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#F4F3FF] transition-colors ${form.product === p.name ? "bg-[#F4F3FF]" : ""}`}>
                          <span>🍛</span>
                          <span className="text-gray-700">{p.name}</span>
                          {form.product === p.name && <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5CFC] ml-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Qty */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Quantity {errors.qty && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number" min="1" value={form.qty}
                  onChange={e => setForm({ ...form, qty: e.target.value })}
                  placeholder="e.g. 50"
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-slate-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all ${ef("qty")}`}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Transfer Notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes…" rows={2}
                  className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] bg-white rounded-xl text-sm text-gray-800 placeholder-slate-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <motion.button
                onClick={openConfirm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all"
                style={{ background: "linear-gradient(135deg,#7C5CFC,#6046E0)", boxShadow: "0 4px 14px rgba(124,92,252,.35)" }}
              >
                <AnimatePresence mode="wait">
                  {done
                    ? <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Transferred!</motion.span>
                    : <motion.span key="go" className="flex items-center gap-2"><Send className="w-4 h-4" /> {editTarget ? "Update Transfer" : "Transfer Stock"}</motion.span>
                  }
                </AnimatePresence>
              </motion.button>
              <motion.button
                onClick={() => { setForm(EMPTY_FORM); setProductSearch(""); setErrors({}); }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center gap-2 bg-white"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── INNER CONFIRM MODAL ── */}
        <AnimatePresence>
          {confirmModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <div className="px-6 py-4 border-b border-[#EDE9FE] bg-[#F4F3FF] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7C5CFC] flex items-center justify-center shadow-sm">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Confirm Transfer</h2>
                      <p className="text-xs text-slate-500">Review before dispatching</p>
                    </div>
                  </div>
                  <button onClick={() => setConfirmModal(false)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F3FF] border border-[#C4B5FD]">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">From</p>
                      <p className="text-sm font-bold text-[#7C5CFC]">{form.from}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Truck className="w-5 h-5 text-[#7C5CFC]" />
                      <div className="w-16 h-px bg-[#C4B5FD]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">To</p>
                      <p className="text-sm font-bold text-indigo-700">{form.to}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Product",  value: form.product },
                      { label: "Quantity", value: `${form.qty} units` },
                    ].map(f => (
                      <div key={f.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                        <p className="text-sm font-bold text-gray-900">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {form.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                      <p className="text-sm text-slate-500">{form.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-700">Transfer will be logged as PENDING until confirmed by dispatch.</p>
                  </div>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <button onClick={() => setConfirmModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all bg-white">
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleConfirm} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all"
                    style={{ background: "linear-gradient(135deg,#7C5CFC,#6046E0)", boxShadow: "0 4px 14px rgba(124,92,252,.35)" }}
                  >
                    <Send className="w-4 h-4" /> Confirm Transfer
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function StockTransfer() {
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches]   = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editData, setEditData]     = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [page, setPage]             = useState(1);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const fetchAll = () => {
    fetchTransfers();
    fetchBranches();
    fetchProducts();
  };

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await instances.get("/stocktransfer/all");
      const formatted = response.data.map(item => ({
        id:      "TRF-" + item.transferid,
        from:    item.fromBranch?.branchname || "-",
        to:      item.toBranch?.branchname   || "-",
        product: item.product?.itemname      || "-",
        qty:     item.qty                    || 0,
        date:    item.transferdate ? new Date(item.transferdate).toLocaleString() : "-",
        status:  item.status || "COMPLETED",
        notes:   item.notes  || "",
      }));
      setTransfers(formatted);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await instances.get("/branches/all");
      setBranches(response.data.map(b => b.branchname));
    } catch (error) { console.log(error); }
  };

  const fetchProducts = async () => {
    try {
      const response = await instances.get("/product/all");
      setProducts(response.data.map(item => ({ name: item.itemname })));
    } catch (error) { console.log(error); }
  };

  const todayList = useMemo(() => transfers.filter(t => t.date.startsWith(TODAY)), [transfers]);
  const totalQty  = useMemo(() => todayList.reduce((s, t) => s + t.qty, 0), [todayList]);
  const pending   = useMemo(() => transfers.filter(t => t.status === "PENDING").length,   [transfers]);
  const completed = useMemo(() => transfers.filter(t => t.status === "COMPLETED").length, [transfers]);

  const filtered = useMemo(() => {
    let d = transfers.filter(t =>
      t.id.toLowerCase().includes(search.toLowerCase())      ||
      t.product.toLowerCase().includes(search.toLowerCase()) ||
      t.from.toLowerCase().includes(search.toLowerCase())    ||
      t.to.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== "All") d = d.filter(t => t.status === statusFilter);
    return d;
  }, [transfers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (t) => { setEditTarget(t.id); setEditData(t); setFormOpen(true); };
  const handleNewTransfer = () => { setEditTarget(null); setEditData(null); setFormOpen(true); };
  const handleCancel = async (id) => {
    try {
      await instances.delete(`/stocktransfer/${id.replace("TRF-", "")}`);
      await fetchTransfers();
    } catch (error) { console.log(error); }
  };

  const STATS = [
    { label: "Transfers Today", value: todayList.length, sub: `As of ${TODAY}`,        icon: ArrowLeftRight, color: "#7C5CFC", bg: "#F4F3FF", border: "rgba(124,92,252,.2)"  },
    { label: "Qty Transferred", value: totalQty,         sub: "Units moved today",     icon: Package,        color: "#0EA5E9", bg: "#F0F9FF", border: "rgba(14,165,233,.2)"  },
    { label: "Pending",         value: pending,          sub: "Awaiting dispatch",     icon: Clock,          color: "#F59E0B", bg: "#FFFBEB", border: "rgba(245,158,11,.2)"  },
    { label: "Completed",       value: completed,        sub: "Successfully delivered",icon: BadgeCheck,     color: "#10B981", bg: "#F0FDF4", border: "rgba(16,185,129,.2)"  },
  ];

  const STATUS_TABS = ["All", "COMPLETED", "PENDING", "CANCELLED"];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center gap-3 text-slate-500">
        <RefreshCw className="w-5 h-5 text-[#7C5CFC] animate-spin" />
        <span className="text-sm font-medium">Loading transfers…</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F3FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAV ── */}
      <div className="bg-white border-b border-[#EDE9FE] px-6 flex items-center h-14 gap-8">
        <div className="font-extrabold text-lg text-[#7C5CFC] tracking-tight">
          NextGen<span className="text-gray-900">POS</span>
        </div>
        <div className="flex gap-1">
          {["Dashboard", "Orders", "Users", "Products", "Inventory", "Transfers", "Settings"].map(nav => (
            <div key={nav}
              className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                nav === "Transfers"
                  ? "bg-[#7C5CFC]/10 text-[#7C5CFC] font-bold"
                  : "text-slate-500 font-medium hover:bg-slate-50"
              }`}>
              {nav}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 py-7 space-y-5">

        {/* ── PAGE HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC] flex items-center justify-center"
              style={{ boxShadow: "0 8px 24px rgba(124,92,252,.3)" }}>
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">Stock Transfer</h1>
              <p className="text-sm text-slate-500">Transfer inventory between kitchens, branches and warehouses</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search transfers…"
                className="pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-gray-800 placeholder-slate-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all w-60"
              />
            </div>
            <motion.button
              onClick={handleNewTransfer} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all"
              style={{ background: "linear-gradient(135deg,#7C5CFC,#6046E0)", boxShadow: "0 4px 16px rgba(124,92,252,.35)" }}
            >
              <Plus className="w-4 h-4" /> New Transfer
            </motion.button>
          </div>
        </motion.div>

        {/* ── STATS ── */}
        <div className="flex gap-2 flex-wrap">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
              style={{ background: s.bg, borderColor: s.border }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: s.color }}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold leading-none mb-0.5">{s.label}</p>
                <p className="text-xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── TABLE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white rounded-2xl border border-[#EDE9FE] overflow-hidden"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#EDE9FE] bg-[#FAFAFF] flex-wrap">
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-[#7C5CFC]" />
              <span className="text-sm font-bold text-gray-900">Transfer History</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F3FF] border border-[#C4B5FD] text-[#7C5CFC] text-xs font-bold">{filtered.length}</span>
            </div>

            {/* Status filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              {STATUS_TABS.map(s => {
                const isActive = statusFilter === s;
                const m = s !== "All" ? STATUS_META[s] : null;
                return (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#7C5CFC] border-[#7C5CFC] text-white"
                        : s === "All"
                          ? "bg-white border-[#E2E8F0] text-slate-600 hover:border-[#7C5CFC] hover:text-[#7C5CFC]"
                          : `${m.bg} ${m.color} hover:border-[#7C5CFC]`
                    }`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 800 }}>
              <thead>
                <tr className="bg-[#FAFAFF] border-b border-[#EDE9FE]">
                  {["ID", "From", "To", "Product", "Qty", "Date", "Status", "Actions"].map((h, i) => (
                    <th key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                      style={{ textAlign: h === "Actions" ? "center" : "left" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <ArrowLeftRight className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400">No transfer records found</p>
                        <button onClick={handleNewTransfer}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold mt-1"
                          style={{ background: "linear-gradient(135deg,#7C5CFC,#6046E0)" }}>
                          <Plus className="w-3.5 h-3.5" /> New Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((t, idx) => (
                    <motion.tr key={t.id}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}
                      className="border-b border-slate-50 hover:bg-[#7C5CFC]/[0.03] transition-colors"
                    >
                      {/* ID */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-bold text-[#7C5CFC] bg-[#F4F3FF] border border-[#C4B5FD] px-2 py-0.5 rounded-md whitespace-nowrap">
                          {t.id}
                        </span>
                      </td>

                      {/* From */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600 font-medium">{t.from}</span>
                        </div>
                      </td>

                      {/* To */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
                          <span className="text-xs text-slate-600 font-medium">{t.to}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <ProductPill name={t.product} />
                      </td>

                      {/* Qty */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-extrabold text-[#7C5CFC]">{t.qty}</span>
                        <span className="text-[10px] text-slate-400 ml-0.5">u</span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">{t.date.slice(0, 10)}</span>
                          {t.date.startsWith(TODAY) && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">TODAY</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewTarget(t)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-600 text-xs font-semibold hover:bg-sky-100 transition-all">
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button onClick={() => handleEdit(t)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-all">
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          {t.status === "PENDING" && (
                            <button onClick={() => handleCancel(t.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-all">
                              <XCircle className="w-3 h-3" /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3.5 border-t border-slate-100 bg-[#FAFAFF] flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                      p === page
                        ? "bg-[#7C5CFC] border-[#7C5CFC] text-white"
                        : "bg-white border-gray-200 text-slate-500 hover:border-[#7C5CFC] hover:text-[#7C5CFC]"
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── TRANSFER FORM MODAL ── */}
      <TransferFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); setEditData(null); }}
        branches={branches}
        products={products}
        editTarget={editTarget}
        editData={editData}
        onSuccess={fetchTransfers}
      />

      {/* ── VIEW MODAL ── */}
      <AnimatePresence>
        {viewTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setViewTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#EDE9FE] bg-[#F4F3FF] flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-[#7C5CFC] font-bold">{viewTarget.id}</p>
                  <h2 className="text-sm font-bold text-gray-900 mt-0.5">Transfer Detail</h2>
                </div>
                <button onClick={() => setViewTarget(null)}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                {/* From → To */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F3FF] border border-[#C4B5FD]">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">From</p>
                    <p className="text-sm font-bold text-[#7C5CFC]">{viewTarget.from}</p>
                  </div>
                  <Truck className="w-5 h-5 text-[#7C5CFC]" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">To</p>
                    <p className="text-sm font-bold text-indigo-700">{viewTarget.to}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l: "Quantity", v: `${viewTarget.qty} units` },
                    { l: "Date",     v: viewTarget.date.slice(0, 10) },
                  ].map(f => (
                    <div key={f.l} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{f.l}</p>
                      <p className="text-sm font-bold text-gray-900">{f.v}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Product</p>
                  <ProductPill name={viewTarget.product} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Status</p>
                  <StatusBadge status={viewTarget.status} />
                </div>

                {viewTarget.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-xs text-slate-500">{viewTarget.notes}</p>
                  </div>
                )}
              </div>

              <div className="px-6 pb-5">
                <button
                  onClick={() => { setViewTarget(null); handleEdit(viewTarget); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: "linear-gradient(135deg,#7C5CFC,#6046E0)", boxShadow: "0 4px 14px rgba(124,92,252,.35)" }}
                >
                  <Edit3 className="w-4 h-4" /> Edit Transfer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}