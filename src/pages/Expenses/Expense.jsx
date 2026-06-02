import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt, Plus, Edit3, Trash2, X, Save, AlertCircle,
  Calendar, Tag, DollarSign, FileText, CheckCircle2,
  Search, Activity, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getExpenseCategories, createExpenseCategory,
} from "../../services/expenseService";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n === "" || n == null
    ? "0"
    : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EMPTY_FORM = { date: today(), category: "", amount: "", description: "" };

// ─── INPUT STYLE (white bg, dark text) ───────────────────────────────────────
const inputBase = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
  color: "#0F172A",
  background: "#FFFFFF",
};

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "#EF4444" : "#18181B",
      color: "#fff", borderRadius: 12, padding: "12px 24px",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
      display: "flex", alignItems: "center", gap: 10, zIndex: 9999,
      boxShadow: "0 8px 32px rgba(0,0,0,0.22)", animation: "slideUp .22s ease",
    }}>
      <span style={{ width: 20, height: 20, background: type === "error" ? "#fff3" : "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</span>
      {message}
    </div>
  );
}

// ─── Category Picker (inline, like Product page) ──────────────────────────────
function CategoryPicker({ categories, selected, onChange, onAddCategory }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newCat, setNewCat] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const popular = categories.slice(0, 6);
  const popularFiltered = popular.filter(c =>
    c.expensecategory.toLowerCase().includes(search.toLowerCase())
  );
  const allFiltered = categories.filter(c =>
    c.expensecategory.toLowerCase().includes(search.toLowerCase())
  );
  const selectedCat = categories.find(c => c.expensecategory === selected);

  const pick = (cat) => {
    onChange(cat.expensecategory);
    setModalOpen(false);
    setSearch("");
  };

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    setSaving(true);
    try {
      const created = await onAddCategory(newCat.trim());
      onChange(created.expensecategory);
      setNewCat("");
      setAddMode(false);
      setModalOpen(false);
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
          Category
        </label>

        {selectedCat && (
          <div style={{
            background: "#F4F3FF", border: "1.5px solid rgba(124,92,252,0.33)",
            borderRadius: 10, padding: "9px 14px",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
          }}>
            <CheckCircle2 style={{ width: 15, height: 15, color: "#7C5CFC", flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: "#7C5CFC", fontSize: 14 }}>{selectedCat.expensecategory}</span>
            <button onClick={() => onChange("")} style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#94A3B8", cursor: "pointer", display: "flex",
            }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        {/* Quick chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
          {popularFiltered.map(c => {
            const isSelected = selected === c.expensecategory;
            return (
              <button key={c.expensecategoryid} type="button" onClick={() => pick(c)} style={{
                padding: "7px 14px", borderRadius: 9,
                border: `1.5px solid ${isSelected ? "#7C5CFC" : "#E2E8F0"}`,
                background: isSelected ? "#7C5CFC" : "#F8FAFC",
                color: isSelected ? "#fff" : "#374151",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
              }}>
                {c.expensecategory}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => setModalOpen(true)} style={{
          background: "none", border: "none", color: "#7C5CFC", fontWeight: 600,
          fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          padding: "2px 0", display: "flex", alignItems: "center", gap: 4,
        }}>
          <Plus style={{ width: 13, height: 13 }} /> More / Add Category
        </button>
      </div>

      {/* ── All categories modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)",
              zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16, backdropFilter: "blur(4px)",
            }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "#fff", borderRadius: 18, width: "100%", maxWidth: 380,
                boxShadow: "0 24px 64px rgba(124,92,252,0.18)", overflow: "hidden",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {/* Header */}
              <div style={{
                padding: "18px 20px 14px", borderBottom: "1px solid #F1F5F9",
                background: "#F4F3FF", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>Select Category</span>
                <button onClick={() => setModalOpen(false)} style={{
                  width: 28, height: 28, borderRadius: 8, border: "1.5px solid #E2E8F0",
                  background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <X style={{ width: 14, height: 14, color: "#64748B" }} />
                </button>
              </div>

              <div style={{ padding: "14px 16px" }}>
                {/* Search */}
                <div style={{ position: "relative", marginBottom: 10 }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8" }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search category…"
                    style={{ ...inputBase, paddingLeft: 32, paddingTop: 9, paddingBottom: 9, fontSize: 13 }}
                    onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                    onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>

                {/* List */}
                <div style={{
                  maxHeight: 210, overflowY: "auto",
                  border: "1px solid #F1F5F9", borderRadius: 10, marginBottom: 10,
                }}>
                  {allFiltered.map(c => (
                    <button key={c.expensecategoryid} type="button" onClick={() => pick(c)} style={{
                      width: "100%", padding: "11px 14px",
                      background: selected === c.expensecategory ? "#F4F3FF" : "transparent",
                      border: "none", borderBottom: "1px solid #F8FAFC",
                      textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                      color: selected === c.expensecategory ? "#7C5CFC" : "#1E293B",
                      fontWeight: selected === c.expensecategory ? 600 : 500,
                    }}>
                      {selected === c.expensecategory && (
                        <CheckCircle2 style={{ width: 13, height: 13, color: "#7C5CFC", flexShrink: 0 }} />
                      )}
                      {c.expensecategory}
                    </button>
                  ))}
                  {allFiltered.length === 0 && (
                    <div style={{ padding: 20, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No categories found</div>
                  )}
                </div>

                {/* Add new */}
                {!addMode ? (
                  <button type="button" onClick={() => setAddMode(true)} style={{
                    width: "100%", padding: "9px 0", borderRadius: 10,
                    border: "1.5px dashed #C4B5FD", background: "transparent",
                    color: "#7C5CFC", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}>
                    <Plus style={{ width: 13, height: 13 }} /> Add New Category
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 7 }}>
                    <input
                      autoFocus
                      value={newCat}
                      onChange={e => setNewCat(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAdd()}
                      placeholder="Category name…"
                      style={{ ...inputBase, flex: 1, paddingTop: 9, paddingBottom: 9, fontSize: 13 }}
                      onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                      onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                    />
                    <button type="button" onClick={handleAdd} disabled={saving} style={{
                      padding: "9px 14px", borderRadius: 9, border: "none",
                      background: "#7C5CFC", color: "#fff",
                      fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.6 : 1,
                    }}>
                      {saving ? "..." : "Save"}
                    </button>
                    <button type="button" onClick={() => { setAddMode(false); setNewCat(""); }} style={{
                      padding: "9px 11px", borderRadius: 9, border: "1.5px solid #E2E8F0",
                      background: "#F8FAFC", color: "#64748B", cursor: "pointer",
                      display: "flex", alignItems: "center",
                    }}>
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Add / Edit Expense Modal ─────────────────────────────────────────────────
function ExpenseModal({ editExpense, categories, onAddCategory, onClose, onSave }) {
  const [form, setForm] = useState(
    editExpense
      ? {
          date: editExpense.date,
          category: editExpense.category,
          amount: String(editExpense.amount),
          description: editExpense.description,
        }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.date) e.date = "Date is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.amount || isNaN(Number(form.amount))) e.amount = "Valid amount required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({ ...form, amount: Number(form.amount), id: editExpense?.expenseid });
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 1200);
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)",
        zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, backdropFilter: "blur(4px)", overflowY: "auto",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
          boxShadow: "0 24px 80px rgba(124,92,252,0.22)",
          fontFamily: "'DM Sans', sans-serif", margin: "auto",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "22px 24px 18px", borderBottom: "1px solid #F1F5F9",
          background: "#F4F3FF",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {editExpense
                ? <Edit3 style={{ width: 17, height: 17, color: "#fff" }} />
                : <Plus style={{ width: 17, height: 17, color: "#fff" }} />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>
                {editExpense ? "Edit Expense" : "Add New Expense"}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                {editExpense ? "Update expense details" : "Fill in the expense details below"}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E2E8F0",
            background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X style={{ width: 15, height: 15, color: "#64748B" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px" }}>
          {/* Date + Amount row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {/* Date */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Date {errors.date && <span style={{ color: "#EF4444" }}>*</span>}
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                style={{
                  ...inputBase,
                  borderColor: errors.date ? "#EF4444" : "#E2E8F0",
                  background: errors.date ? "#FEF2F2" : "#FFFFFF",
                }}
                onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                onBlur={e => e.target.style.borderColor = errors.date ? "#EF4444" : "#E2E8F0"}
              />
              {errors.date && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle style={{ width: 11, height: 11 }} />{errors.date}</div>}
            </div>

            {/* Amount */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Amount (₹) {errors.amount && <span style={{ color: "#EF4444" }}>*</span>}
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#7C5CFC", fontWeight: 700, fontSize: 14 }}>₹</span>
                <input
                  type="text"
                  placeholder="0"
                  value={form.amount ? fmt(form.amount) : ""}
                  onChange={e => set("amount", e.target.value.replace(/[^0-9]/g, ""))}
                  style={{
                    ...inputBase,
                    paddingLeft: 28,
                    borderColor: errors.amount ? "#EF4444" : "#E2E8F0",
                    background: errors.amount ? "#FEF2F2" : "#FFFFFF",
                  }}
                  onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                  onBlur={e => e.target.style.borderColor = errors.amount ? "#EF4444" : "#E2E8F0"}
                />
              </div>
              {errors.amount && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle style={{ width: 11, height: 11 }} />{errors.amount}</div>}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Description {errors.description && <span style={{ color: "#EF4444" }}>*</span>}
            </label>
            <input
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Enter description"
              style={{
                ...inputBase,
                borderColor: errors.description ? "#EF4444" : "#E2E8F0",
                background: errors.description ? "#FEF2F2" : "#FFFFFF",
              }}
              onFocus={e => e.target.style.borderColor = "#7C5CFC"}
              onBlur={e => e.target.style.borderColor = errors.description ? "#EF4444" : "#E2E8F0"}
            />
            {errors.description && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle style={{ width: 11, height: 11 }} />{errors.description}</div>}
          </div>

          {/* Category Picker */}
          <div style={{
            marginBottom: 22,
            ...(errors.category ? { padding: 12, borderRadius: 12, border: "1.5px solid #FCA5A5", background: "#FEF2F2" } : {}),
          }}>
            <CategoryPicker
              categories={categories}
              selected={form.category}
              onChange={v => set("category", v)}
              onAddCategory={onAddCategory}
            />
            {errors.category && (
              <div style={{ color: "#EF4444", fontSize: 11, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <AlertCircle style={{ width: 11, height: 11 }} />{errors.category}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "12px 0", borderRadius: 12,
              border: "1.5px solid #E2E8F0", background: "#fff",
              color: "#374151", fontWeight: 600, fontSize: 14,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              Cancel
            </button>
            <motion.button
              type="button"
              onClick={submit}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                background: done
                  ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                  : "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: done ? "0 4px 16px rgba(16,185,129,0.35)" : "0 4px 16px rgba(124,92,252,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: saving ? 0.75 : 1,
              }}
            >
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <CheckCircle2 style={{ width: 16, height: 16 }} /> Saved!
                  </motion.span>
                ) : saving ? (
                  <motion.span key="spin" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <RefreshCw style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Saving…
                  </motion.span>
                ) : (
                  <motion.span key="idle" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Save style={{ width: 16, height: 16 }} />
                    {editExpense ? "Save Changes" : "Add Expense"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete Expense Confirm ───────────────────────────────────────────────────
function DeleteExpenseConfirm({ expense, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)",
        zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, width: "100%", maxWidth: 380, padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)", fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Trash2 style={{ width: 22, height: 22, color: "#EF4444" }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", marginBottom: 8 }}>Delete Expense</div>
        <div style={{ color: "#64748B", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Delete <strong style={{ color: "#0F172A" }}>"{expense.description}"</strong> (₹{fmt(expense.amount)})? This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #E2E8F0",
            background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 12, borderRadius: 10, border: "none",
            background: "#EF4444", color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
          }}>
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export default function Expense() {
  const [expenses, setExpenses]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("ALL");
  const [modal, setModal]           = useState(null);   // null | "add" | { editExpense }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [page, setPage]             = useState(1);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadExpenses = useCallback(async () => {
    try {
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load expenses", "error");
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load categories", "error");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadExpenses(), loadCategories()]).finally(() => setLoading(false));
  }, [loadExpenses, loadCategories]);

  const handleAddCategory = async (name) => {
    const created = await createExpenseCategory({ expensecategory: name });
    setCategories(prev => [...prev, created]);
    return created;
  };

  const filtered = useMemo(() =>
    expenses.filter(e => {
      const ms =
        (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(search.toLowerCase());
      const mc = catFilter === "ALL" || e.category === catFilter;
      return ms && mc;
    }),
    [expenses, search, catFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search, catFilter]);

  const totalAmount = useMemo(() =>
    filtered.reduce((s, e) => s + Number(e.amount || 0), 0), [filtered]
  );

  async function handleSave(form) {
    setLoading(true);
    try {
      if (form.id) {
        await updateExpense(form.id, form);
        showToast("Expense updated");
      } else {
        await createExpense(form);
        showToast("Expense added");
      }
      setModal(null);
      await loadExpenses();
    } catch {
      showToast("Failed to save expense", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setLoading(true);
    try {
      await deleteExpense(id);
      showToast("Expense deleted");
      setDeleteTarget(null);
      await loadExpenses();
    } catch {
      showToast("Failed to delete expense", "error");
    } finally {
      setLoading(false);
    }
  }

  const catTabs = useMemo(() => {
    const seen = new Set();
    expenses.forEach(e => e.category && seen.add(e.category));
    return Array.from(seen);
  }, [expenses]);

  const avgAmount = expenses.length
    ? (expenses.reduce((s, e) => s + Number(e.amount || 0), 0) / expenses.length).toFixed(0)
    : "0";

  const STATS = [
    { label: "Total Expenses", value: expenses.length,        color: "#7C5CFC", bg: "#F4F3FF", Icon: Receipt      },
    { label: "Filtered Total", value: `₹${fmt(totalAmount)}`, color: "#10B981", bg: "#F0FDF4", Icon: DollarSign   },
    { label: "Categories",     value: categories.length,      color: "#0EA5E9", bg: "#F0F9FF", Icon: Tag          },
    { label: "This View",      value: filtered.length,        color: "#F59E0B", bg: "#FFFBEB", Icon: Activity     },
  ];

  if (loading && expenses.length === 0) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748B" }}>
        <RefreshCw style={{ width: 18, height: 18, color: "#7C5CFC", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Loading expenses…</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(12px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#C7BCFC;border-radius:4px;}
        .exp-row:hover td{background:rgba(124,92,252,0.03);}
        .act-btn{opacity:1;transition:opacity .15s;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── NAV ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid #EDE9FE", padding: "0 24px", display: "flex", alignItems: "center", height: 56 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#7C5CFC", letterSpacing: -0.5 }}>
            NextGen<span style={{ color: "#0F172A" }}>POS</span>
          </div>
          <div style={{ marginLeft: 32, display: "flex", gap: 4 }}>
            {["Dashboard", "Expenses", "Users", "Products", "Settings"].map(nav => (
              <div key={nav} style={{
                padding: "8px 16px", borderRadius: 8,
                background: nav === "Expenses" ? "#7C5CFC15" : "transparent",
                color: nav === "Expenses" ? "#7C5CFC" : "#64748B",
                fontSize: 13, fontWeight: nav === "Expenses" ? 700 : 500, cursor: "pointer",
              }}>{nav}</div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 100px" }}>

          {/* ── PAGE HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Receipt style={{ width: 22, height: 22, color: "#7C5CFC" }} />
              </div>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: 26, color: "#0F172A", letterSpacing: -0.5, margin: 0, marginBottom: 3 }}>
                  Expense Register
                </h1>
                <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Track and manage your business expenses</p>
              </div>
            </div>
          </motion.div>

          {/* ── STATS ── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: s.bg, borderRadius: 10, padding: "8px 16px", border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", gap: 10 }}
              >
                <s.Icon style={{ width: 15, height: 15, color: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{s.label}</span>
              </motion.div>
            ))}
          </div>

          {/* ── FILTERS ── */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 14, border: "1px solid #EDE9FE", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94A3B8" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search expenses or categories…"
                style={{ ...inputBase, paddingLeft: 34, paddingTop: 10, paddingBottom: 10 }}
                onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {["ALL", ...catTabs].map(t => (
                <button key={t} onClick={() => setCatFilter(t)} style={{
                  padding: "8px 14px", borderRadius: 9,
                  border: `1.5px solid ${catFilter === t ? "#7C5CFC" : "#E2E8F0"}`,
                  background: catFilter === t ? "#7C5CFC" : "#F8FAFC",
                  color: catFilter === t ? "#fff" : "#374151",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {t === "ALL" ? "All" : t}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#94A3B8" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* ── TABLE ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FE", overflow: "hidden" }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                <thead>
                  <tr style={{ background: "#FAFAFF" }}>
                    {["#", "Date", "Category", "Amount", "Description", "Actions"].map((col, i) => (
                      <th key={col} style={{
                        padding: "13px 18px",
                        textAlign: i === 5 ? "center" : "left",
                        fontSize: 11, fontWeight: 700, color: "#94A3B8",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap",
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "64px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 38, marginBottom: 12 }}>💸</div>
                        <p style={{ color: "#94A3B8", fontSize: 14, margin: 0, fontWeight: 500 }}>No expenses found</p>
                        <p style={{ color: "#CBD5E1", fontSize: 13, margin: "4px 0 16px" }}>Add your first expense using the + button below</p>
                        <button
                          onClick={() => setModal("add")}
                          style={{
                            padding: "9px 18px", borderRadius: 10, border: "none",
                            background: "linear-gradient(135deg, #7C5CFC, #6046E0)",
                            color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            display: "inline-flex", alignItems: "center", gap: 6,
                          }}
                        >
                          <Plus style={{ width: 14, height: 14 }} /> Add Expense
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((exp, i) => (
                      <motion.tr
                        key={exp.expenseid}
                        className="exp-row"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        style={{ borderBottom: "1px solid #F8FAFC" }}
                      >
                        {/* # */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F4F3FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7C5CFC" }}>
                            {(page - 1) * PAGE_SIZE + i + 1}
                          </div>
                        </td>

                        {/* Date */}
                        <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Calendar style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                              {exp.date ? String(exp.date).split("-").reverse().join("-") : "—"}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{
                            background: "#F4F3FF", color: "#7C5CFC",
                            border: "1px solid rgba(124,92,252,0.13)", borderRadius: 8,
                            padding: "4px 10px", fontSize: 12, fontWeight: 600,
                            display: "inline-flex", alignItems: "center", gap: 5,
                          }}>
                            <Tag style={{ width: 11, height: 11 }} />
                            {exp.category || "—"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                          <span style={{
                            background: "#D1FAE5", color: "#065F46", borderRadius: 8,
                            padding: "4px 10px", fontSize: 13, fontWeight: 700,
                            display: "inline-flex", alignItems: "center", gap: 4,
                          }}>
                            ₹{fmt(exp.amount)}
                          </span>
                        </td>

                        {/* Description */}
                        <td style={{ padding: "14px 18px", maxWidth: 240 }}>
                          <span style={{ fontSize: 14, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                            {exp.description}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 18px", textAlign: "center" }}>
                          <div className="act-btn" style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              onClick={() => setModal({ editExpense: exp })}
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
                              onClick={() => setDeleteTarget(exp)}
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
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div style={{ padding: "14px 18px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span style={{ color: "#94A3B8", fontSize: 13 }}>
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: "7px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0",
                      background: "#F8FAFC", color: page === 1 ? "#CBD5E1" : "#374151",
                      fontSize: 13, fontWeight: 600, cursor: page === 1 ? "default" : "pointer",
                      fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    <ChevronLeft style={{ width: 14, height: 14 }} /> Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{
                      width: 34, height: 34, borderRadius: 8,
                      border: `1.5px solid ${p === page ? "#7C5CFC" : "#E2E8F0"}`,
                      background: p === page ? "#7C5CFC" : "#F8FAFC",
                      color: p === page ? "#fff" : "#374151",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{p}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      padding: "7px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0",
                      background: "#F8FAFC", color: page === totalPages ? "#CBD5E1" : "#374151",
                      fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "default" : "pointer",
                      fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    Next <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── FLOATING ADD BUTTON ── */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        onClick={() => setModal("add")}
        style={{
          position: "fixed", bottom: 32, right: 32, width: 56, height: 56,
          borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 28px rgba(124,92,252,0.45)", zIndex: 1000,
        }}
        title="Add Expense"
      >
        <Plus style={{ width: 24, height: 24 }} />
      </motion.button>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {(modal === "add" || modal?.editExpense) && (
          <ExpenseModal
            key="expense-modal"
            editExpense={modal?.editExpense || null}
            categories={categories}
            onAddCategory={handleAddCategory}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteExpenseConfirm
            key="delete-modal"
            expense={deleteTarget}
            onConfirm={() => handleDelete(deleteTarget.expenseid)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}