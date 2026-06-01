import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt, Plus, Edit3, Trash2, X, Save, AlertCircle,
  Calendar, Tag, DollarSign, FileText, Settings, CheckCircle2,
  Search, ChevronDown, Activity
} from "lucide-react";
import {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory
} from "../../services/expenseService";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n === "" || n == null ? "0"
    : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EMPTY_FORM = { date: today(), category: "", amount: "", description: "" };

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
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

// ─── Category Picker (Branch-picker style) ───────────────────────────────────
function CategoryPicker({ categories, selected, onChange }) {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState("");
  const POPULAR = 6;

  const popular = categories.slice(0, POPULAR);
  const popularFiltered = popular.filter(c => c.expensecategory.toLowerCase().includes(query.toLowerCase()));
  const allFiltered = categories.filter(c => c.expensecategory.toLowerCase().includes(modalQuery.toLowerCase()));

  function pick(cat) { onChange(cat.expensecategory); setModalOpen(false); setModalQuery(""); }

  return (
    <>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Category</label>
        {selected && (
          <div style={{ background: "#F4F3FF", border: "1.5px solid #7C5CFC55", borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <CheckCircle2 style={{ width: 15, height: 15, color: "#7C5CFC", flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: "#7C5CFC", fontSize: 14 }}>{selected}</span>
            <button onClick={() => onChange("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 18, lineHeight: 1, display: "flex" }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94A3B8" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search category…"
            style={{ width: "100%", padding: "9px 12px 9px 32px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#7C5CFC"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
          {popularFiltered.map(c => (
            <button key={c.expensecategoryid} onClick={() => pick(c)} style={{
              padding: "7px 14px", borderRadius: 9,
              border: `1.5px solid ${selected === c.expensecategory ? "#7C5CFC" : "#E2E8F0"}`,
              background: selected === c.expensecategory ? "#7C5CFC" : "#F8FAFC",
              color: selected === c.expensecategory ? "#fff" : "#374151",
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
            }}>{c.expensecategory}</button>
          ))}
        </div>
        {categories.length > POPULAR && (
          <button onClick={() => setModalOpen(true)} style={{ background: "none", border: "none", color: "#7C5CFC", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "2px 0" }}>
            + More Categories
          </button>
        )}
      </div>

      {/* All categories modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(124,92,252,0.18)", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", animation: "scaleIn .18s ease" }}>
            <div style={{ padding: "18px 20px 0", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", marginBottom: 12 }}>Select Category</div>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94A3B8" }} />
                <input autoFocus value={modalQuery} onChange={e => setModalQuery(e.target.value)} placeholder="Search…"
                  style={{ width: "100%", padding: "9px 12px 9px 32px", border: "1.5px solid #E2E8F0", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ maxHeight: 280, overflowY: "auto", padding: "6px 0" }}>
              {allFiltered.map(c => (
                <button key={c.expensecategoryid} onClick={() => pick(c)} style={{
                  width: "100%", padding: "12px 20px", background: selected === c.expensecategory ? "#F4F3FF" : "transparent",
                  border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: selected === c.expensecategory ? "#7C5CFC" : "#1E293B",
                  fontWeight: selected === c.expensecategory ? 600 : 400,
                }}>
                  {selected === c.expensecategory && <CheckCircle2 style={{ width: 14, height: 14, color: "#7C5CFC", flexShrink: 0 }} />}
                  {c.expensecategory}
                </button>
              ))}
              {allFiltered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No categories found</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Add / Edit Expense Modal ────────────────────────────────────────────────
function ExpenseModal({ editExpense, categories, onClose, onSave }) {
  const [form, setForm] = useState(
    editExpense
      ? { date: editExpense.date, category: editExpense.category, amount: String(editExpense.amount), description: editExpense.description }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); }

  function validate() {
    const e = {};
    if (!form.date) e.date = "Date is required";
    if (!form.category) e.category = "Please select a category";
    if (!form.amount || isNaN(Number(form.amount))) e.amount = "Valid amount required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    onSave({ ...form, amount: Number(form.amount), id: editExpense?.expenseid });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 7000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)", overflowY: "auto" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 80px rgba(124,92,252,0.22)", fontFamily: "'DM Sans', sans-serif", margin: "auto" }}>

        {/* Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {editExpense ? <Edit3 style={{ width: 17, height: 17, color: "#7C5CFC" }} /> : <Plus style={{ width: 17, height: 17, color: "#7C5CFC" }} />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#0F172A" }}>{editExpense ? "Edit Expense" : "Add New Expense"}</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{editExpense ? "Update expense details" : "Enter expense details below"}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#F1F5F9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px" }}>
          {/* Date + Amount row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                <Calendar style={{ width: 13, height: 13, display: "inline", marginRight: 5, verticalAlign: "middle", color: "#7C5CFC" }} />Date
              </label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${errors.date ? "#EF4444" : "#E2E8F0"}`, borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                onBlur={e => e.target.style.borderColor = errors.date ? "#EF4444" : "#E2E8F0"} />
              {errors.date && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>{errors.date}</div>}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                <DollarSign style={{ width: 13, height: 13, display: "inline", marginRight: 5, verticalAlign: "middle", color: "#7C5CFC" }} />Amount (₹)
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#7C5CFC", fontWeight: 700, fontSize: 14 }}>₹</span>
                <input type="text" placeholder="0" value={form.amount ? fmt(form.amount) : ""}
                  onChange={e => set("amount", e.target.value.replace(/[^0-9]/g, ""))}
                  style={{ width: "100%", paddingLeft: 28, paddingRight: 12, paddingTop: 11, paddingBottom: 11, border: `1.5px solid ${errors.amount ? "#EF4444" : "#E2E8F0"}`, borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                  onBlur={e => e.target.style.borderColor = errors.amount ? "#EF4444" : "#E2E8F0"} />
              </div>
              {errors.amount && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>{errors.amount}</div>}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              <FileText style={{ width: 13, height: 13, display: "inline", marginRight: 5, verticalAlign: "middle", color: "#7C5CFC" }} />Description
            </label>
            <input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Enter description"
              style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${errors.description ? "#EF4444" : "#E2E8F0"}`, borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#7C5CFC"}
              onBlur={e => e.target.style.borderColor = errors.description ? "#EF4444" : "#E2E8F0"} />
            {errors.description && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>{errors.description}</div>}
          </div>

          {/* Category picker */}
          <div style={{ marginBottom: 24 }}>
            <CategoryPicker categories={categories} selected={form.category} onChange={v => set("category", v)} />
            {errors.category && <div style={{ color: "#EF4444", fontSize: 11, marginTop: 4 }}>{errors.category}</div>}
          </div>

          {/* Submit */}
          <button onClick={submit} style={{
            width: "100%", padding: 15, borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
            color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3,
            boxShadow: "0 4px 16px rgba(124,92,252,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <Save style={{ width: 16, height: 16 }} />
            {editExpense ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Category Manager Modal ──────────────────────────────────────────────────
function CategoryManagerModal({ categories, onClose, onRefresh }) {
  const [newCatName, setNewCatName] = useState("");
  const [editCatIndex, setEditCatIndex] = useState(null);
  const [deleteCatIndex, setDeleteCatIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  async function handleSave() {
    const val = newCatName.trim();
    if (!val) return;
    const dup = categories.some((c, i) => c.expensecategory?.toLowerCase() === val.toLowerCase() && i !== editCatIndex);
    if (dup) { setToast("Category already exists"); return; }
    setLoading(true);
    try {
      if (editCatIndex !== null) {
        const cat = categories[editCatIndex];
        await updateExpenseCategory(cat.expensecategoryid, { ...cat, expensecategory: val });
        setToast("Category updated");
      } else {
        await createExpenseCategory({ expensecategory: val });
        setToast("Category added");
      }
      setNewCatName(""); setEditCatIndex(null);
      await onRefresh();
    } catch { setToast("Failed to save category"); }
    finally { setLoading(false); }
  }

  async function handleDelete(index) {
    const cat = categories[index];
    setLoading(true);
    try {
      await deleteExpenseCategory(cat.expensecategoryid);
      setToast("Category deleted");
      setDeleteCatIndex(null);
      await onRefresh();
    } catch { setToast("Failed to delete"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, boxShadow: "0 24px 80px rgba(124,92,252,0.22)", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Settings style={{ width: 16, height: 16, color: "#7C5CFC" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>Manage Categories</div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{categories.length} categories</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#F1F5F9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ width: 15, height: 15, color: "#64748B" }} />
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Input row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder={editCatIndex !== null ? "Edit category name…" : "New category name…"}
              style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
              onFocus={e => e.target.style.borderColor = "#7C5CFC"}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            <button onClick={handleSave} disabled={!newCatName.trim() || loading} style={{
              padding: "11px 18px", borderRadius: 10, border: "none",
              background: !newCatName.trim() ? "#E2E8F0" : "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
              color: !newCatName.trim() ? "#94A3B8" : "#fff",
              fontWeight: 700, fontSize: 13, cursor: !newCatName.trim() ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6,
            }}>
              {editCatIndex !== null ? <><Save style={{ width: 14, height: 14 }} /> Update</> : <><Plus style={{ width: 14, height: 14 }} /> Add</>}
            </button>
            {editCatIndex !== null && (
              <button onClick={() => { setEditCatIndex(null); setNewCatName(""); }} style={{ padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                <X style={{ width: 13, height: 13 }} /> Cancel
              </button>
            )}
          </div>

          {/* Categories list */}
          {categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94A3B8", fontSize: 14 }}>No categories yet. Add one above.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {categories.filter(c => c.expensecategory?.trim()).map((cat, index) => (
                <div key={cat.expensecategoryid} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  border: `1.5px solid ${editCatIndex === index ? "#7C5CFC" : "#E2E8F0"}`,
                  background: editCatIndex === index ? "#F4F3FF" : "#F8FAFC",
                  transition: "all .15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: editCatIndex === index ? "#7C5CFC" : "#CBD5E1", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: editCatIndex === index ? "#7C5CFC" : "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.expensecategory}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { setEditCatIndex(index); setNewCatName(cat.expensecategory); }} style={{ padding: 6, borderRadius: 7, border: "1.5px solid #BFDBFE", background: "#EFF6FF", color: "#3B82F6", cursor: "pointer", display: "flex" }}>
                      <Edit3 style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={() => setDeleteCatIndex(index)} style={{ padding: 6, borderRadius: 7, border: "1.5px solid #FEE2E2", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex" }}>
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete category confirm */}
        {deleteCatIndex !== null && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: 320, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <AlertCircle style={{ width: 22, height: 22, color: "#EF4444" }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", marginBottom: 8 }}>Delete Category</div>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
                Delete <strong style={{ color: "#0F172A" }}>"{categories[deleteCatIndex]?.expensecategory}"</strong>? This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteCatIndex(null)} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                <button onClick={() => handleDelete(deleteCatIndex)} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: "#EF4444", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

// ─── Delete Expense Confirm ──────────────────────────────────────────────────
function DeleteExpenseConfirm({ expense, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 380, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.14)", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <AlertCircle style={{ width: 24, height: 24, color: "#EF4444" }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", marginBottom: 8 }}>Delete Expense</div>
        <div style={{ color: "#64748B", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Delete <strong style={{ color: "#0F172A" }}>"{expense.description}"</strong> (₹{fmt(expense.amount)})? This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#EF4444", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [modal, setModal] = useState(null);        // null | "add" | { editExpense }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const loadExpenses = useCallback(async () => {
    try {
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch { setToast("Failed to load expenses"); }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getExpenseCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setToast("Failed to load categories"); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadExpenses(), loadCategories()]).finally(() => setLoading(false));
  }, [loadExpenses, loadCategories]);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const ms = (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(search.toLowerCase());
      const mc = catFilter === "ALL" || e.category === catFilter;
      return ms && mc;
    });
  }, [expenses, search, catFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search, catFilter]);

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + Number(e.amount || 0), 0), [filtered]);

  async function handleSave(form) {
    setLoading(true);
    try {
      if (form.id) {
        await updateExpense(form.id, form);
        setToast("Expense updated");
      } else {
        await createExpense(form);
        setToast("Expense added");
      }
      setModal(null);
      await loadExpenses();
    } catch { setToast("Failed to save expense"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    setLoading(true);
    try {
      await deleteExpense(id);
      setToast("Expense deleted");
      setDeleteTarget(null);
      await loadExpenses();
    } catch { setToast("Failed to delete expense"); }
    finally { setLoading(false); }
  }

  // unique categories present in current data for filter tabs
  const catTabs = useMemo(() => {
    const seen = new Set();
    expenses.forEach(e => e.category && seen.add(e.category));
    return Array.from(seen);
  }, [expenses]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px);} to {opacity:1;transform:translateX(-50%) translateY(0);}}
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#C7BCFC;border-radius:4px;}
        .exp-row:hover td{background:#7C5CFC06 !important;}
        .act-btn{opacity:0;transition:opacity .15s;}
        .exp-row:hover .act-btn{opacity:1;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── NAV ── */}
        <div style={{ background: "#fff", borderBottom: "1px solid #EDE9FE", padding: "0 24px", display: "flex", alignItems: "center", height: 56 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#7C5CFC", letterSpacing: -0.5 }}>NextGen<span style={{ color: "#0F172A" }}>POS</span></div>
          <div style={{ marginLeft: 32, display: "flex", gap: 4 }}>
            {["Dashboard", "Expenses", "Users", "Settings"].map(nav => (
              <div key={nav} style={{ padding: "8px 16px", borderRadius: 8, background: nav === "Expenses" ? "#7C5CFC15" : "transparent", color: nav === "Expenses" ? "#7C5CFC" : "#64748B", fontSize: 13, fontWeight: nav === "Expenses" ? 700 : 500, cursor: "pointer" }}>{nav}</div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 80px" }}>

          {/* ── PAGE HEADER ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Receipt style={{ width: 22, height: 22, color: "#7C5CFC" }} />
              </div>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: 26, color: "#0F172A", letterSpacing: -0.5, margin: 0, marginBottom: 3 }}>Expense Register</h1>
                <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Track and manage your business expenses</p>
              </div>
            </div>
            <button onClick={() => setCatManagerOpen(true)} style={{
              padding: "11px 18px", borderRadius: 12, border: "1.5px solid #EDE9FE",
              background: "#fff", color: "#7C5CFC", fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <Settings style={{ width: 15, height: 15 }} /> Manage Categories
            </button>
          </div>

          {/* ── STATS ── */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Expenses", value: expenses.length, color: "#7C5CFC", bg: "#F4F3FF", Icon: Receipt },
              { label: "Filtered Total", value: `₹${fmt(totalAmount)}`, color: "#10B981", bg: "#F0FDF4", Icon: DollarSign },
              { label: "Categories", value: categories.length, color: "#0EA5E9", bg: "#F0F9FF", Icon: Tag },
              { label: "This View", value: filtered.length, color: "#F59E0B", bg: "#FFFBEB", Icon: Activity },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "8px 16px", border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", gap: 10 }}>
                <s.Icon style={{ width: 15, height: 15, color: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── FILTERS ── */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", marginBottom: 14, border: "1px solid #EDE9FE", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#94A3B8" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses or categories…"
                style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["ALL", ...catTabs].map(t => (
                <button key={t} onClick={() => setCatFilter(t)} style={{
                  padding: "8px 14px", borderRadius: 9,
                  border: `1.5px solid ${catFilter === t ? "#7C5CFC" : "#E2E8F0"}`,
                  background: catFilter === t ? "#7C5CFC" : "#F8FAFC",
                  color: catFilter === t ? "#fff" : "#374151",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{t === "ALL" ? "All Categories" : t}</button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#94A3B8" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
          </div>

          {/* ── TABLE ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FE", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#FAFAFF" }}>
                    {["#", "Date", "Category", "Amount", "Description", "Actions"].map((col, i) => (
                      <th key={col} style={{ padding: "13px 18px", textAlign: i === 5 ? "center" : "left", fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5, borderBottom: "1px solid #F1F5F9", whiteSpace: "nowrap" }}>
                        {col.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Loading expenses...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "64px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
                        <p style={{ color: "#94A3B8", fontSize: 14, margin: 0, fontWeight: 500 }}>No expenses found</p>
                        <p style={{ color: "#CBD5E1", fontSize: 13, margin: "4px 0 0" }}>Add your first expense using the + button below</p>
                      </td>
                    </tr>
                  ) : paginated.map((exp, i) => (
                    <tr key={exp.expenseid} className="exp-row" style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F4F3FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7C5CFC" }}>
                          {(page - 1) * PAGE_SIZE + i + 1}
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Calendar style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                            {exp.date ? String(exp.date).split("-").reverse().join("-") : "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ background: "#F4F3FF", color: "#7C5CFC", border: "1px solid #7C5CFC22", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <Tag style={{ width: 11, height: 11 }} />
                          {exp.category || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                        <span style={{ background: "#D1FAE5", color: "#065F46", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          ₹{fmt(exp.amount)}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", maxWidth: 240 }}>
                        <span style={{ fontSize: 14, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{exp.description}</span>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "center" }}>
                        <div className="act-btn" style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => setModal({ editExpense: exp })} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                            <Edit3 style={{ width: 13, height: 13 }} /> Edit
                          </button>
                          <button onClick={() => setDeleteTarget(exp)} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #FEE2E2", background: "#FEF2F2", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                            <Trash2 style={{ width: 13, height: 13 }} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: "14px 18px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ color: "#94A3B8", fontSize: 13 }}>
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: page === 1 ? "#CBD5E1" : "#374151", fontSize: 13, fontWeight: 600, cursor: page === 1 ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${p === page ? "#7C5CFC" : "#E2E8F0"}`, background: p === page ? "#7C5CFC" : "#F8FAFC", color: p === page ? "#fff" : "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: page === totalPages ? "#CBD5E1" : "#374151", fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next →</button>
                </div>
              </div>
            )}
          </div>
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
            editExpense={modal?.editExpense || null}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {catManagerOpen && (
          <CategoryManagerModal
            categories={categories}
            onClose={() => setCatManagerOpen(false)}
            onRefresh={loadCategories}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteExpenseConfirm
            expense={deleteTarget}
            onConfirm={() => handleDelete(deleteTarget.expenseid)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}