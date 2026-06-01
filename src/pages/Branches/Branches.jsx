import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import instances from "../../components/axios";
import {
  GitBranch, Warehouse, ChefHat, Building2, Search, Plus,
  Edit3, Trash2, Eye, X, Phone, MapPin, CheckCircle2,
  XCircle, Activity, ChevronDown, Save, AlertCircle, Layers, Globe
} from "lucide-react";

const TYPE_CONFIG = {
  CENTRAL_KITCHEN: {
    label: "Central Kitchen",
    icon: ChefHat,
    color: "#7C5CFC",
    bg: "#F4F3FF",
    border: "#7C5CFC33",
    dot: "#7C5CFC",
  },
  BRANCH: {
    label: "Branch",
    icon: GitBranch,
    color: "#0EA5E9",
    bg: "#F0F9FF",
    border: "#0EA5E933",
    dot: "#0EA5E9",
  },
  WAREHOUSE: {
    label: "Warehouse",
    icon: Warehouse,
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#F59E0B33",
    dot: "#F59E0B",
  },
};

const EMPTY_FORM = { branchname: "", branchtype: "BRANCH", address: "", phone: "", status: "ACTIVE" };

/* ──────────────── TOAST ──────────────── */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "#18181B", color: "#fff", borderRadius: 12, padding: "12px 24px",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
      display: "flex", alignItems: "center", gap: 10, zIndex: 9999,
      boxShadow: "0 8px 32px rgba(0,0,0,0.22)", animation: "slideUp .22s ease",
    }}>
      <span style={{ width: 20, height: 20, background: "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</span>
      {message}
    </div>
  );
}

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    instances.defaults.headers.common["X-TenantID"] = "tenant_test";
  }, []);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await instances.get("/branches/all");
      setBranches(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = branches.filter(b => {
    const matchSearch =
      b.branchname.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || b.branchtype === filterType;
    return matchSearch && matchType;
  });

  const stats = {
    total: branches.length,
    kitchens: branches.filter(b => b.branchtype === "CENTRAL_KITCHEN").length,
    warehouses: branches.filter(b => b.branchtype === "WAREHOUSE").length,
    active: branches.filter(b => b.status === "ACTIVE").length,
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (b) => { setForm({ ...b }); setEditTarget(b.branchid); setModalOpen(true); };

  const handleSave = async () => {
    try {
      if (!form.branchname || !form.address || !form.phone) return;
      if (editTarget) {
        await instances.put(`/branches/${editTarget}`, form);
        setToast("Branch updated successfully");
      } else {
        await instances.post("/branches/register", form);
        setToast("Branch created successfully");
      }
      fetchBranches();
      setModalOpen(false);
    } catch (error) {
      console.log(error);
      setToast("Failed to save branch");
    }
  };

  const handleDelete = async (id) => {
    try {
      await instances.delete(`/branches/${id}`);
      setToast("Branch deleted successfully");
      fetchBranches();
      setDeleteConfirm(null);
    } catch (error) {
      console.log(error);
      setToast("Failed to delete branch");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: 15 }}>
        Loading branches...
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #C7BCFC; border-radius: 4px; }
        .branch-row:hover td { background: #7C5CFC06 !important; }
        .action-btn { opacity: 0; transition: opacity .15s; }
        .branch-row:hover .action-btn { opacity: 1; }
        .filter-btn { transition: all .15s; }
        .filter-btn:hover { border-color: #7C5CFC !important; color: #7C5CFC !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── TOP NAV ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid #EDE9FE", padding: "0 24px", display: "flex", alignItems: "center", height: 56 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#7C5CFC", letterSpacing: -0.5 }}>
            NextGen<span style={{ color: "#0F172A" }}>POS</span>
          </div>
          <div style={{ marginLeft: 32, display: "flex", gap: 4 }}>
            {["Dashboard", "Branches", "Users", "Settings"].map(nav => (
              <div key={nav} style={{
                padding: "8px 16px", borderRadius: 8,
                background: nav === "Branches" ? "#7C5CFC15" : "transparent",
                color: nav === "Branches" ? "#7C5CFC" : "#64748B",
                fontSize: 13, fontWeight: nav === "Branches" ? 700 : 500, cursor: "pointer",
              }}>{nav}</div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>

          {/* ── PAGE HEADER ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Layers style={{ width: 22, height: 22, color: "#7C5CFC" }} />
              </div>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: 26, color: "#0F172A", letterSpacing: -0.5, margin: 0, marginBottom: 3 }}>Branch Management</h1>
                <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Manage branches, central kitchens and warehouses</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#94A3B8" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search branches…"
                  style={{
                    paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                    border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none",
                    fontFamily: "'DM Sans', sans-serif", width: 220, background: "#fff",
                    transition: "border-color .15s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>
              {/* Add button */}
              <button
                onClick={openAdd}
                style={{
                  padding: "11px 20px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
                  color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(124,92,252,0.32)",
                }}
              >
                <Plus style={{ width: 16, height: 16 }} /> Add Branch
              </button>
            </div>
          </div>

          {/* ── STATS ── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Branches", value: stats.total, color: "#7C5CFC", bg: "#F4F3FF", icon: Globe },
              { label: "Central Kitchens", value: stats.kitchens, color: "#7C5CFC", bg: "#F4F3FF", icon: ChefHat },
              { label: "Warehouses", value: stats.warehouses, color: "#F59E0B", bg: "#FFFBEB", icon: Warehouse },
              { label: "Active Locations", value: stats.active, color: "#10B981", bg: "#F0FDF4", icon: Activity },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, borderRadius: 10, padding: "8px 16px",
                border: `1px solid ${s.color}22`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <s.icon style={{ width: 16, height: 16, color: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── FILTER TABS ── */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 14, border: "1px solid #EDE9FE", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {["ALL", "BRANCH", "CENTRAL_KITCHEN", "WAREHOUSE"].map(t => {
              const TC = t !== "ALL" ? TYPE_CONFIG[t] : null;
              const isActive = filterType === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className="filter-btn"
                  style={{
                    padding: "8px 16px", borderRadius: 9,
                    border: `1.5px solid ${isActive ? (TC?.color || "#7C5CFC") : "#E2E8F0"}`,
                    background: isActive ? (TC?.bg || "#F4F3FF") : "#F8FAFC",
                    color: isActive ? (TC?.color || "#7C5CFC") : "#374151",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {TC && <TC.icon style={{ width: 13, height: 13 }} />}
                  {t === "ALL" ? "All Locations" : TC.label + "s"}
                </button>
              );
            })}
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#94A3B8" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* ── TABLE ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FE", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#FAFAFF" }}>
                    {["Branch Name", "Type", "Address", "Phone", "Status", "Actions"].map((col, i) => (
                      <th key={col} style={{
                        padding: "13px 18px",
                        textAlign: i === 5 ? "center" : "left",
                        fontSize: 12, fontWeight: 700, color: "#94A3B8",
                        letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9",
                        whiteSpace: "nowrap",
                      }}>{col.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "56px 20px", textAlign: "center" }}>
                        <Building2 style={{ width: 36, height: 36, color: "#CBD5E1", margin: "0 auto 10px" }} />
                        <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>No locations found</p>
                      </td>
                    </tr>
                  ) : filtered.map((b) => {
                    const TC = TYPE_CONFIG[b.branchtype];
                    return (
                      <tr key={b.branchid} className="branch-row" style={{ borderBottom: "1px solid #F8FAFC" }}>
                        {/* Name */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9,
                              background: TC.bg, border: `1px solid ${TC.border}`,
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                              <TC.icon style={{ width: 15, height: 15, color: TC.color }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{b.branchname}</span>
                          </div>
                        </td>

                        {/* Type */}
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{
                            background: TC.bg, color: TC.color,
                            border: `1px solid ${TC.border}`,
                            borderRadius: 8, padding: "4px 10px",
                            fontSize: 12, fontWeight: 600,
                            display: "inline-flex", alignItems: "center", gap: 5,
                            whiteSpace: "nowrap",
                          }}>
                            <TC.icon style={{ width: 11, height: 11 }} />
                            {TC.label}
                          </span>
                        </td>

                        {/* Address */}
                        <td style={{ padding: "14px 18px", maxWidth: 220 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <MapPin style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                            <span style={{ fontSize: 14, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.address}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Phone style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                            <span style={{ fontSize: 14, color: "#374151" }}>{b.phone}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 18px" }}>
                          {b.status === "ACTIVE" ? (
                            <span style={{ background: "#D1FAE5", color: "#065F46", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 2s infinite" }} />
                              Active
                            </span>
                          ) : (
                            <span style={{ background: "#FEE2E2", color: "#991B1B", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 18px", textAlign: "center" }}>
                          <div className="action-btn" style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              onClick={() => setViewTarget(b)}
                              style={{
                                padding: "7px 12px", borderRadius: 8,
                                border: "1.5px solid #BAE6FD", background: "#F0F9FF",
                                color: "#0EA5E9", fontSize: 12, fontWeight: 600,
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <Eye style={{ width: 13, height: 13 }} /> View
                            </button>
                            <button
                              onClick={() => openEdit(b)}
                              style={{
                                padding: "7px 12px", borderRadius: 8,
                                border: "1.5px solid #E2E8F0", background: "#F8FAFC",
                                color: "#374151", fontSize: 12, fontWeight: 600,
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <Edit3 style={{ width: 13, height: 13 }} /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(b)}
                              style={{
                                padding: "7px 12px", borderRadius: 8,
                                border: "1.5px solid #FEE2E2", background: "#FEF2F2",
                                color: "#EF4444", fontSize: 12, fontWeight: 600,
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <Trash2 style={{ width: 13, height: 13 }} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, boxShadow: "0 24px 80px rgba(124,92,252,0.22)", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}
            >
              {/* Modal Header */}
              <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {editTarget
                      ? <Edit3 style={{ width: 18, height: 18, color: "#7C5CFC" }} />
                      : <Plus style={{ width: 18, height: 18, color: "#7C5CFC" }} />
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: "#0F172A" }}>{editTarget ? "Edit Branch" : "Add New Branch"}</div>
                    <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>Fill in the location details below</div>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#F1F5F9", cursor: "pointer", fontSize: 18, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "22px 24px" }}>
                {/* Branch Name */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Branch Name</label>
                  <input
                    value={form.branchname}
                    onChange={e => setForm({ ...form, branchname: e.target.value })}
                    placeholder="e.g. Downtown Central Kitchen"
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>

                {/* Type + Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Branch Type</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={form.branchtype}
                        onChange={e => setForm({ ...form, branchtype: e.target.value })}
                        style={{ width: "100%", appearance: "none", padding: "11px 36px 11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", background: "#fff", cursor: "pointer", color: "#374151" }}
                        onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                        onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                      >
                        <option value="BRANCH">Branch</option>
                        <option value="CENTRAL_KITCHEN">Central Kitchen</option>
                        <option value="WAREHOUSE">Warehouse</option>
                      </select>
                      <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94A3B8", pointerEvents: "none" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Status</label>
                    <div style={{ display: "flex", gap: 6, paddingTop: 2 }}>
                      {[
                        { value: "ACTIVE", label: "Active", bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
                        { value: "INACTIVE", label: "Inactive", bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
                      ].map(s => (
                        <button
                          key={s.value}
                          onClick={() => setForm({ ...form, status: s.value })}
                          style={{
                            flex: 1, padding: "9px 8px", borderRadius: 9,
                            border: `1.5px solid ${form.status === s.value ? s.dot : "#E2E8F0"}`,
                            background: form.status === s.value ? s.bg : "#F8FAFC",
                            color: form.status === s.value ? s.color : "#64748B",
                            fontWeight: 600, fontSize: 12, cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Address</label>
                  <input
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Full address"
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (000) 000-0000"
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSave}
                  disabled={!form.branchname || !form.address || !form.phone}
                  style={{
                    width: "100%", padding: 15, borderRadius: 12, border: "none",
                    background: !form.branchname || !form.address || !form.phone
                      ? "#E2E8F0"
                      : "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
                    color: !form.branchname || !form.address || !form.phone ? "#94A3B8" : "#fff",
                    fontWeight: 700, fontSize: 15, cursor: !form.branchname || !form.address || !form.phone ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3,
                    boxShadow: !form.branchname || !form.address || !form.phone ? "none" : "0 4px 16px rgba(124,92,252,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all .15s",
                  }}
                >
                  <Save style={{ width: 16, height: 16 }} />
                  {editTarget ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.14)", fontFamily: "'DM Sans', sans-serif" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <AlertCircle style={{ width: 24, height: 24, color: "#EF4444" }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", marginBottom: 8 }}>Delete Branch</div>
              <div style={{ color: "#64748B", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Are you sure you want to remove <strong style={{ color: "#0F172A" }}>"{deleteConfirm.branchname}"</strong>? This action cannot be undone.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                >Cancel</button>
                <button
                  onClick={() => handleDelete(deleteConfirm.branchid)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                >Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW MODAL ── */}
      <AnimatePresence>
        {viewTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
            onClick={() => setViewTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(124,92,252,0.22)", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}
            >
              {(() => {
                const TC = TYPE_CONFIG[viewTarget.branchtype];
                return (
                  <>
                    {/* View Header */}
                    <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #F1F5F9", background: TC.bg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fff", border: `1px solid ${TC.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TC.icon style={{ width: 20, height: 20, color: TC.color }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 17, color: "#0F172A" }}>{viewTarget.branchname}</div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: TC.color }}>{TC.label}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewTarget(null)}
                        style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}
                      >
                        <X style={{ width: 16, height: 16 }} />
                      </button>
                    </div>

                    {/* View Body */}
                    <div style={{ padding: "20px 24px" }}>
                      {[
                        { label: "Address", value: viewTarget.address, Icon: MapPin },
                        { label: "Phone", value: viewTarget.phone, Icon: Phone },
                      ].map(f => (
                        <div key={f.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9", marginBottom: 10 }}>
                          <f.Icon style={{ width: 15, height: 15, color: "#94A3B8", marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{f.label}</p>
                            <p style={{ fontSize: 14, color: "#0F172A", margin: 0, fontWeight: 500 }}>{f.value}</p>
                          </div>
                        </div>
                      ))}

                      {/* Status row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Activity style={{ width: 15, height: 15, color: "#94A3B8" }} />
                          <div>
                            <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Status</p>
                            <p style={{ fontSize: 14, color: "#0F172A", margin: 0, fontWeight: 500 }}>{viewTarget.status}</p>
                          </div>
                        </div>
                        {viewTarget.status === "ACTIVE"
                          ? <CheckCircle2 style={{ width: 20, height: 20, color: "#10B981" }} />
                          : <XCircle style={{ width: 20, height: 20, color: "#EF4444" }} />
                        }
                      </div>

                      {/* Edit button */}
                      <button
                        onClick={() => { setViewTarget(null); openEdit(viewTarget); }}
                        style={{
                          width: "100%", padding: 13, borderRadius: 12, border: "none",
                          background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
                          color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          boxShadow: "0 4px 16px rgba(124,92,252,0.32)",
                        }}
                      >
                        <Edit3 style={{ width: 15, height: 15 }} /> Edit Branch
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}