import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import instances from "../../../components/axios";
import {
  ChefHat, Search, Plus, Eye, Edit3, Trash2, X,
  Save, RotateCcw, Calendar, Hash, Building2, UtensilsCrossed,
  Layers, Clock, FileText, ChevronDown,
  AlertCircle, CheckCircle2, Package, Sparkles
} from "lucide-react";

const EMPTY_FORM = { kitchen: "", product: "", qty: "", notes: "" };
const TODAY = new Date().toISOString().split("T")[0];
const POPULAR_BRANCH_COUNT = 5;

/* ─────────────────────────────────────────
   STAT PILL  (matches User Management style)
───────────────────────────────────────── */
function StatPill({ label, value, bg, border, valueColor }) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: 10,
        padding: "6px 14px",
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 800, color: valueColor }}>{value}</span>
      <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRODUCT BADGE
───────────────────────────────────────── */
function Badge({ product }) {
  return (
    <span
      style={{
        background: "#FEF3C7",
        color: "#92400E",
        borderRadius: 20,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      🍛 {product}
    </span>
  );
}

/* ─────────────────────────────────────────
   BRANCH PICKER  (mirrors UserManagement)
───────────────────────────────────────── */
function BranchPicker({ branches = [], selected, onChange, error }) {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState("");

  const popular = branches.slice(0, POPULAR_BRANCH_COUNT);
  const popularFiltered = popular.filter((b) =>
    b.branchname.toLowerCase().includes(query.toLowerCase())
  );
  const allFiltered = branches.filter((b) =>
    b.branchname.toLowerCase().includes(modalQuery.toLowerCase())
  );

  const selectedBranch = selected
    ? branches.find((b) => b.branchname === selected)
    : null;

  function pick(branch) {
    onChange(branch.branchname);
    setModalOpen(false);
    setModalQuery("");
  }

  return (
    <>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
            marginBottom: 8,
            letterSpacing: 0.3,
          }}
        >
          Branch / Warehouse{" "}
          {error && (
            <span style={{ color: "#EF4444", fontWeight: 400 }}>
              *required
            </span>
          )}
        </div>

        {selectedBranch && (
          <div
            style={{
              background:
                "linear-gradient(135deg, #7C5CFC18 0%, #7C5CFC08 100%)",
              border: "1.5px solid #7C5CFC55",
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span style={{ color: "#7C5CFC", fontSize: 16 }}>✓</span>
            <span
              style={{ fontWeight: 600, color: "#7C5CFC", fontSize: 14 }}
            >
              {selectedBranch.branchname}
            </span>
            <button
              onClick={() => onChange("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ position: "relative", marginBottom: 10 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94A3B8",
              fontSize: 15,
            }}
          >
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search branch…"
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              border: `1.5px solid ${error ? "#EF4444" : "#E2E8F0"}`,
              borderRadius: 10,
              fontSize: 14,
              boxSizing: "border-box",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#7C5CFC")}
            onBlur={(e) =>
              (e.target.style.borderColor = error ? "#EF4444" : "#E2E8F0")
            }
          />
        </div>

        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
        >
          {popularFiltered.map((b) => (
            <button
              key={b.branchid}
              onClick={() => pick(b)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border:
                  selected === b.branchname
                    ? "1.5px solid #7C5CFC"
                    : "1.5px solid #E2E8F0",
                background:
                  selected === b.branchname ? "#7C5CFC" : "#F8FAFC",
                color: selected === b.branchname ? "#fff" : "#374151",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all .15s",
              }}
            >
              {b.branchname}
            </button>
          ))}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "#7C5CFC",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            padding: "4px 0",
          }}
        >
          + More Branches
        </button>
      </div>

      {/* Branch Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,15,30,0.55)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 24px 64px rgba(124,92,252,0.18)",
              overflow: "hidden",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div
              style={{
                padding: "20px 20px 0",
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: "#0F172A",
                  marginBottom: 14,
                }}
              >
                Select Branch / Warehouse
              </div>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                  }}
                >
                  🔍
                </span>
                <input
                  autoFocus
                  value={modalQuery}
                  onChange={(e) => setModalQuery(e.target.value)}
                  placeholder="Search branch…"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 10,
                    fontSize: 14,
                    boxSizing: "border-box",
                    outline: "none",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", padding: "8px 0" }}>
              {allFiltered.map((b) => (
                <button
                  key={b.branchid}
                  onClick={() => pick(b)}
                  style={{
                    width: "100%",
                    padding: "13px 20px",
                    background:
                      selected === b.branchname ? "#7C5CFC0D" : "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: selected === b.branchname ? "#7C5CFC" : "#1E293B",
                    fontWeight: selected === b.branchname ? 600 : 400,
                  }}
                >
                  {selected === b.branchname && (
                    <span style={{ color: "#7C5CFC", fontWeight: 700 }}>✓</span>
                  )}
                  {b.branchname}
                </button>
              ))}
              {allFiltered.length === 0 && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#94A3B8",
                    fontSize: 14,
                  }}
                >
                  No branches found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#18181B",
        color: "#fff",
        borderRadius: 12,
        padding: "12px 24px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 9999,
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          background: type === "success" ? "#10B981" : "#EF4444",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
        }}
      >
        {type === "success" ? "✓" : "✕"}
      </span>
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function KitchenProduction() {
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const [search, setSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productOpen, setProductOpen] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const productInputRef = useRef(null);

useEffect(() => {

  const tenantId =
      localStorage.getItem("tenantId");

  if (tenantId) {
    instances.defaults.headers.common["X-TenantID"] =
        tenantId;
  }

  fetchAll();

}, []);
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (deleteConfirm) setDeleteConfirm(null);
        else if (viewTarget) setViewTarget(null);
        else if (productOpen) setProductOpen(false);
        else if (showFormModal) {
          setShowFormModal(false);
          setProductOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteConfirm, viewTarget, productOpen, showFormModal]);

  useEffect(() => {
    if (showFormModal && productInputRef.current) {
      const timer = setTimeout(() => productInputRef.current?.focus(), 120);
      return () => clearTimeout(timer);
    }
  }, [showFormModal]);

  const pushToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => {
      setToast((prev) => (prev.open ? { ...prev, open: false } : prev));
    }, 3200);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [productionRes, branchRes, productRes, stockRes] = await Promise.all([
        instances.get("/kitchenproduction/all"),
        instances.get("/branches/all"),
        instances.get("/product/all"),
        instances.get("/branch-stock/all"),
      ]);
      setRecords(productionRes.data || []);
      setBranches(branchRes.data || []);
      setProducts(productRes.data || []);
      setStock(stockRes.data || []);
    } catch (error) {
      console.log(error);
      pushToast("error", "Failed to load ERP data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const todayRecords = useMemo(
    () => records.filter((r) => r.productiondate?.startsWith(TODAY)),
    [records]
  );

  const totalQtyToday = useMemo(
    () => todayRecords.reduce((s, r) => s + Number(r.qty || 0), 0),
    [todayRecords]
  );

  const activeKitchens = useMemo(
    () => new Set(records.map((r) => r.branch?.branchname).filter(Boolean)).size,
    [records]
  );

  const mostProduced = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      const name = r.product?.itemname;
      if (name) counts[name] = (counts[name] || 0) + Number(r.qty || 0);
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.productionid?.toString().toLowerCase().includes(q) ||
        r.product?.itemname?.toLowerCase().includes(q) ||
        r.branch?.branchname?.toLowerCase().includes(q)
    );
  }, [records, search]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.itemname?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const handleProductBlur = () => {
    setTimeout(() => setProductOpen(false), 150);
  };

  const getAvailableStock = () => {
    if (!form.kitchen || !form.product) return null;
    const stockItem = stock.find(
      (s) =>
        s.branch?.branchname === form.kitchen &&
        s.product?.itemname === form.product
    );
    return stockItem?.qty ?? null;
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "—");

  const validate = () => {
    const e = {};
    if (!form.kitchen) e.kitchen = true;
    if (!form.product) e.product = true;
    if (!form.qty || isNaN(form.qty) || Number(form.qty) <= 0) e.qty = true;
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setProductSearch("");
    setEditTarget(null);
    setFormErrors({});
    setProductOpen(false);
    setSaved(false);
  };

  const openCreateModal = () => {
    handleClear();
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!validate()) return;

    const availableStock = getAvailableStock();
    if (availableStock !== null && Number(form.qty) > availableStock) {
      pushToast("error", "Insufficient stock for selected kitchen.");
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        branchname: form.kitchen,
        productname: form.product,
        qty: Number(form.qty),
        notes: form.notes,
      };

      if (editTarget) {
        await instances.put(`/kitchenproduction/${editTarget}`, payload);
        pushToast("success", "Production record updated successfully.");
      } else {
        await instances.post("/kitchenproduction/register", payload);
        pushToast("success", "Production record saved successfully.");
      }

      await fetchAll();
      setSaved(true);

      setTimeout(() => {
        handleClear();
        setShowFormModal(false);
      }, 700);
    } catch (error) {
      console.log(error);
      pushToast("error", "Unable to save production record. Try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (r) => {
    setForm({
      kitchen: r.branch?.branchname || "",
      product: r.product?.itemname || "",
      qty: String(r.qty || ""),
      notes: r.notes || "",
    });
    setProductSearch(r.product?.itemname || "");
    setEditTarget(r.productionid);
    setFormErrors({});
    setShowFormModal(true);
    setViewTarget(null);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await instances.delete(`/kitchenproduction/${id}`);
      await fetchAll();
      if (editTarget === id) handleClear();
      setDeleteConfirm(null);
      pushToast("success", "Production record deleted.");
    } catch (error) {
      console.log(error);
      pushToast("error", "Unable to delete production record. Try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          background: "#F4F3FF",
          color: "#64748B",
          fontSize: 15,
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F3FF; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #C7BCFC; border-radius: 4px; }
        tr:hover td { background: #7C5CFC06 !important; }
      `}</style>

      <div
        style={{ minHeight: "100vh", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif" }}
        onKeyDown={(e) => {
          const tag = document.activeElement?.tagName;
          if (e.key === "Enter" && tag !== "TEXTAREA" && tag !== "SELECT" && showFormModal) {
            e.preventDefault();
            handleSave();
          }
        }}
      >
        {/* ── TOP NAV ── */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #EDE9FE",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            height: 56,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18, color: "#7C5CFC", letterSpacing: -0.5 }}>
            NextGen<span style={{ color: "#0F172A" }}>POS</span>
          </div>
          <div style={{ marginLeft: 32, display: "flex", gap: 4 }}>
            {["Dashboard", "Orders", "Kitchen", "Settings"].map((nav) => (
              <div
                key={nav}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: nav === "Kitchen" ? "#7C5CFC15" : "transparent",
                  color: nav === "Kitchen" ? "#7C5CFC" : "#64748B",
                  fontSize: 13,
                  fontWeight: nav === "Kitchen" ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {nav}
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

          {/* ── PAGE HEADER ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontWeight: 800,
                  fontSize: 26,
                  color: "#0F172A",
                  letterSpacing: -0.5,
                  marginBottom: 4,
                }}
              >
                Kitchen Production
              </h1>
              <p style={{ color: "#64748B", fontSize: 14 }}>
                Manage food production and kitchen inventory
              </p>
            </div>
            <button
              onClick={openCreateModal}
              style={{
                padding: "12px 22px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(124,92,252,0.32)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 18 }}>+</span> Add Production
            </button>
          </div>

          {/* ── STAT PILLS ── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <StatPill
              label="Productions Today"
              value={todayRecords.length}
              bg="#F4F3FF"
              border="#7C5CFC22"
              valueColor="#7C5CFC"
            />
            <StatPill
              label="Qty Produced Today"
              value={totalQtyToday}
              bg="#FEF3C7"
              border="#F59E0B22"
              valueColor="#B45309"
            />
            <StatPill
              label="Active Kitchens"
              value={activeKitchens}
              bg="#F0F9FF"
              border="#0EA5E922"
              valueColor="#0369A1"
            />
            <StatPill
              label="Most Produced"
              value={mostProduced}
              bg="#F0FDF4"
              border="#10B98122"
              valueColor="#065F46"
            />
          </div>

          {/* ── FILTER BAR ── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 14,
              border: "1px solid #EDE9FE",
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                }}
              >
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records…"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7C5CFC")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          </div>

          {/* ── TABLE ── */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #EDE9FE",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#FAFAFF" }}>
                    {["Prod. ID", "Kitchen", "Product", "Qty", "Date", "Notes", "Actions"].map(
                      (col, i) => (
                        <th
                          key={col}
                          style={{
                            padding: "13px 18px",
                            textAlign: i === 6 ? "center" : "left",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#94A3B8",
                            letterSpacing: 0.5,
                            borderBottom: "1px solid #F1F5F9",
                          }}
                        >
                          {col.toUpperCase()}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: "48px 20px",
                          textAlign: "center",
                          color: "#94A3B8",
                          fontSize: 14,
                        }}
                      >
                        No production records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.productionid} style={{ borderBottom: "1px solid #F8FAFC" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              background: "#7C5CFC12",
                              color: "#7C5CFC",
                              borderRadius: 8,
                              padding: "3px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {r.productionid}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: 14, color: "#374151" }}>
                          {r.branch?.branchname}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <Badge product={r.product?.itemname} />
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>
                            {r.qty}
                          </span>
                          <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 3 }}>
                            units
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: 13, color: "#64748B" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {formatDate(r.productiondate)}
                            {r.productiondate?.startsWith(TODAY) && (
                              <span
                                style={{
                                  background: "#D1FAE5",
                                  color: "#065F46",
                                  borderRadius: 20,
                                  padding: "2px 8px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                }}
                              >
                                TODAY
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: 13, color: "#94A3B8" }}>
                          {r.notes || "—"}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              onClick={() => setViewTarget(r)}
                              style={{
                                padding: "7px 14px",
                                borderRadius: 8,
                                border: "1.5px solid #E0F2FE",
                                background: "#F0F9FF",
                                color: "#0369A1",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              👁 View
                            </button>
                            <button
                              onClick={() => handleEdit(r)}
                              style={{
                                padding: "7px 14px",
                                borderRadius: 8,
                                border: "1.5px solid #E2E8F0",
                                background: "#F8FAFC",
                                color: "#374151",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(r)}
                              style={{
                                padding: "7px 14px",
                                borderRadius: 8,
                                border: "1.5px solid #FEE2E2",
                                background: "#FEF2F2",
                                color: "#EF4444",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            FORM MODAL  (Add / Edit)
        ══════════════════════════════════ */}
        {showFormModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,15,30,0.55)",
              zIndex: 7000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              overflowY: "auto",
            }}
            onClick={() => { setShowFormModal(false); setProductOpen(false); }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 20,
                width: "100%",
                maxWidth: 520,
                boxShadow: "0 24px 80px rgba(124,92,252,0.22)",
                fontFamily: "'DM Sans', sans-serif",
                margin: "auto",
              }}
            >
              {/* Modal header */}
              <div
                style={{
                  padding: "22px 24px 18px",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
                    {editTarget ? `Edit Production ${editTarget}` : "New Production Entry"}
                  </div>
                  <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>
                    Fill in the production details below
                  </div>
                </div>
                <button
                  onClick={() => { setShowFormModal(false); setProductOpen(false); }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "#F1F5F9",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: "22px 24px", maxHeight: "80vh", overflowY: "auto" }}>

                {/* Branch Picker */}
                <div style={{ marginBottom: 18 }}>
                  <BranchPicker
                    branches={branches}
                    selected={form.kitchen}
                    onChange={(val) => setForm({ ...form, kitchen: val })}
                    error={formErrors.kitchen}
                  />
                </div>

                {/* Product */}
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Product Name{" "}
                    {formErrors.product && (
                      <span style={{ color: "#EF4444", fontWeight: 400 }}>*required</span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94A3B8",
                        pointerEvents: "none",
                      }}
                    >
                      🍛
                    </span>
                    <input
  ref={productInputRef}
  value={productSearch}
  onChange={(e) => {
    setProductSearch(e.target.value);
    setForm({ ...form, product: "" });
    setProductOpen(true);
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!form.product && filteredProducts.length > 0) {
        const first = filteredProducts[0];

        setForm((prev) => ({
          ...prev,
          product: first.itemname
        }));

        setProductSearch(first.itemname);
        setProductOpen(false);
        return;
      }

      handleSave();
    }
  }}
  placeholder="Search product…"
  style={{
    width: "100%",
    padding: "10px 12px 10px 36px",
    border: `1.5px solid ${
      formErrors.product ? "#EF4444" : "#E2E8F0"
    }`,
    borderRadius: 10,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  }}
  onFocus={(e) => {
    e.target.style.borderColor = "#7C5CFC";
    setProductOpen(true);
  }}
  onBlur={(e) => {
    e.target.style.borderColor =
      formErrors.product ? "#EF4444" : "#E2E8F0";

    handleProductBlur();
  }}
/>

                    {/* Product dropdown */}
                    {productOpen && filteredProducts.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "100%",
                          marginTop: 4,
                          zIndex: 30,
                          borderRadius: 10,
                          border: "1.5px solid #E2E8F0",
                          background: "#fff",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                          maxHeight: 200,
                          overflowY: "auto",
                        }}
                      >
                        {filteredProducts.map((p) => (
                          <button
                            key={p.itemid || p.itemname}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setForm({ ...form, product: p.itemname });
                              setProductSearch(p.itemname);
                              setProductOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              background:
                                form.product === p.itemname ? "#7C5CFC0D" : "transparent",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 14,
                              color: form.product === p.itemname ? "#7C5CFC" : "#1E293B",
                              fontWeight: form.product === p.itemname ? 600 : 400,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            {p.itemname}
                            {form.product === p.itemname && (
                              <span style={{ color: "#10B981" }}>✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {form.product && (
                    <div style={{ marginTop: 8 }}>
                      <Badge product={form.product} />
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Quantity Produced{" "}
                    {formErrors.qty && (
                      <span style={{ color: "#EF4444", fontWeight: 400 }}>*required</span>
                    )}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94A3B8",
                        fontWeight: 700,
                      }}
                    >
                      #
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={form.qty}
                      onChange={(e) => setForm({ ...form, qty: e.target.value })}
                      placeholder="e.g. 100"
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 36px",
                        border: `1.5px solid ${formErrors.qty ? "#EF4444" : "#E2E8F0"}`,
                        borderRadius: 10,
                        fontSize: 14,
                        boxSizing: "border-box",
                        outline: "none",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#7C5CFC")}
                      onBlur={(e) =>
                        (e.target.style.borderColor = formErrors.qty ? "#EF4444" : "#E2E8F0")
                      }
                    />
                  </div>
                  {form.kitchen && form.product && getAvailableStock() !== null && (
                    <p style={{ marginTop: 6, fontSize: 12, color: "#64748B" }}>
                      Available stock:{" "}
                      <span style={{ color: "#7C5CFC", fontWeight: 600 }}>
                        {getAvailableStock()}
                      </span>
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Notes{" "}
                    <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional notes…"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: 10,
                      fontSize: 14,
                      boxSizing: "border-box",
                      outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#7C5CFC")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading || !form.kitchen || !form.product || !form.qty}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: 12,
                      border: "none",
                      background:
                        saved
                          ? "#10B981"
                          : "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: saveLoading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: "0 4px 16px rgba(124,92,252,0.35)",
                      opacity: saveLoading || !form.kitchen || !form.product || !form.qty ? 0.6 : 1,
                      transition: "all .2s",
                    }}
                  >
                    {saved
                      ? "✓ Saved!"
                      : saveLoading
                      ? "Saving…"
                      : editTarget
                      ? "Update Production"
                      : "Save Production"}
                  </button>
                  <button
                    onClick={() => { handleClear(); setShowFormModal(false); }}
                    style={{
                      padding: "14px 20px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      background: "#F8FAFC",
                      color: "#374151",
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            VIEW MODAL
        ══════════════════════════════════ */}
        {viewTarget && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,15,30,0.55)",
              zIndex: 7000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setViewTarget(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 20,
                width: "100%",
                maxWidth: 420,
                boxShadow: "0 24px 80px rgba(124,92,252,0.22)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div
                style={{
                  padding: "22px 24px 18px",
                  borderBottom: "1px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
                    Production Record
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#7C5CFC",
                      fontFamily: "'DM Mono', monospace",
                      marginTop: 2,
                    }}
                  >
                    {viewTarget.productionid}
                  </div>
                </div>
                <button
                  onClick={() => setViewTarget(null)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "#F1F5F9",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Kitchen Branch", value: viewTarget.branch?.branchname },
                  { label: "Date", value: formatDate(viewTarget.productiondate) },
                  { label: "Quantity", value: `${viewTarget.qty} units` },
                ].map((f) => (
                  <div
                    key={f.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "#F8FAFC",
                      border: "1px solid #F1F5F9",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#94A3B8",
                          fontWeight: 600,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        {f.label}
                      </div>
                      <div style={{ fontSize: 14, color: "#0F172A", fontWeight: 500 }}>
                        {f.value}
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "#F8FAFC",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#94A3B8",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    Product
                  </div>
                  <Badge product={viewTarget.product?.itemname} />
                </div>

                {viewTarget.notes && (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "#F8FAFC",
                      border: "1px solid #F1F5F9",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}
                    >
                      Notes
                    </div>
                    <div style={{ fontSize: 14, color: "#374151" }}>{viewTarget.notes}</div>
                  </div>
                )}

                <button
                  onClick={() => handleEdit(viewTarget)}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "12px",
                    borderRadius: 10,
                    border: "1.5px solid #E2E8F0",
                    background: "#F8FAFC",
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ✏️ Edit This Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            DELETE CONFIRM MODAL
        ══════════════════════════════════ */}
        {deleteConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,15,30,0.55)",
              zIndex: 8000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 18,
                width: "100%",
                maxWidth: 380,
                padding: 28,
                boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                🗑️
              </div>
              <div
                style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", marginBottom: 8 }}
              >
                Delete Record
              </div>
              <div
                style={{
                  color: "#64748B",
                  fontSize: 14,
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                Are you sure you want to delete production{" "}
                <strong style={{ color: "#7C5CFC", fontFamily: "'DM Mono', monospace" }}>
                  {deleteConfirm.productionid}
                </strong>
                ? This cannot be undone.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    border: "1.5px solid #E2E8F0",
                    background: "#fff",
                    color: "#374151",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.productionid)}
                  disabled={deleteLoading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    border: "none",
                    background: "#EF4444",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: deleteLoading ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    opacity: deleteLoading ? 0.6 : 1,
                  }}
                >
                  {deleteLoading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOAST ── */}
        {toast.open && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDone={() => setToast((p) => ({ ...p, open: false }))}
          />
        )}
      </div>
    </>
  );
}