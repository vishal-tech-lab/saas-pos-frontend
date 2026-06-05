import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table2,
  QrCode,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import axios from "../../components/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  AVAILABLE: {
    label: "Available",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  OCCUPIED: {
    label: "Occupied",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
  RESERVED: {
    label: "Reserved",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
};

const FILTER_TABS = ["ALL", "AVAILABLE", "OCCUPIED", "RESERVED"];

const TENANT = localStorage.getItem("tenant");

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

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const toastVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE;
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
    key={toast.id}
    variants={toastVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      toast.type === "success"
        ? "bg-emerald-600 text-white"
        : "bg-rose-600 text-white"
    }`}
  >
    {toast.type === "success" ? (
      <CheckCircle2 size={17} />
    ) : (
      <AlertCircle size={17} />
    )}
    {toast.message}
  </motion.div>
);

const ModalOverlay = ({ children, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    variants={modalBackdropVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    <div
      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <motion.div
      className="relative z-10 w-full max-w-md"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  </motion.div>
);

const ModalCard = ({ title, onClose, children }) => (
  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all";

const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all appearance-none cursor-pointer";

const PrimaryBtn = ({ children, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C5CFC] text-white text-sm font-semibold hover:bg-[#6a4de0] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading && <Loader2 size={15} className="animate-spin" />}
    {children}
  </button>
);

const SecondaryBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 active:scale-95 transition-all"
  >
    {children}
  </button>
);

// ─── QR Modal ─────────────────────────────────────────────────────────────────

const QRModal = ({ table, tenant, onClose }) => {
  const qrFullUrl = `${window.location.origin}/order/${tenant}/table/${table.tableId}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    qrFullUrl
  )}`;

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard title="QR Code" onClose={onClose}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-48 h-48 rounded-2xl border-2 border-slate-100 overflow-hidden bg-white flex items-center justify-center shadow-inner">
            <img src={qrApiUrl} alt="QR Code" className="w-full h-full object-contain" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">{table.tableName}</p>
            <p className="text-xs text-slate-400 mt-1 font-mono break-all">{qrFullUrl}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="w-full px-4 py-2.5 rounded-xl bg-[#7C5CFC] text-white"
          >
            Print QR
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Close
          </button>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
};

// ─── View Modal ───────────────────────────────────────────────────────────────

const ViewModal = ({ table, onClose }) => (
  <ModalOverlay onClose={onClose}>
    <ModalCard title="Table Details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Table ID", value: table.tableId },
            { label: "Branch ID", value: table.branchid },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-medium">Table Name</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5">{table.tableName}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-400 font-medium mb-1.5">Status</p>
          <StatusBadge status={table.status} />
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
        >
          Close
        </button>
      </div>
    </ModalCard>
  </ModalOverlay>
);

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

const TableFormModal = ({ mode, table, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    tableName: table?.tableName || "",
    status: table?.status || "AVAILABLE",
  });

  const isEdit = mode === "edit";

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <ModalOverlay onClose={onClose}>
      <ModalCard title={isEdit ? "Edit Table" : "Add New Table"} onClose={onClose}>
        <div className="flex flex-col gap-4">
          <FormField label="Table Name">
            <input
              className={inputCls}
              placeholder="e.g. Table 01"
              value={form.tableName}
              onChange={handleChange("tableName")}
            />
          </FormField>
          <FormField label="Status">
            <div className="relative">
              <select
                className={selectCls}
                value={form.status}
                onChange={handleChange("status")}
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="RESERVED">Reserved</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </FormField>
          <div className="flex gap-3 pt-1">
            <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
            <PrimaryBtn
              onClick={() => onSubmit(form)}
              loading={loading}
              disabled={!form.tableName.trim()}
            >
              {isEdit ? "Update Table" : "Create Table"}
            </PrimaryBtn>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteModal = ({ table, onClose, onConfirm, loading }) => (
  <ModalOverlay onClose={onClose}>
    <ModalCard title="Delete Table" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={16} className="text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Delete &ldquo;{table.tableName}&rdquo;?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </ModalCard>
  </ModalOverlay>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function TableMaster() {
  const [tables, setTables] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [modal, setModal] = useState(null); // { type, table? }
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTables = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await axios.get("/table/all");
      setTables(Array.isArray(data) ? data : data.data || []);
    } catch {
      addToast("Failed to load tables", "error");
    } finally {
      setFetching(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreate = async (form) => {
    setActionLoading(true);
    try {
        console.log(
  "BRANCH ID:",
  localStorage.getItem("branchid")
);
      const branchid = Number(
        localStorage.getItem("branchid")
      );
      if (!branchid) {
        addToast("Branch not found", "error");
        return;
      }
      await axios.post("/table/register", {
        ...form,
        branchid,
      });
      addToast("Table Created Successfully");
      setModal(null);
      fetchTables();
    } catch {
      addToast("Failed to create table", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      await axios.put(`/table/${modal.table.tableId}`, form);
      addToast("Table Updated Successfully");
      setModal(null);
      fetchTables();
    } catch {
      addToast("Failed to update table", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`/table/${modal.table.tableId}`);
      addToast("Table Deleted Successfully");
      setModal(null);
      fetchTables();
    } catch {
      addToast("Failed to delete table", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = tables.filter((t) => {
    const matchTab = activeTab === "ALL" || t.status === activeTab;
    const matchSearch = t.tableName?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "AVAILABLE").length,
    occupied: tables.filter((t) => t.status === "OCCUPIED").length,
    reserved: tables.filter((t) => t.status === "RESERVED").length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Font */}
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
              <Table2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">
                Table Management
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage restaurant tables and QR ordering
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal({ type: "add" })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C5CFC] text-white text-sm font-semibold hover:bg-[#6a4de0] active:scale-95 transition-all shadow-md shadow-purple-200 self-start sm:self-auto"
          >
            <Plus size={16} />
            Add Table
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            index={0}
            label="Total Tables"
            value={stats.total}
            color="bg-[#7C5CFC]"
            icon={Table2}
          />
          <StatCard
            index={1}
            label="Available"
            value={stats.available}
            color="bg-emerald-500"
            icon={CheckCircle2}
          />
          <StatCard
            index={2}
            label="Occupied"
            value={stats.occupied}
            color="bg-rose-500"
            icon={AlertCircle}
          />
          <StatCard
            index={3}
            label="Reserved"
            value={stats.reserved}
            color="bg-amber-500"
            icon={QrCode}
          />
        </div>

        {/* ── Filters & Search ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all bg-slate-50"
                placeholder="Search tables by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4 gap-1 overflow-x-auto scrollbar-hide">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-[#7C5CFC]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C5CFC] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {fetching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[#7C5CFC]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Table2 size={36} className="mb-3 opacity-40" />
              <p className="text-sm font-medium">No tables found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {["Table Name", "Status", "QR Code", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((table, i) => (
                      <motion.tr
                        key={table.tableId}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: 20 }}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                      >
                        {/* Table Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <Table2 size={14} className="text-[#7C5CFC]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {table.tableName}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID: {table.tableId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={table.status} />
                        </td>

                        {/* QR */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setModal({ type: "qr", table })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-purple-300 hover:text-[#7C5CFC] hover:bg-purple-50 transition-all"
                          >
                            <QrCode size={13} />
                            Generate QR
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <ActionBtn
                              icon={Eye}
                              title="View"
                              color="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => setModal({ type: "view", table })}
                            />
                            <ActionBtn
                              icon={Edit3}
                              title="Edit"
                              color="text-slate-500 hover:text-[#7C5CFC] hover:bg-purple-50"
                              onClick={() => setModal({ type: "edit", table })}
                            />
                            <ActionBtn
                              icon={Trash2}
                              title="Delete"
                              color="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => setModal({ type: "delete", table })}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Count */}
        {!fetching && filtered.length > 0 && (
          <p className="text-xs text-slate-400 mt-3 text-right">
            Showing {filtered.length} of {tables.length} tables
          </p>
        )}
      </motion.div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal?.type === "add" && (
          <TableFormModal
            mode="add"
            onClose={() => setModal(null)}
            onSubmit={handleCreate}
            loading={actionLoading}
          />
        )}
        {modal?.type === "edit" && (
          <TableFormModal
            mode="edit"
            table={modal.table}
            onClose={() => setModal(null)}
            onSubmit={handleUpdate}
            loading={actionLoading}
          />
        )}
        {modal?.type === "delete" && (
          <DeleteModal
            table={modal.table}
            onClose={() => setModal(null)}
            onConfirm={handleDelete}
            loading={actionLoading}
          />
        )}
        {modal?.type === "view" && (
          <ViewModal table={modal.table} onClose={() => setModal(null)} />
        )}
        {modal?.type === "qr" && (
          <QRModal
            table={modal.table}
            tenant={TENANT}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>

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

// ── Action button helper ───────────────────────────────────────────────────────
const ActionBtn = ({ icon: Icon, title, color, onClick }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${color}`}
  >
    <Icon size={15} />
  </button>
);