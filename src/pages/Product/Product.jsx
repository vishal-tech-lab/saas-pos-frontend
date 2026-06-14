import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Search, Edit3, Trash2, X, CheckCircle2,
  AlertCircle, Tag, Hash, Soup, ChefHat, Drumstick, Coffee,
  Leaf, Filter, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
} from "../../services/Productservice";

// ─── CATEGORY STYLE MAP ───────────────────────────────────────────────────────

const CAT_STYLE = {
  BRIYANI:      { icon: Soup,      iconColor: "text-orange-500", badgeBg: "bg-orange-50",  badgeBorder: "border-orange-200",  badgeText: "text-orange-700"  },
  "FRIED RICE": { icon: ChefHat,   iconColor: "text-lime-600",   badgeBg: "bg-lime-50",    badgeBorder: "border-lime-200",    badgeText: "text-lime-700"    },
  CHICKEN:      { icon: Drumstick, iconColor: "text-yellow-600", badgeBg: "bg-yellow-50",  badgeBorder: "border-yellow-200",  badgeText: "text-yellow-700"  },
  DRINKS:       { icon: Coffee,    iconColor: "text-sky-500",    badgeBg: "bg-sky-50",     badgeBorder: "border-sky-200",     badgeText: "text-sky-700"     },
};
const DEFAULT_CAT = {
  icon: Tag,
  iconColor: "text-purple-500",
  badgeBg: "bg-purple-50",
  badgeBorder: "border-purple-200",
  badgeText: "text-purple-700",
};
function getCatStyle(cat) {
  return CAT_STYLE[(cat || "").toUpperCase()] ?? DEFAULT_CAT;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 10, x: "-50%" }}
          className={`fixed bottom-6 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-500"
          }`}
        >
          {toast.type === "success"
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── CATEGORY PICKER ─────────────────────────────────────────────────────────

function CategoryPicker({ categories, selected, onChange, onAddCategory }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch]       = useState("");
  const [newCat, setNewCat]       = useState("");
  const [addMode, setAddMode]     = useState(false);
  const [saving, setSaving]       = useState(false);

  const popular = categories.slice(0, 6);
  const popularFiltered = popular.filter(c =>
    c.itemcategoryname.toLowerCase().startsWith(search.toLowerCase())
  );
  const allFiltered = categories.filter(c =>
    c.itemcategoryname.toLowerCase().startsWith(search.toLowerCase())
  );
  const selectedCat = categories.find(c => c.itemcategoryname === selected);

  const pick = (cat) => { onChange(cat.itemcategoryname); setModalOpen(false); setSearch(""); };

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    setSaving(true);
    try {
      const created = await onAddCategory(newCat.trim());
      onChange(created.itemcategoryname);
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
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Category
        </label>

        {selectedCat && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 mb-2">
            {(() => { const s = getCatStyle(selectedCat.itemcategoryname); const I = s.icon; return <I className={`w-4 h-4 ${s.iconColor}`} />; })()}
            <span className="text-sm font-semibold text-purple-700">{selectedCat.itemcategoryname}</span>
            <button onClick={() => onChange("")} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-2">
          {popularFiltered.map(c => {
            const s = getCatStyle(c.itemcategoryname);
            const I = s.icon;
            const isSelected = selected === c.itemcategoryname;
            return (
              <button key={c.itemcategoryid} type="button" onClick={() => pick(c)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#7C5CFC] border-[#7C5CFC] text-white"
                    : `${s.badgeBg} ${s.badgeBorder} ${s.badgeText} hover:border-purple-400`
                }`}>
                <I className="w-3 h-3" />{c.itemcategoryname}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => setModalOpen(true)}
          className="text-xs font-semibold text-[#7C5CFC] hover:text-purple-800 transition-colors flex items-center gap-1">
          <Plus className="w-3 h-3" /> More / Add Category
        </button>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-[#F4F3FF] flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Select Category</h3>
                <button onClick={() => setModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search category…"
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all" />
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 rounded-xl border border-gray-100 mb-3">
                  {allFiltered.map(c => {
                    const s = getCatStyle(c.itemcategoryname);
                    const I = s.icon;
                    return (
                      <button key={c.itemcategoryid} type="button" onClick={() => pick(c)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors ${selected === c.itemcategoryname ? "bg-purple-50" : ""}`}>
                        <I className={`w-4 h-4 ${s.iconColor}`} />
                        <span className={`font-medium ${selected === c.itemcategoryname ? "text-[#7C5CFC]" : "text-gray-700"}`}>{c.itemcategoryname}</span>
                        {selected === c.itemcategoryname && <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5CFC] ml-auto" />}
                      </button>
                    );
                  })}
                  {allFiltered.length === 0 && (
                    <div className="py-6 text-center text-sm text-gray-400">No categories found</div>
                  )}
                </div>
                {!addMode
                  ? <button type="button" onClick={() => setAddMode(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-purple-300 text-[#7C5CFC] text-xs font-semibold hover:bg-purple-50 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add New Category
                    </button>
                  : <div className="flex gap-2">
                      <input autoFocus value={newCat} onChange={e => setNewCat(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAdd()}
                        placeholder="Category name…"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all" />
                      <button type="button" onClick={handleAdd} disabled={saving}
                        className="px-3 py-2 bg-[#7C5CFC] hover:bg-[#6046E0] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60">
                        {saving ? "..." : "Save"}
                      </button>
                      <button type="button" onClick={() => { setAddMode(false); setNewCat(""); }}
                        className="px-3 py-2 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:border-gray-300 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────

function DeleteConfirm({ product, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white border border-gray-200 shadow-2xl p-6"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Product</h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">{product.itemname}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all bg-white">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-md shadow-red-100">
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PRODUCT MODAL (Add / Edit) ───────────────────────────────────────────────

const EMPTY_FORM = () => ({
  itemname: "",
  price: "",
  category: ""
});
function ProductModal({ editProduct, categories, onAddCategory, onClose, onSave }) {
 const [form, setForm] = useState(
  editProduct
    ? {
        itemname: editProduct.itemname,
        price: String(editProduct.price ?? ""),
        category: editProduct.category ?? ""
      }
    : EMPTY_FORM()
);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.itemname.trim()) e.itemname = true;
    if (!form.category)        e.category = true;
    setErrors(e);
    return !Object.keys(e).length;
  };
useEffect(() => {

  if (!editProduct) {

    setForm(
      EMPTY_FORM()
    );

  }

}, [done]);
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: Number(form.price) || 0
      });

      setDone(true);
      setForm(EMPTY_FORM());
      setErrors({});

      setTimeout(() => {
        setDone(false);
      }, 1000);
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[7000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EDE9FE] bg-[#F4F3FF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#7C5CFC] flex items-center justify-center shadow-sm">
              {editProduct ? <Edit3 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{editProduct ? "Edit Product" : "Add New Product"}</h2>
              <p className="text-xs text-gray-500">{editProduct ? "Update product details" : "Fill in the product details"}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Item Name {errors.itemname && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.itemname}
                onChange={e => set("itemname", e.target.value)}
                placeholder="e.g. Chicken Briyani"
                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all ${
                  errors.itemname ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
                }`}
              />
            </div>
            {errors.itemname && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Item name is required
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Price (₹)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="e.g. 160"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all bg-white"
              />
            </div>
          </div>

          {/* Category */}
          <div className={errors.category ? "p-3 rounded-xl border border-red-200 bg-red-50" : ""}>
            <CategoryPicker
              categories={categories}
              selected={form.category}
              onChange={v => set("category", v)}
              onAddCategory={onAddCategory}
            />
            {errors.category && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Please select a category
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all bg-white">
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all ${
                done
                  ? "bg-emerald-500 shadow-emerald-100"
                  : "bg-[#7C5CFC] hover:bg-[#6046E0] disabled:bg-purple-400 shadow-purple-200"
              }`}
            >
              <AnimatePresence mode="wait">
                {done
                  ? <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Saved!
                    </motion.span>
                  : saving
                    ? <motion.span key="spin" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving…
                      </motion.span>
                    : <motion.span key="save" className="flex items-center gap-2">
                        {editProduct
                          ? <><Edit3 className="w-4 h-4" /> Update Product</>
                          : <><Plus className="w-4 h-4" /> Add Product</>
                        }
                      </motion.span>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── CATEGORY BADGE (for table) ───────────────────────────────────────────────

function CategoryBadge({ category }) {
  const s = getCatStyle(category);
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${s.badgeBg} ${s.badgeBorder} ${s.badgeText}`}>
      <Icon className="w-3 h-3" />
      {category}
    </span>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function Product() {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState("All");
  const [modal, setModal]             = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]             = useState({ show: false, message: "", type: "" });
  const [page, setPage]               = useState(1);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e) {
      console.log(e);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      const prods = await getProducts();
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {
      console.log(e);
      showToast("Failed to refresh products", "error");
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search, catFilter]);

  const handleSave = async (form) => {
    if (modal?.itemid) {
      await updateProduct(modal.itemid, form);
      showToast("Product updated successfully");
    } else {
      await createProduct(form);
      showToast("Product added successfully");
    }
    await refreshProducts();
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget.itemid);
      showToast("Product deleted");
      setDeleteTarget(null);
      await refreshProducts();
    } catch (e) {
      showToast("Failed to delete", "error");
    }
  };

  const handleAddCategory = async (name) => {
    const created = await createCategory({ itemcategoryname: name });
    setCategories(prev => [...prev, created]);
    return created;
  };

  const allCats = useMemo(() =>
    ["All", ...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() =>
    products.filter(p => {
      const matchSearch =
        (p.itemname || "").toLowerCase().startsWith(search.toLowerCase()) ||
        (p.category || "").toLowerCase().startsWith(search.toLowerCase());
      const matchCat = catFilter === "All" || p.category === catFilter;
      return matchSearch && matchCat;
    }),
    [products, search, catFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgPrice = products.length
    ? (products.reduce((s, p) => s + (p.price || 0), 0) / products.length).toFixed(0)
    : "0";

  const STATS = [
    { label: "Total Products", value: products.length,      color: "#7C5CFC", bg: "#F4F3FF", border: "rgba(124,92,252,.2)" },
    { label: "Categories",     value: categories.length,    color: "#0EA5E9", bg: "#F0F9FF", border: "rgba(14,165,233,.2)"  },
    { label: "Showing",        value: filtered.length,      color: "#10B981", bg: "#F0FDF4", border: "rgba(16,185,129,.2)"  },
    { label: "Avg. Price",     value: `₹${avgPrice}`,       color: "#F59E0B", bg: "#FFFBEB", border: "rgba(245,158,11,.2)"  },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3FF]">
      <div className="flex items-center gap-3 text-gray-500">
        <RefreshCw className="w-5 h-5 text-[#7C5CFC] animate-spin" />
        <span className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading products…</span>
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
          {["Dashboard", "Orders", "Users", "Products", "Settings"].map(nav => (
            <div key={nav}
              className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                nav === "Products"
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
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
              Products
            </h1>
            <p className="text-sm text-slate-500">Manage your menu items and pricing</p>
          </div>
          <motion.button
            onClick={() => setModal("add")}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)", boxShadow: "0 4px 16px rgba(124,92,252,.35)" }}
          >
            <Plus className="w-4 h-4" /> Add Product
          </motion.button>
        </motion.div>

        {/* ── STATS ── */}
        <div className="flex gap-2 flex-wrap">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl border"
              style={{ background: s.bg, borderColor: s.border }}
            >
              <span className="text-base font-extrabold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-slate-500 font-medium">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="bg-white rounded-2xl border border-[#EDE9FE] px-5 py-4 flex gap-3 flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>
          {/* Category filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {allCats.map(cat => {
              const isActive = catFilter === cat;
              const s = cat === "All" ? null : getCatStyle(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#7C5CFC] border-[#7C5CFC] text-white"
                      : cat === "All"
                        ? "bg-white border-gray-200 text-gray-600 hover:border-[#7C5CFC] hover:text-[#7C5CFC]"
                        : `${s.badgeBg} ${s.badgeBorder} ${s.badgeText} hover:border-purple-400`
                  }`}
                >
                  {cat !== "All" && (() => { const I = getCatStyle(cat).icon; return <I className="w-3 h-3" />; })()}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TABLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-[#EDE9FE] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 560 }}>
              <thead>
                <tr className="bg-[#FAFAFF] border-b border-[#EDE9FE]">
                  {["ID", "Product Name", "Category", "Price", "Actions"].map((col, i) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                      style={{ textAlign: i === 4 ? "center" : "left" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">No products found</p>
                          <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filters</p>
                        </div>
                        <button
                          onClick={() => setModal("add")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold mt-1"
                          style={{ background: "linear-gradient(135deg,#7C5CFC,#6046E0)" }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Product
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((p, idx) => (
                    <motion.tr
                      key={p.itemid}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-50 hover:bg-[#7C5CFC]/[0.03] transition-colors group"
                    >
                      {/* ID */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F4F3FF] text-[#7C5CFC] text-xs font-bold border border-purple-100">
                          {p.itemid}
                        </span>
                      </td>

                      {/* Product Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const s = getCatStyle(p.category);
                            const Icon = s.icon;
                            return (
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${s.badgeBg} ${s.badgeBorder}`}>
                                <Icon className={`w-4 h-4 ${s.iconColor}`} />
                              </div>
                            );
                          })()}
                          <span className="text-sm font-semibold text-gray-900">{p.itemname}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <CategoryBadge category={p.category} />
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-extrabold text-[#7C5CFC]">
                          ₹{(p.price || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setModal(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-gray-600 text-xs font-semibold hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] text-red-500 text-xs font-semibold hover:bg-red-50 hover:border-red-300 transition-all"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
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
            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-slate-400 font-medium">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-500 hover:text-gray-800 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                      p === page
                        ? "bg-[#7C5CFC] border-[#7C5CFC] text-white"
                        : "bg-white border-gray-200 text-gray-500 hover:border-[#7C5CFC] hover:text-[#7C5CFC]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-500 hover:text-gray-800 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {(modal === "add" || (modal && modal !== "add")) && (
          <ProductModal
            key="product-modal"
            editProduct={modal !== "add" ? modal : null}
            categories={categories}
            onAddCategory={handleAddCategory}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            key="delete-modal"
            product={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} />
    </div>
  );
}