import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../components/axios";

/* ── CustomerMenu.jsx ──────────────────────────────────────────────────
   Customer-facing self-order menu (QR scan → order)
   Derived from Sales.jsx — cashier-only features removed.
   Layout: Sticky header → search → categories → product grid → sticky cart
────────────────────────────────────────────────────────────────────── */

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

const fmt = (n) => `₹${Number(n).toFixed(2)}`;

// ── Customer API helpers ────────────────────────────────────────────
const getProducts = async () => {
  const res = await api.get("/customer-menu/products");
  return res.data;
};

const getCategories = async () => {
  const res = await api.get("/itemcategory/all");
  return res.data;
};

const createCustomerOrder = async (payload) => {
  const res = await api.post(
    "/customer-order/create",
    payload
  );
  return res.data;
};

// ── Component ──────────────────────────────────────────────────────────
export default function CustomerMenu() {
  const { tenant, tableId } = useParams();
  const navigate = useNavigate();
  console.log(tenant);
  console.log(tableId);

  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems,  setMenuItems]   = useState([]);
  const [categories, setCategories]  = useState([{ id: "all", label: "All Items" }]);
  const [cart,       setCart]        = useState([]);
  const [search,     setSearch]      = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading,    setLoading]     = useState(true);
  const [submitting, setSubmitting]  = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [cartOpen,   setCartOpen]    = useState(false);
  const cartRef = useRef(null);

  // Table / restaurant info from URL params or localStorage
  const tableNo    = new URLSearchParams(window.location.search).get("table") || "5";
  const branchName = localStorage.getItem("currentBranch") || "MasalaRoast";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [products, cats] = await Promise.all([getProducts(), getCategories()]);
      setMenuItems(products);
      const uniqueCats = [{ id: "all", label: "All Items" }];
      if (Array.isArray(cats)) {
        cats.forEach((cat) =>
          uniqueCats.push({
            id: cat.itemcategoryname.toLowerCase().replace(/\s+/g, ""),
            label: cat.itemcategoryname,
          })
        );
      }
      setCategories(uniqueCats);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const allFiltered = menuItems.filter((item) => {
    const itemCat   = (item.category || "").toLowerCase().replace(/\s+/g, "");
    const matchCat  = activeCategory === "all" || itemCat === activeCategory;
    const matchSearch = item.itemname?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const filtered = allFiltered.slice(0, visibleCount);

  /* Cart helpers */
  const addToCart = (item) => {
    const pid = item.id || item.itemid;
    setCart((prev) => {
      const ex = prev.find((c) => c.itemid === pid);
      if (ex) return prev.map((c) => c.itemid === pid ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { itemid: pid, itemname: item.productname || item.itemname, price: item.price, qty: 1 }];
    });
  };

  const updateQty = (id, d) =>
    setCart((p) =>
      p.map((c) => c.itemid === id ? { ...c, qty: Math.max(1, c.qty + d) } : c)
    );

  const removeItem = (id) =>
    setCart((p) => p.filter((c) => c.itemid !== id));

  const clearCart = () => setCart([]);

  const cartQty = (id) => cart.find((c) => c.itemid === id)?.qty ?? 0;
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal   = cart.reduce((s, c) => s + c.price * c.qty, 0);

  /* Place order */
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        tableId: Number(tableId),
        items: cart.map((item) => ({
          productId: item.itemid,
          qty: item.qty,
        })),
      };

      const response = await createCustomerOrder(payload);
      setOrderSuccess(true);
      clearCart();
      setCartOpen(false);

      if (response?.orderId) {
        navigate(`/order-status/${response.orderId}`);
      }
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Inline styles ──────────────────────────────────────────────── */
  const S = {
    root: {
      background: "#F3F2F7",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', sans-serif",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
    },

    /* Sticky header */
    header: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "#4B3FA7",
      color: "#fff",
      padding: "14px 16px 10px",
    },
    restaurantName: {
      fontSize: 18,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: "-0.3px",
    },
    tableTag: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: "rgba(255,255,255,0.18)",
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 12,
      color: "#fff",
      fontWeight: 600,
      marginTop: 4,
    },
    searchWrap: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(255,255,255,0.15)",
      border: "1px solid rgba(255,255,255,0.25)",
      borderRadius: 10,
      padding: "0 12px",
      height: 38,
      marginTop: 10,
    },
    searchInput: {
      border: "none",
      background: "transparent",
      color: "#fff",
      outline: "none",
      fontSize: 13.5,
      flex: 1,
    },

    /* Category strip */
    catBar: {
      background: "#fff",
      borderBottom: "1px solid #E5E3EE",
      padding: "10px 14px",
      display: "flex",
      gap: 7,
      overflowX: "auto",
      flexShrink: 0,
      scrollbarWidth: "none",
    },
    catPill: (active, cs) => ({
      padding: "6px 16px",
      borderRadius: 20,
      border: active ? "none" : "1px solid #E5E3EE",
      background: active ? cs.bg : "#fff",
      color: active ? (cs.color === "#FFFFFF" ? "#fff" : cs.color) : cs.color,
      fontSize: 12.5,
      fontWeight: active ? 700 : 500,
      cursor: "pointer",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }),

    /* Menu grid - 2 columns for customer */
    menuScroll: {
      flex: 1,
      overflowY: "auto",
      padding: "14px 14px 100px",   // bottom padding leaves room for cart bar
    },
    menuGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 12,
    },
    card: (inCart) => ({
      background: "#fff",
      border: inCart ? "2px solid #7C5CFC" : "1px solid #E5E3EE",
      borderRadius: 12,
      padding: "16px 12px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      transition: "border-color 0.15s",
    }),
    cardName: {
      fontWeight: 700,
      fontSize: 13.5,
      color: "#1A1A2E",
      lineHeight: 1.35,
    },
    cardPrice: {
      fontSize: 15,
      fontWeight: 800,
      color: "#7C5CFC",
    },
    addBtn: (inCart) => ({
      marginTop: "auto",
      background: inCart ? "#EDE9FF" : "#7C5CFC",
      color:      inCart ? "#7C5CFC" : "#fff",
      border:     inCart ? "1.5px solid #7C5CFC" : "none",
      borderRadius: 8,
      padding: "8px 0",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    }),
    qtyRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 4,
      marginTop: "auto",
    },
    qtyBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "1.5px solid #7C5CFC",
      background: "#EDE9FF",
      color: "#7C5CFC",
      fontWeight: 800,
      fontSize: 17,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    /* Cart FAB bar (sticky bottom) */
    cartBar: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      zIndex: 60,
      background: "#fff",
      borderTop: "1px solid #E5E3EE",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
      padding: "10px 14px 14px",
    },
    cartToggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      padding: "0 0 0 0",
      marginBottom: 0,
    },

    /* Expanded cart panel */
    cartPanel: {
      maxHeight: 300,
      overflowY: "auto",
      marginBottom: 10,
    },
    cartItemRow: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 0",
      borderBottom: "1px solid #F3F2F7",
    },
    placeBtn: (disabled) => ({
      width: "100%",
      background: disabled ? "#ccc" : "#7C5CFC",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "13px 0",
      fontSize: 15,
      fontWeight: 800,
      cursor: disabled ? "not-allowed" : "pointer",
      letterSpacing: "0.2px",
    }),

    /* Success screen */
    successScreen: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      textAlign: "center",
    },
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ ...S.root, alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ color: "#7C5CFC", fontSize: 15, fontWeight: 600 }}>Loading menu…</div>
      </div>
    );
  }

  /* ── Order success ── */
  if (orderSuccess) {
    return (
      <div style={S.successScreen}>
        <div style={{ fontSize: 64, marginBottom: 18 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", marginBottom: 8 }}>Order Placed!</div>
        <div style={{ fontSize: 15, color: "#6B7280", marginBottom: 8 }}>
          Your order has been sent to the kitchen.
        </div>
        <div style={{ fontSize: 13.5, color: "#7C5CFC", fontWeight: 600, marginBottom: 28 }}>
          Table {tableNo} • {branchName}
        </div>
        <button
          onClick={() => setOrderSuccess(false)}
          style={{
            background: "#7C5CFC", color: "#fff",
            border: "none", borderRadius: 10,
            padding: "12px 36px", fontSize: 15,
            fontWeight: 700, cursor: "pointer",
          }}
        >
          Order More
        </button>
      </div>
    );
  }

  return (
    <div style={S.root}>

      {/* ── Sticky Header ─────────────────────────────── */}
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={S.restaurantName}>{branchName}</div>
            <div style={S.tableTag}>
              🪑 Table {tableNo}
            </div>
          </div>
          {totalItems > 0 && (
            <div style={{
              background: "#EDE9FF", borderRadius: 20,
              padding: "4px 12px", fontSize: 12.5,
              fontWeight: 700, color: "#7C5CFC",
              display: "flex", alignItems: "center", gap: 5,
              marginTop: 2,
            }}>
              🛒 {totalItems} item{totalItems > 1 ? "s" : ""}
            </div>
          )}
        </div>
        <div style={S.searchWrap}>
          <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(20); }}
            placeholder="Search food items…"
            style={S.searchInput}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 16, padding: 0 }}
            >✕</button>
          )}
        </div>
      </header>

      {/* ── Category Strip ────────────────────────────── */}
      <div style={S.catBar}>
        {categories.map((cat) => {
          const active = activeCategory === cat.id;
          const cs = CAT_STYLES[cat.id] || { bg: "#F3F2F7", color: "#374151" };
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setVisibleCount(20); }}
              style={S.catPill(active, cat.id === "all" ? { bg: "#7C5CFC", color: "#fff" } : cs)}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Menu Grid ─────────────────────────────────── */}
      <div style={S.menuScroll}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9CA3AF", fontSize: 14 }}>
            No items found
          </div>
        ) : (
          <div style={S.menuGrid}>
            {filtered.map((item) => {
              const pid   = item.id || item.itemid;
              const qty   = cartQty(pid);
              const inCart = qty > 0;
              return (
                <div key={pid} style={S.card(inCart)}>
                  {/* In-cart badge */}
                  {inCart && (
                    <span style={{
                      position: "absolute", top: -8, right: -8,
                      background: "#7C5CFC", color: "#fff",
                      width: 22, height: 22, borderRadius: 9999,
                      fontSize: 11, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{qty}</span>
                  )}

                  <div style={S.cardName}>{item.productname || item.itemname}</div>
                  <div style={S.cardPrice}>{fmt(item.price)}</div>

                  {/* Add / Qty controls */}
                  {!inCart ? (
                    <button style={S.addBtn(false)} onClick={() => addToCart(item)}>
                      + Add
                    </button>
                  ) : (
                    <div style={S.qtyRow}>
                      <button style={S.qtyBtn} onClick={() => {
                        if (qty === 1) removeItem(pid); else updateQty(pid, -1);
                      }}>−</button>
                      <span style={{ fontWeight: 800, fontSize: 15, color: "#7C5CFC" }}>{qty}</span>
                      <button style={S.qtyBtn} onClick={() => updateQty(pid, 1)}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {allFiltered.length > visibleCount && (
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button
              onClick={() => setVisibleCount((v) => v + 10)}
              style={{
                background: "#fff", border: "1px solid #E5E3EE",
                borderRadius: 8, padding: "9px 36px",
                fontSize: 13, color: "#374151", fontWeight: 500,
                cursor: "pointer",
              }}
            >Load More ↓</button>
          </div>
        )}
      </div>

      {/* ── Cart Bar (sticky bottom) ───────────────────── */}
      {cart.length > 0 && (
        <div style={S.cartBar}>
          {/* Toggle header */}
          <div style={S.cartToggle} onClick={() => setCartOpen((o) => !o)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1A1A2E" }}>
                🛒 Cart ({totalItems} items)
              </span>
              <span style={{ fontSize: 11.5, color: "#7C5CFC", fontWeight: 700 }}>
                {cartOpen ? "▲ hide" : "▲ view"}
              </span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#7C5CFC" }}>{fmt(subtotal)}</span>
          </div>

          {/* Expanded cart items */}
          {cartOpen && (
            <>
              <div style={{ height: 1, background: "#F0EEF8", margin: "8px 0" }} />
              <div style={S.cartPanel}>
                {cart.map((item) => (
                  <div key={item.itemid} style={S.cartItemRow}>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: "#1A1A2E" }}>
                      {item.itemname}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        style={{ ...S.qtyBtn, width: 26, height: 26, fontSize: 15 }}
                        onClick={() => { if (item.qty === 1) removeItem(item.itemid); else updateQty(item.itemid, -1); }}
                      >−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#7C5CFC", minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                      <button
                        style={{ ...S.qtyBtn, width: 26, height: 26, fontSize: 15 }}
                        onClick={() => updateQty(item.itemid, 1)}
                      >+</button>
                    </div>
                    <span style={{ minWidth: 60, textAlign: "right", fontWeight: 700, fontSize: 13, color: "#1A1A2E" }}>
                      {fmt(item.price * item.qty)}
                    </span>
                    <button
                      onClick={() => removeItem(item.itemid)}
                      style={{ background: "none", border: "none", color: "#E63973", fontSize: 16, cursor: "pointer", padding: "0 2px" }}
                    >✕</button>
                  </div>
                ))}
              </div>

              {/* Subtotal row */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 10px", borderTop: "1px solid #F0EEF8", marginTop: 2 }}>
                <span style={{ fontSize: 14, color: "#6B7280" }}>Subtotal</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#1A1A2E" }}>{fmt(subtotal)}</span>
              </div>
            </>
          )}

          {/* Place Order button */}
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            style={S.placeBtn(submitting)}
          >
            {submitting ? "🔄 Placing Order…" : `✅ Place Order • ${fmt(subtotal)}`}
          </button>
        </div>
      )}

    </div>
  );
}