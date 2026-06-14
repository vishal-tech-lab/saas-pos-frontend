import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Search, Download, ChevronDown, Eye,
  TrendingDown, AlertTriangle, Warehouse, BarChart3,
  RefreshCw, X, BoxSelect, Layers, ShieldAlert,
  Circle, Clock, Filter, Building2, Tag,
  ArrowUpDown, ChefHat, Coffee, Drumstick, Soup, ChevronLeft, ChevronRight,
} from "lucide-react";
import instances from "../../../components/axios";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["All Status", "In Stock", "Low Stock", "Out Of Stock"];
const PAGE_SIZE = 10;

const CAT_META = {
  BRIYANI:      { icon: Soup,      iconColor: "text-orange-500", badgeBg: "bg-orange-50",  badgeBorder: "border-orange-200",  badgeText: "text-orange-700"  },
  "FRIED RICE": { icon: ChefHat,   iconColor: "text-lime-600",   badgeBg: "bg-lime-50",    badgeBorder: "border-lime-200",    badgeText: "text-lime-700"    },
  CHICKEN:      { icon: Drumstick, iconColor: "text-yellow-600", badgeBg: "bg-yellow-50",  badgeBorder: "border-yellow-200",  badgeText: "text-yellow-700"  },
  DRINKS:       { icon: Coffee,    iconColor: "text-sky-500",    badgeBg: "bg-sky-50",     badgeBorder: "border-sky-200",     badgeText: "text-sky-700"     },
};
const DEFAULT_CAT = { icon: Tag, iconColor: "text-slate-500", badgeBg: "bg-slate-50", badgeBorder: "border-slate-200", badgeText: "text-slate-600" };

const STATUS_META = {
  "In Stock":     { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", pulse: true  },
  "Low Stock":    { color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     dot: "bg-amber-500",  pulse: false },
  "Out Of Stock": { color: "text-red-700",     bg: "bg-red-50 border-red-200",         dot: "bg-red-500",    pulse: false },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function StockBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META["In Stock"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${m.bg} ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot} ${m.pulse ? "animate-pulse" : ""}`} />
      {status}
    </span>
  );
}

function CatBadge({ cat }) {
  const m = CAT_META[(cat || "").toUpperCase()] ?? DEFAULT_CAT;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${m.badgeBg} ${m.badgeBorder} ${m.badgeText}`}>
      <Icon className="w-3 h-3" />{cat}
    </span>
  );
}

function SelectBox({ value, onChange, options, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none ${Icon ? "pl-8" : "pl-4"} pr-7 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer hover:border-slate-300`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function BranchStock() {
  const [stock, setStock]               = useState([]);
  const [branches, setBranches]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [branchF, setBranchF]           = useState("All Branches");
  const [catF, setCatF]                 = useState("All Categories");
  const [statusF, setStatusF]           = useState("All Status");
  const [viewModal, setViewModal]       = useState(null);
  const [sortCol, setSortCol]           = useState("product");
  const [sortDir, setSortDir]           = useState("asc");
  const [page, setPage]                 = useState(1);

  useEffect(() => { fetchStock(); }, []);
  useEffect(() => { setPage(1); }, [search, branchF, catF, statusF]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await instances.get("/branch-stock/all");
      const data = response.data;
      const formatted = data.map(item => {
        const qty = item.qty || 0;
        const status = qty === 0 ? "Out Of Stock" : qty <= 5 ? "Low Stock" : "In Stock";
        return {
          id: item.stockid,
          product: item.product?.itemname || "-",
          branch: item.branch?.branchname || "-",
          category: (item.product?.category || "-").toUpperCase(),
          qty,
          status,
          updated: new Date().toLocaleString(),
          raw: item,
        };
      });
      setStock(formatted);
      setBranches(["All Branches", ...new Set(formatted.map(i => i.branch))]);
      setCategories(["All Categories", ...new Set(formatted.map(i => i.category))]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let d = stock;
    if (search)                     d = d.filter(r => r.product.toLowerCase().includes(search.toLowerCase()) || r.branch.toLowerCase().includes(search.toLowerCase()));
    if (branchF !== "All Branches") d = d.filter(r => r.branch === branchF);
    if (catF !== "All Categories")  d = d.filter(r => r.category === catF);
    if (statusF !== "All Status")   d = d.filter(r => r.status === statusF);
    return [...d].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [stock, search, branchF, catF, statusF, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lowStock   = useMemo(() => stock.filter(s => s.status === "Low Stock"),   [stock]);
  const outOfStock = useMemo(() => stock.filter(s => s.status === "Out Of Stock"), [stock]);
  const totalQty   = useMemo(() => stock.reduce((s, r) => s + r.qty, 0),          [stock]);
  const kitchenQty = useMemo(() => stock.filter(r => r.branch === "Main Kitchen").reduce((s, r) => s + r.qty, 0), [stock]);

  const sort = (col) => {
    setSortCol(col);
    setSortDir(d => col === sortCol ? (d === "asc" ? "desc" : "asc") : "asc");
  };

  const STATS = [
    { label: "Total Products",     value: stock.length,                              icon: BoxSelect,    color: "#7C5CFC", bg: "#F4F3FF", border: "rgba(124,92,252,.2)",   sub: `${Math.max(0, branches.length - 1)} branches` },
    { label: "Total Stock Units",  value: totalQty,                                  icon: BarChart3,    color: "#0EA5E9", bg: "#F0F9FF", border: "rgba(14,165,233,.2)",    sub: "Across all locations" },
    { label: "Low / Out of Stock", value: lowStock.length + outOfStock.length,       icon: TrendingDown, color: "#EF4444", bg: "#FEF2F2", border: "rgba(239,68,68,.2)",     sub: `${outOfStock.length} out of stock` },
    { label: "Central Kitchen",    value: kitchenQty,                                icon: Warehouse,    color: "#F59E0B", bg: "#FFFBEB", border: "rgba(245,158,11,.2)",    sub: "Main Kitchen units" },
  ];

  const COL_HEADERS = [
    { key: "product",  label: "Product Name", sortable: true  },
    { key: "branch",   label: "Branch",       sortable: true  },
    { key: "category", label: "Category",     sortable: false },
    { key: "qty",      label: "Qty",          sortable: true  },
    { key: "status",   label: "Status",       sortable: true  },
    { key: "updated",  label: "Last Updated", sortable: true  },
    { key: "actions",  label: "Actions",      sortable: false },
  ];

  // ── LOADING ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3FF]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex items-center gap-3 text-slate-500">
        <RefreshCw className="w-5 h-5 text-[#7C5CFC] animate-spin" />
        <span className="text-sm font-medium">Loading inventory…</span>
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
          {["Dashboard", "Orders", "Users", "Products", "Inventory", "Settings"].map(nav => (
            <div key={nav}
              className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                nav === "Inventory"
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
            <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC] flex items-center justify-center shadow-lg"
              style={{ boxShadow: "0 8px 24px rgba(124,92,252,.3)" }}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">Branch Inventory</h1>
              <p className="text-sm text-slate-500">Monitor branch stock and kitchen inventory in real time</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products, branches…"
                className="pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-gray-800 placeholder-slate-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all w-60"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-slate-600 hover:text-slate-900 hover:border-slate-300 text-sm font-semibold rounded-xl transition-all"
            >
              <Download className="w-4 h-4" /> Export
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

        {/* ── STOCK ALERTS ── */}
        <AnimatePresence>
          {(lowStock.length > 0 || outOfStock.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">Stock Alerts</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold">
                  {lowStock.length + outOfStock.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...outOfStock, ...lowStock].map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                    className={`flex items-center justify-between p-3 rounded-xl border ${s.status === "Out Of Stock" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${s.status === "Out Of Stock" ? "text-red-500" : "text-amber-500"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{s.product}</p>
                        <p className="text-[10px] text-slate-500">{s.branch}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-extrabold shrink-0 ml-2 ${s.status === "Out Of Stock" ? "text-red-600" : "text-amber-600"}`}>
                      {s.qty === 0 ? "NONE" : `${s.qty} left`}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TABLE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.4 }}
          className="bg-white rounded-2xl border border-[#EDE9FE] overflow-hidden"
        >
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2.5 px-5 py-4 border-b border-[#EDE9FE] bg-[#FAFAFF]">
            <div className="flex items-center gap-1.5 text-slate-400 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Filter</span>
            </div>
            <SelectBox value={branchF} onChange={setBranchF} options={branches}       icon={Building2} />
            <SelectBox value={catF}    onChange={setCatF}    options={categories}     icon={Tag} />
            <SelectBox value={statusF} onChange={setStatusF} options={STATUS_FILTERS} icon={Circle} />
            <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{filtered.length} records</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 780 }}>
              <thead>
                <tr className="bg-[#FAFAFF] border-b border-[#EDE9FE]">
                  {COL_HEADERS.map((h, i) => (
                    <th key={h.key}
                      className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"
                      style={{ textAlign: h.key === "actions" ? "center" : "left" }}
                    >
                      {h.sortable ? (
                        <button onClick={() => sort(h.key)} className="flex items-center gap-1 hover:text-[#7C5CFC] transition-colors group">
                          {h.label}
                          <ArrowUpDown className={`w-3 h-3 ${sortCol === h.key ? "text-[#7C5CFC]" : "text-slate-300 group-hover:text-slate-400"}`} />
                        </button>
                      ) : h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400">No inventory records found</p>
                        <p className="text-xs text-slate-300">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, idx) => {
                    const catM = CAT_META[(row.category || "").toUpperCase()] ?? DEFAULT_CAT;
                    const CatIcon = catM.icon;
                    return (
                      <motion.tr key={row.id}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}
                        className="border-b border-slate-50 hover:bg-[#7C5CFC]/[0.03] transition-colors"
                      >
                        {/* Product */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${catM.badgeBg} ${catM.badgeBorder}`}>
                              <CatIcon className={`w-4 h-4 ${catM.iconColor}`} />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{row.product}</span>
                          </div>
                        </td>

                        {/* Branch */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-xs text-slate-500 font-medium">{row.branch}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-3.5">
                          <CatBadge cat={row.category} />
                        </td>

                        {/* Qty */}
                        <td className="px-5 py-3.5">
                          <span className={`text-lg font-extrabold leading-none ${
                            row.qty === 0 ? "text-red-600" : row.qty <= 5 ? "text-amber-600" : "text-[#7C5CFC]"
                          }`}>{row.qty}</span>
                          <span className="text-[10px] text-slate-400 ml-0.5">u</span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StockBadge status={row.status} />
                        </td>

                        {/* Updated */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{row.updated}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewModal(row)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-600 text-xs font-semibold hover:bg-sky-100 transition-all"
                              title="View"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3.5 border-t border-slate-100 bg-[#FAFAFF] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
              </span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-400">Live sync</span>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
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
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── VIEW MODAL ── */}
      <AnimatePresence>
        {viewModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setViewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              {(() => {
                const m = CAT_META[(viewModal.category || "").toUpperCase()] ?? DEFAULT_CAT;
                const I = m.icon;
                return (
                  <div className="px-6 py-4 border-b border-[#EDE9FE] bg-[#F4F3FF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${m.badgeBg} ${m.badgeBorder}`}>
                        <I className={`w-5 h-5 ${m.iconColor}`} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">{viewModal.product}</h2>
                        <CatBadge cat={viewModal.category} />
                      </div>
                    </div>
                    <button onClick={() => setViewModal(null)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}

              <div className="p-6 space-y-3">
                {[
                  { label: "Branch",       value: viewModal.branch,  Icon: Building2 },
                  { label: "Last Updated", value: viewModal.updated, Icon: Clock },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <f.Icon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{f.label}</p>
                      <p className="text-sm text-gray-800 font-semibold">{f.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Available Quantity</p>
                    <span className={`text-3xl font-extrabold ${
                      viewModal.qty === 0 ? "text-red-600" : viewModal.qty <= 5 ? "text-amber-600" : "text-[#7C5CFC]"
                    }`}>{viewModal.qty}</span>
                    <span className="text-xs text-slate-400 ml-1">units</span>
                  </div>
                  <StockBadge status={viewModal.status} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}