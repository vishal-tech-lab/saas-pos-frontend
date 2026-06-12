import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../../services/Productservice";
import { createSale, closeRegister as closeRegisterAPI, getSalesReport } from "../../services/SalesService";
import { updateCustomerDisplay, clearCustomerDisplay } from "../../services/customerDisplayService";
import CloseregisterModal from "../dailysales/CloseregisterModal";
import BillPreviewModal from "../../components/bill/BillPreviewModal";
import BillLayout from "../../components/bill/BillLayout";

/* ── CATEGORY COLOR MAP ──────────────────────────────────────────────── */
const CAT_STYLES = {
  all:        { bg: "#7C5CFC", color: "#FFFFFF" },
  briyani:    { bg: "#FEE2E2", color: "#DC2626" },
  combo:      { bg: "#FEF3C7", color: "#D97706" },
  dinner:     { bg: "#EDE9FF", color: "#7C5CFC" },
  egg:        { bg: "#F0FDF4", color: "#16A34A" },
  friedrice:  { bg: "#FFF7ED", color: "#EA580C" },
  meals:      { bg: "#EFF6FF", color: "#2563EB" },
  morning:    { bg: "#FEF3C7", color: "#D97706" },
  nonstarter: { bg: "#FEE2E2", color: "#DC2626" },
  noodles:    { bg: "#F0FDF4", color: "#16A34A" },
  parotta:    { bg: "#EDE9FF", color: "#7C5CFC" },
  sambar:     { bg: "#FFF7ED", color: "#EA580C" },
  shawarma:   { bg: "#EFF6FF", color: "#2563EB" },
  tandoori:   { bg: "#FEE2E2", color: "#DC2626" },
  drinks:     { bg: "#EFF6FF", color: "#2563EB" },
};

const fmt = (n) => `₹ ${Number(n).toFixed(2)}`;
const genBillNo = () => "BILL-" + Date.now();

export default function Sales() {
  /* ── STATE ──────────────────────────────────────────────────────────── */
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems,      setMenuItems]       = useState([]);
  const [categories,     setCategories]      = useState([{ id: "all", label: "All Items" }]);
  const [cart,           setCart]            = useState([]);
  const [selectedCartId, setSelectedCartId]  = useState(null);
  const [qtyInput,       setQtyInput]        = useState("");
  const [search,         setSearch]          = useState("");
  const [activeKey,      setActiveKey]       = useState(null);
  const [time,           setTime]            = useState(new Date());
  const [visibleCount,   setVisibleCount]    = useState(15);
  const [payMode,        setPayMode]         = useState("cash");
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [billData,       setBillData]        = useState(null);
  const [draftBillNo,    setDraftBillNo]     = useState("");
  const [showCloseModal, setShowCloseModal]  = useState(false);
  const [loading,        setLoading]         = useState(true);
  const [submitting,     setSubmitting]      = useState(false);

  const branchId = localStorage.getItem("branchid") || localStorage.getItem("branchId");

  /* ── EFFECTS ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  /* ── DATA FETCHING ──────────────────────────────────────────────────── */
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const [products, cats] = await Promise.all([getProducts(), getCategories()]);
      setMenuItems(products);
      const uniqueCats = [{ id: "all", label: "All Items" }];
      if (Array.isArray(cats)) {
        cats.forEach((cat) => {
          uniqueCats.push({
            id:    cat.itemcategoryname.toLowerCase().replace(/\s+/g, ""),
            label: cat.itemcategoryname,
          });
        });
      }
      setCategories(uniqueCats);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── FILTER ─────────────────────────────────────────────────────────── */
  const allFiltered = menuItems.filter((item) => {
    const itemCat  = (item.category || item.itemcategoryname || "").toLowerCase().replace(/\s+/g, "");
    const matchCat = activeCategory === "all" || itemCat === activeCategory;
    const matchSrc = (item.itemname || item.productname || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchCat && matchSrc;
  });
  const filtered = allFiltered.slice(0, visibleCount);

  /* ── CART HELPERS ───────────────────────────────────────────────────── */
  const addToCart = (item) => {
    const pid    = item.id || item.itemid;
    const pname  = item.itemname || item.productname;
    const pprice = item.price;
    const billNo = draftBillNo || genBillNo();
    if (!draftBillNo) setDraftBillNo(billNo);

    setCart((prev) => {
      const ex   = prev.find((c) => c.itemid === pid);
      const next = ex
        ? prev.map((c) => c.itemid === pid ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { itemid: pid, itemname: pname, price: pprice, qty: 1 }];
      pushToCustomerDisplay(next, billNo);
      return next;
    });
    setSelectedCartId(pid);
    setQtyInput("");
  };

  const selectCartItem = (id) => {
    setSelectedCartId(id);
    setQtyInput("");
  };

  const setQty = (id, qty) => {
    const next = cart.map((c) => c.itemid === id ? { ...c, qty: Math.max(1, qty) } : c);
    setCart(next);
    pushToCustomerDisplay(next, draftBillNo);
  };

  const updateQty = (id, delta) => {
    const next = cart.map((c) => c.itemid === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c);
    setCart(next);
    pushToCustomerDisplay(next, draftBillNo);
  };

  const removeItem = (id) => {
    const next = cart.filter((c) => c.itemid !== id);
    setCart(next);
    if (selectedCartId === id) {
      setSelectedCartId(next.length > 0 ? next[0].itemid : null);
    }
    setQtyInput("");
    pushToCustomerDisplay(next, draftBillNo);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCartId(null);
    setQtyInput("");
    setDraftBillNo("");
    if (branchId) {
      updateCustomerDisplay({
        branchid: branchId,
        billno:   null,
        total:    0,
        status:   "WAITING",
        items:    [],
      });
    }
  };

  /* ── NUMPAD ─────────────────────────────────────────────────────────── */
  const handleKey = (k) => {
    setActiveKey(k);
    setTimeout(() => setActiveKey(null), 150);
    if (!selectedCartId) return;

    if (k === "⌫") {
      const next = qtyInput.slice(0, -1);
      setQtyInput(next);
      if (next !== "") setQty(selectedCartId, parseInt(next, 10));
      return;
    }
    if (/^\d$/.test(k)) {
      const next = qtyInput + k;
      const num  = parseInt(next, 10);
      if (num >= 1 && num <= 999) {
        setQtyInput(next);
        setQty(selectedCartId, num);
      }
      return;
    }
    // Qty / % / Price / +/- → reserved for future use
  };

  /* ── TOTALS ─────────────────────────────────────────────────────────── */
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = 0;
  const total    = subtotal - discount;

  /* ── CUSTOMER DISPLAY PUSH ──────────────────────────────────────────── */
  const pushToCustomerDisplay = async (cartItems, billNo) => {
    if (!branchId) return;
    if (cartItems.length === 0) {
      await updateCustomerDisplay({ branchid: branchId, billno: null, total: 0, status: "WAITING", items: [] });
      return;
    }
    const grandTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    await updateCustomerDisplay({
      branchid: branchId,
      billno:   billNo,
      total:    grandTotal,
      status:   "ACTIVE",
      items:    cartItems.map((item) => ({
        itemname: item.itemname,
        qty:      item.qty,
        price:    item.price,
        total:    item.price * item.qty,
      })),
    });
  };

  /* ── CONFIRM ORDER ──────────────────────────────────────────────────── */
  const handleConfirmOrder = async () => {
    if (cart.length === 0) { alert("Cart is empty"); return; }
    setSubmitting(true);
    try {
      const branchName = localStorage.getItem("currentBranch");
      if (!branchName) { alert("Branch not found"); return; }

      const billNo = draftBillNo || genBillNo();
      if (!draftBillNo) setDraftBillNo(billNo);

      for (const item of cart) {
        await createSale({
          branchname:    branchName,
          productname:   item.itemname,
          qty:           item.qty,
          paymentmethod: payMode,
          billno:        billNo,
        });
      }

      await clearCustomerDisplay(branchId);
      setBillData({ billNo, items: cart, total, paymentMethod: payMode, branchName });
      setShowBillPreview(true);
    } catch (err) {
      console.error("Error confirming order:", err);
      alert("Failed to confirm order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── CLOSE REGISTER ─────────────────────────────────────────────────── */
  const handleCloseRegister = async () => {
    try {
      const bid = localStorage.getItem("branchId");
      if (!bid) { alert("Branch not selected"); return; }
      await closeRegisterAPI(bid);
      alert("Register closed successfully");
      setShowCloseModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to close register");
    }
  };

  /* ── TIME STRING ────────────────────────────────────────────────────── */
  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  /* ── NUMPAD KEY CONFIG ──────────────────────────────────────────────── */
  const numpadKeys = ["1","2","3","Qty","4","5","6","%","7","8","9","Price","+/-","0",".","⌫"];

  /* ── LOADING STATE ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ ...S.root, alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#7C5CFC", fontSize: 15, fontWeight: 600 }}>Loading menu…</div>
      </div>
    );
  }

  /* ── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <div style={S.root}>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════ */}
      <header style={S.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={S.logoBox}>⚡</div>
          <span style={S.logoText}>NextGenPOS</span>
          <div style={S.onlineDot} />
        </div>

        <div style={S.searchBox}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(15); }}
            placeholder="Search product… (e.g. noodles, தக்காளி)"
            style={S.searchInput}
          />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12.5, opacity: 0.75 }}>#BL-2481</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{timeStr}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}>R</div>
            <span style={{ fontSize: 13 }}>Ravi</span>
          </div>
          <button
            onClick={() => setShowCloseModal(true)}
            style={S.closeBtn}
          >
            🔒 Close Register
          </button>
        </div>
      </header>

      {/* ══ MAIN BODY ═══════════════════════════════════════════════════ */}
      <div style={S.main}>

        {/* ── LEFT PANEL ────────────────────────────────────────────── */}
        <aside style={S.left}>

          {/* Order header */}
          <div style={S.orderHeader}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1A1A2E" }}>Current Order</span>
              <span style={S.badge}>{cart.length} Items</span>
            </div>
            <button onClick={clearCart} style={S.clearBtn}>
              🗑️ Clear
            </button>
          </div>

          {/* Cart items — scrollable */}
          <div style={S.cartScroll}>
            {cart.length === 0 && (
              <div style={S.emptyCart}>No items yet</div>
            )}
            {cart.map((item) => {
              const isSel = item.itemid === selectedCartId;
              return (
                <div
                  key={item.itemid}
                  onClick={() => selectCartItem(item.itemid)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: isSel ? "#EDE9FF" : "transparent",
                    borderRadius: 8,
                    borderBottom: isSel ? "none" : "1px solid #F3F2F7",
                    marginBottom: 2,
                    cursor: "pointer",
                    padding: "6px 6px",
                  }}
                >
                  <span style={{
                    flex: 1, minWidth: 0,
                    fontWeight: isSel ? 700 : 600,
                    fontSize: 12.5,
                    color: isSel ? "#7C5CFC" : "#1A1A2E",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {item.itemname}
                  </span>

                  <button
                    style={{ ...S.qtyBtn, background: isSel ? "#fff" : "#F9FAFB" }}
                    onClick={(e) => { e.stopPropagation(); updateQty(item.itemid, -1); selectCartItem(item.itemid); }}
                  >−</button>

                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    minWidth: 18, textAlign: "center",
                    color: isSel ? "#7C5CFC" : "#1A1A2E",
                  }}>
                    {item.qty}
                  </span>

                  <button
                    style={{ ...S.qtyBtn, background: isSel ? "#fff" : "#F9FAFB" }}
                    onClick={(e) => { e.stopPropagation(); updateQty(item.itemid, 1); selectCartItem(item.itemid); }}
                  >+</button>

                  <span style={{
                    fontSize: 12.5, fontWeight: 600,
                    minWidth: 60, textAlign: "right",
                    color: "#1A1A2E",
                  }}>
                    {fmt(item.price * item.qty)}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.itemid); }}
                    style={{ background: "none", border: "none", color: "#E63973", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
                  >✕</button>
                </div>
              );
            })}
          </div>

          {/* ── BOTTOM: totals + numpad + payment — always visible ── */}
          <div style={{ flexShrink: 0, background: "#fff" }}>

            {/* Totals row */}
            <div style={{ padding: "7px 18px 6px", background: "#FAFAFA", borderTop: "1px solid #F0EEF8", borderBottom: "1px solid #F0EEF8" }}>
              {discount > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                    <span style={{ color: "#6B7280" }}>Subtotal</span>
                    <span style={{ color: "#6B7280" }}>{fmt(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ color: "#6B7280" }}>Discount</span>
                    <span style={{ color: "#E63973" }}>− {fmt(discount)}</span>
                  </div>
                </>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}>
                <span style={{ color: "#1A1A2E" }}>Total</span>
                <span style={{ color: "#7C5CFC" }}>{fmt(total)}</span>
              </div>
            </div>

            {/* Numpad */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4,1fr)",
              gap: 3, padding: "6px 10px 4px",
            }}>
              {numpadKeys.map((k) => {
                const isSpecial   = k === "Qty" || k === "%" || k === "Price";
                const isDelete    = k === "⌫";
                const isPlusMinus = k === "+/-";
                const pressed     = activeKey === k;
                let bg    = "#FFFFFF", color = "#1A1A2E", fw = 500;
                if (pressed)         { bg = "#7C5CFC"; color = "#fff"; }
                else if (isSpecial)  { bg = "#EDE9FF"; color = "#7C5CFC"; fw = 600; }
                else if (isDelete)   { bg = "#FEE2E2"; color = "#E63973"; }
                else if (isPlusMinus){ bg = "#FEF3C7"; color = "#92400E"; }
                return (
                  <button
                    key={k}
                    onClick={() => handleKey(k)}
                    style={{
                      padding: "6px 4px", borderRadius: 6, border: "none",
                      fontSize: isSpecial ? 11 : 13, fontWeight: fw,
                      cursor: "pointer", background: bg, color,
                      fontFamily: "inherit",
                      transition: "background 0.1s",
                    }}
                  >
                    {k}
                  </button>
                );
              })}
            </div>

            {/* Payment mode + confirm */}
            <div style={{ padding: "4px 10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Payment Mode
              </div>
              <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
                {[
                  { key: "cash", label: "Cash", icon: "💵" },
                  { key: "upi",  label: "UPI",  icon: "📱" },
                  { key: "card", label: "Card", icon: "💳" },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setPayMode(key)}
                    style={{
                      flex: 1, padding: "5px 0", borderRadius: 7,
                      border: payMode === key ? "2px solid #7C5CFC" : "1.5px solid #E5E3EE",
                      background: payMode === key ? "#EDE9FF" : "#fff",
                      color: payMode === key ? "#7C5CFC" : "#374151",
                      fontWeight: payMode === key ? 700 : 500,
                      fontSize: 11.5, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                      fontFamily: "inherit",
                      transition: "all 0.1s",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={submitting || cart.length === 0}
                style={{
                  width: "100%",
                  background: (submitting || cart.length === 0) ? "#C4B5FD" : "#7C5CFC",
                  color: "#fff",
                  border: "none", borderRadius: 9,
                  padding: "9px 0",
                  fontSize: 13, fontWeight: 700,
                  cursor: (submitting || cart.length === 0) ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                {submitting ? "🔄 Confirming…" : "✅ Confirm Order"}
              </button>
            </div>

          </div>{/* end bottom fixed */}
        </aside>

        {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
        <div style={S.right}>

          {/* Category pills */}
          <div style={S.catBar}>
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              const cs     = CAT_STYLES[cat.id] || { bg: "#F3F2F7", color: "#374151" };
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setVisibleCount(15); }}
                  style={{
                    padding: "5px 14px", borderRadius: 20,
                    border: active ? "none" : "1px solid #E5E3EE",
                    background: active ? cs.bg : "#fff",
                    color: active ? (cat.id === "all" ? "#fff" : cs.color) : cs.color,
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer", whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "all 0.12s",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Menu grid */}
          <div style={S.menuGrid}>
            <div style={S.menuInner}>
              {filtered.map((item) => {
                const pid    = item.id || item.itemid;
                const pname  = item.itemname || item.productname;
                const pprice = item.price;
                const inCart = cart.find((c) => c.itemid === pid);
                return (
                  <button
                    key={pid}
                    onClick={() => addToCart(item)}
                    style={{
                      background: "#fff",
                      border: inCart ? "1.5px solid #7C5CFC" : "1px solid #E5E3EE",
                      borderRadius: 10,
                      padding: "14px 8px 12px",
                      cursor: "pointer",
                      textAlign: "center",
                      position: "relative",
                      fontFamily: "inherit",
                      transition: "border-color 0.12s, box-shadow 0.12s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(124,92,252,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {inCart && (
                      <span style={{
                        position: "absolute", top: -7, right: -7,
                        background: "#7C5CFC", color: "#fff",
                        width: 20, height: 20, borderRadius: "50%",
                        fontSize: 10.5, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {inCart.qty}
                      </span>
                    )}
                    <div style={{
                      fontWeight: 700, fontSize: 11.5, color: "#1A1A2E",
                      lineHeight: 1.35, minHeight: 28,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexDirection: "column",
                    }}>
                      <span>{pname}</span>
                      <span style={{ color: "#7C5CFC", fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                        {fmt(pprice)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {allFiltered.length > visibleCount && (
              <div style={{ textAlign: "center", marginTop: 18 }}>
                <button
                  onClick={() => setVisibleCount((v) => v + 10)}
                  style={{
                    background: "#fff", border: "1px solid #E5E3EE",
                    borderRadius: 8, padding: "9px 36px",
                    fontSize: 13, color: "#374151", fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  Load More ↓
                </button>
              </div>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: "#9CA3AF", marginTop: 48, fontSize: 14 }}>
                No items found for "{search}"
              </div>
            )}
          </div>

        </div>{/* end right */}
      </div>{/* end main */}

      {/* ══ CLOSE REGISTER MODAL ════════════════════════════════════════ */}
      {showCloseModal && (
        <CloseregisterModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleCloseRegister}
        />
      )}

      {/* ══ BILL PREVIEW MODAL ══════════════════════════════════════════ */}
      {showBillPreview && billData && (
        <BillPreviewModal
          isOpen={showBillPreview}
          onClose={() => {
            setShowBillPreview(false);
            clearCart();
          }}
        >
          <BillLayout
            billNo={billData.billNo}
            paymentMethod={billData.paymentMethod}
            cartItems={billData.items}
            subtotal={billData.total}
            total={billData.total}
          />
        </BillPreviewModal>
      )}

    </div>
  );
}

/* ══ STYLES OBJECT ════════════════════════════════════════════════════════
   All exact colors from the original design spec.
   Responsive grid via CSS-in-JS media helpers below.
══════════════════════════════════════════════════════════════════════════ */
const S = {
  root: {
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    background: "#F3F2F7",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontSize: 13,
  },

  /* NAV */
  nav: {
    background: "#4B3FA7",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 20px",
    height: 52,
    flexShrink: 0,
  },
  logoBox: {
    width: 32, height: 32, borderRadius: 8,
    background: "rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16,
  },
  logoText: { fontWeight: 700, fontSize: 16, color: "#fff" },
  onlineDot: { width: 8, height: 8, borderRadius: "50%", background: "#22C55E" },
  searchBox: {
    flex: 1, maxWidth: 520,
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    display: "flex", alignItems: "center", gap: 8,
    padding: "0 12px", height: 34,
  },
  searchInput: {
    border: "none", background: "transparent",
    color: "#fff", outline: "none",
    fontSize: 13, flex: 1,
  },
  closeBtn: {
    background: "#E63973", color: "#fff",
    border: "none", borderRadius: 7,
    padding: "6px 13px", fontSize: 12.5,
    fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", flexShrink: 0,
  },

  /* LAYOUT */
  main: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    minHeight: 0,
  },

  /* LEFT PANEL */
  left: {
    width: 300, flexShrink: 0,
    background: "#fff",
    borderRight: "1px solid #E5E3EE",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    height: "100%",
  },
  orderHeader: {
    padding: "10px 18px 8px",
    borderBottom: "1px solid #F0EEF8",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  badge: {
    background: "#EDE9FF", color: "#7C5CFC",
    borderRadius: 20, padding: "2px 10px",
    fontSize: 11.5, fontWeight: 600, marginLeft: 8,
  },
  clearBtn: {
    background: "none", border: "none",
    cursor: "pointer", color: "#7C5CFC",
    fontSize: 12.5,
    display: "flex", alignItems: "center", gap: 4,
    fontFamily: "inherit",
  },
 cartScroll: {
    height: 300,
    overflowY: "auto",
    padding: "4px 14px",
    borderBottom: "1px solid #F0EEF8",
},
  emptyCart: {
    color: "#9CA3AF", textAlign: "center",
    paddingTop: 32, fontSize: 13,
  },
  qtyBtn: {
    width: 22, height: 22, borderRadius: 6,
    border: "1px solid #D1D5DB",
    cursor: "pointer", fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#374151", flexShrink: 0, lineHeight: 1,
  },

  /* RIGHT PANEL */
  right: {
    flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
  },
  catBar: {
    background: "#fff",
    borderBottom: "1px solid #E5E3EE",
    padding: "10px 18px 8px",
    display: "flex", flexWrap: "wrap", gap: 6,
    flexShrink: 0,
  },
  menuGrid: {
    flex: 1, overflowY: "auto",
    padding: "14px 18px",
  },
  menuInner: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: 10,
  },
};