import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../../services/Productservice";
import { createSale, closeRegister as closeRegisterAPI, getSalesReport } from "../../services/SalesService";
import { updateCustomerDisplay, clearCustomerDisplay } from "../../services/customerDisplayService";
import CloseregisterModal from "../dailysales/CloseregisterModal";
import BillPreviewModal from "../../components/bill/BillPreviewModal";
import BillLayout from "../../components/bill/BillLayout";

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

export default function Sales() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "All Items" }]);
  const [cart, setCart] = useState([]);
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [qtyInput, setQtyInput]       = useState("");
  const [search, setSearch]           = useState("");
  const [activeKey, setActiveKey]     = useState(null);
  const [time, setTime]               = useState(new Date());
  const [visibleCount, setVisibleCount] = useState(15);
  const [activeTab, setActiveTab]     = useState("register");
  const [payMode, setPayMode]         = useState("cash");
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [billData, setBillData] = useState(null);
  const [draftBillNo, setDraftBillNo] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const branchId = localStorage.getItem("branchid") || localStorage.getItem("branchId");

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const [products, cats] = await Promise.all([getProducts(), getCategories()]);
      setMenuItems(products);
      const uniqueCats = [{ id: "all", label: "All Items" }];
      if (Array.isArray(cats)) {
        cats.forEach(cat => {
          uniqueCats.push({
            id: cat.itemcategoryname.toLowerCase(),
            label: cat.itemcategoryname
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

  const allFiltered = menuItems.filter((item) => {
    const itemCat = (item.category || "").toLowerCase();
    const matchCat = activeCategory === "all" || itemCat === activeCategory;
    const matchSearch = item.itemname?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const filtered = allFiltered.slice(0, visibleCount);

  const addToCart = (item) => {
    const pid = item.id || item.itemid;
    const pname = item.productname || item.itemname;
    const pprice = item.price;
    const billNo = draftBillNo || "BILL-" + Date.now();
    if (!draftBillNo) setDraftBillNo(billNo);

    setCart((prev) => {
      const ex = prev.find((c) => c.itemid === pid);
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

  const updateQty = (id, d) => {
    const next = cart.map((c) => c.itemid === id ? { ...c, qty: Math.max(1, c.qty + d) } : c);
    setCart(next);
    pushToCustomerDisplay(next, draftBillNo);
  };

  const removeItem = (id) => {
    const next = cart.filter((c) => c.itemid !== id);
    setCart(next);
    if (selectedCartId === id && next.length > 0) setSelectedCartId(next[0].itemid);
    else if (next.length === 0) setSelectedCartId(null);
    setQtyInput("");
    pushToCustomerDisplay(next, draftBillNo);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCartId(null);
    setQtyInput("");
    if (branchId) {
      updateCustomerDisplay({
        branchid: branchId,
        billno: null,
        total: 0,
        status: "WAITING",
        items: []
      });
    }
  };

  const handleKey = (k) => {
    setActiveKey(k);
    setTimeout(() => setActiveKey(null), 150);
    if (!selectedCartId) return;
    if (k === "⌫") {
      const next = qtyInput.slice(0, -1);
      setQtyInput(next);
      if (next !== "") setQty(selectedCartId, parseInt(next));
      return;
    }
    if (/^\d$/.test(k)) {
      const next = qtyInput + k;
      const num = parseInt(next);
      if (num >= 1 && num <= 999) {
        setQtyInput(next);
        setQty(selectedCartId, num);
      }
      return;
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const handleConfirmOrder = async () => {
    if (cart.length === 0) { alert("Cart is empty"); return; }
    setSubmitting(true);
    try {
      const branchName = localStorage.getItem("currentBranch");
      if (!branchName) { alert("Branch not found"); return; }
      const billNo = draftBillNo || "BILL-" + Date.now();
      if (!draftBillNo) setDraftBillNo(billNo);
      for (const item of cart) {
        await createSale({
          branchname: branchName,
          productname: item.itemname,
          qty: item.qty,
          paymentmethod: payMode,
          billno: billNo
        });
      }
      await clearCustomerDisplay(branchId);
      setBillData({ billNo, items: cart, total, paymentMethod: payMode, branchName });
      setShowBillPreview(true);
    } catch (err) {
      console.error("Error confirming order:", err);
      alert("Failed to confirm order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseRegister = async () => {
    try {
      const branchId = localStorage.getItem("branchId");
      if (!branchId) { alert("Branch not selected"); return; }
      await closeRegisterAPI(branchId);
      alert("Register closed successfully");
      setShowCloseModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to close register");
    }
  };

  const loadReport = async () => {
    try {
      const branchId = localStorage.getItem("branchId");
      const res = await getSalesReport(branchId);
      setReport(res);
    } catch (err) {
      console.error("Failed to load report:", err);
      setReport(null);
    }
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = 0;
  const total = subtotal - discount;

  const pushToCustomerDisplay = async (cartItems, billNo) => {
    if (!branchId) return;
    if (cartItems.length === 0) {
      await updateCustomerDisplay({ branchid: branchId, billno: null, total: 0, status: "WAITING", items: [] });
      return;
    }
    const grandTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    await updateCustomerDisplay({
      branchid: branchId,
      billno: billNo,
      total: grandTotal,
      status: "ACTIVE",
      items: cartItems.map(item => ({
        itemname: item.itemname,
        qty: item.qty,
        price: item.price,
        total: item.price * item.qty
      }))
    });
  };

  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const S = {
    root: {
      background: "#F3F2F7",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
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
    onlineDot: { width: 8, height: 8, borderRadius: 9999, background: "#22C55E" },
    searchBox: {
      flex: 1, maxWidth: 520,
      background: "rgba(255,255,255,0.13)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 8, display: "flex", alignItems: "center",
      gap: 8, padding: "0 12px", height: 34,
    },
    searchInput: {
      border: "none", background: "transparent",
      color: "#fff", outline: "none", fontSize: 13, flex: 1,
    },
    closeBtn: {
      background: "#E63973", color: "#fff",
      border: "none", borderRadius: 7,
      padding: "6px 13px", fontSize: 12.5,
      fontWeight: 600, cursor: "pointer",
    },
    subnav: {
      background: "#fff",
      borderBottom: "1px solid #E5E3EE",
      padding: "0 20px",
      display: "flex", alignItems: "center",
      gap: 4, height: 44, flexShrink: 0,
    },
    main: { display: "flex", flex: 1, overflow: "hidden" },
    left: {
      width: 340, flexShrink: 0,
      background: "#fff",
      borderRight: "1px solid #E5E3EE",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    },
    orderHeader: {
      padding: "6px 12px 5px",
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
    cartScroll: {
      overflowY: "auto",
      padding: "2px 8px",
      height: 180,
      minHeight: 0,
    },
    cartRow: {
      display: "flex",
      alignItems: "center",
      padding: "3px 5px",
      borderRadius: 6,
      marginBottom: 1,
      gap: 4,
      cursor: "pointer",
    },
    qtyBtn: {
      width: 18, height: 18, borderRadius: 4,
      border: "1px solid #D1D5DB",
      background: "#F9FAFB",
      cursor: "pointer", fontSize: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#374151",
      flexShrink: 0,
    },
    bottomPanel: {
      flexShrink: 0,
      borderTop: "1px solid #F0EEF8",
    },
    totals: {
      padding: "4px 12px",
      background: "#FAFAFA",
    },
    paymentSection: {
      padding: "6px 8px",
      margin: "0 10px 6px",
      borderRadius: 12,
      background: "#FFFFFF",
      border: "1px solid #E5E3EE",
    },
    numpadGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 2, padding: "0 8px 3px",
    },
    right: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    catBar: {
      background: "#fff",
      borderBottom: "1px solid #E5E3EE",
      padding: "10px 18px 8px",
      display: "flex", flexWrap: "wrap", gap: 6,
      flexShrink: 0,
    },
  };

  const numpadKeys = ["1","2","3","Qty","4","5","6","%","7","8","9","Price","+/-","0",".","⌫"];

  if (loading) {
    return (
      <div style={{...S.root, display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div>Loading menu items...</div>
      </div>
    );
  }

  return (
    <div style={S.root}>

      {/* ── NAVBAR ── */}
      <header style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={S.logoBox}>⚡</div>
          <span style={S.logoText}>NextGenPOS</span>
          <div style={S.onlineDot} />
        </div>

        <div style={S.searchBox}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product... (e.g. tomato, தக்காளி)"
            style={S.searchInput}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>

        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:18 }}>
          <span style={{ fontSize:12.5, opacity:0.75 }}>#BL-2481</span>
          <span style={{ fontSize:13, fontWeight:500 }}>{timeStr}</span>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:26,height:26,borderRadius:9999,background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>R</div>
            <span style={{ fontSize:13 }}>Ravi</span>
          </div>
          <button onClick={() => { loadReport(); setShowCloseModal(true); }} style={S.closeBtn}>🔒 Close Register</button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div style={S.main}>

        {/* ── LEFT PANEL ── */}
        <aside style={S.left}>

          {/* Order Header */}
          <div style={S.orderHeader}>
            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{ fontWeight:700, fontSize:14, color:"#1A1A2E" }}>Current Order</span>
              <span style={S.badge}>{cart.length} Items</span>
            </div>
            <button onClick={clearCart} style={{ background:"none", border:"none", cursor:"pointer", color:"#7C5CFC", fontSize:12.5, display:"flex", alignItems:"center", gap:4 }}>
              🗑️ Clear
            </button>
          </div>

          {/* ── CART ITEMS (single line per item) ── */}
          <div style={S.cartScroll}>
            {cart.length === 0 && (
              <div style={{ color:"#9CA3AF", textAlign:"center", paddingTop:24, fontSize:13 }}>No items yet</div>
            )}
            {cart.map((item) => {
              const isSel = item.itemid === selectedCartId;
              return (
                <div
                  key={item.itemid}
                  onClick={() => selectCartItem(item.itemid)}
                  style={{
                    ...S.cartRow,
                    background: isSel ? "#EDE9FF" : "transparent",
                    borderBottom: isSel ? "none" : "1px solid #F3F2F7",
                  }}
                >
                  {/* Name — truncated, takes available space */}
                  <span style={{
                    flex: 1,
                    minWidth: 0,
                    fontWeight: isSel ? 700 : 600,
                    fontSize: 11.5,
                    color: isSel ? "#7C5CFC" : "#1A1A2E",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{item.itemname}</span>

                  {/* Qty controls */}
                  <button
                    style={{ ...S.qtyBtn, background: isSel ? "#fff" : "#F9FAFB" }}
                    onClick={(e) => { e.stopPropagation(); updateQty(item.itemid, -1); selectCartItem(item.itemid); }}
                  >−</button>
                  <span style={{ fontSize:12, fontWeight:700, minWidth:16, textAlign:"center", color: isSel ? "#7C5CFC" : "#1A1A2E" }}>{item.qty}</span>
                  <button
                    style={{ ...S.qtyBtn, background: isSel ? "#fff" : "#F9FAFB" }}
                    onClick={(e) => { e.stopPropagation(); updateQty(item.itemid, 1); selectCartItem(item.itemid); }}
                  >+</button>

                  {/* Line total */}
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1A1A2E", minWidth: 46, textAlign: "right" }}>{fmt(item.price * item.qty)}</span>

                  {/* Remove */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.itemid); }}
                    style={{ background:"none", border:"none", color:"#E63973", fontSize:14, cursor:"pointer", lineHeight:1, padding:"0 2px", flexShrink:0 }}
                  >✕</button>
                </div>
              );
            })}
          </div>

          {/* ── BOTTOM PANEL ── */}
          <div style={S.bottomPanel}>

            {/* Total */}
            <div style={S.totals}>
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:13 }}>
                <span style={{ color:"#1A1A2E" }}>Total</span>
                <span style={{ color:"#7C5CFC" }}>{fmt(total)}</span>
              </div>
            </div>

            {/* Numpad */}
            <div style={S.numpadGrid}>
              {numpadKeys.map((k) => {
                const isSpecial  = k === "Qty" || k === "%" || k === "Price";
                const isDelete   = k === "⌫";
                const isPlusMinus= k === "+/-";
                const pressed    = activeKey === k;

                let bg    = "#FFFFFF";
                let color = "#1A1A2E";
                let fw    = 500;
                if (pressed)      { bg = "#7C5CFC"; color = "#fff"; }
                else if (isSpecial)   { bg = "#EDE9FF"; color = "#7C5CFC"; fw = 600; }
                else if (isDelete)    { bg = "#FEE2E2"; color = "#E63973"; }
                else if (isPlusMinus) { bg = "#FEF3C7"; color = "#92400E"; }

                return (
                  <button key={k} onClick={() => handleKey(k)} style={{
                    padding: "4px 2px",
                    borderRadius: 6,
                    border: "none",
                    fontSize: 11.5,
                    fontWeight: fw,
                    cursor: "pointer",
                    background: bg,
                    color,
                    transition: "background 0.1s",
                  }}>{k}</button>
                );
              })}
            </div>

            {/* Payment Mode */}
            <div style={S.paymentSection}>
              <div style={{ fontSize:10, fontWeight:600, color:"#6B7280", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Payment Mode</div>
              <div style={{ display:"flex", gap:5, marginBottom:7 }}>
                {[
                  { key:"cash", label:"Cash", icon:"💵" },
                  { key:"upi",  label:"UPI",  icon:"📱" },
                  { key:"card", label:"Card", icon:"💳" },
                ].map(({ key, label, icon }) => (
                  <button key={key} onClick={() => setPayMode(key)} style={{
                    flex:1, padding: "3px 0",
                    borderRadius:7,
                    border: payMode === key ? "2px solid #7C5CFC" : "1.5px solid #E5E3EE",
                    background: payMode === key ? "#EDE9FF" : "#fff",
                    color: payMode === key ? "#7C5CFC" : "#374151",
                    fontWeight: payMode === key ? 700 : 500,
                    fontSize:11, cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:3,
                  }}>
                    <span style={{ fontSize:13 }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleConfirmOrder}
                disabled={submitting || cart.length === 0}
                style={{
                  width:"100%",
                  background: submitting || cart.length === 0 ? "#ccc" : "#7C5CFC",
                  color:"#fff",
                  border:"none", borderRadius:10, padding: "5px 0",
                  fontSize:13, fontWeight:700,
                  cursor: submitting || cart.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "🔄 Confirming..." : "✅ Confirm Order"}
              </button>
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <div style={S.right}>

          {activeTab === "tables" && (
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
              <div style={{ fontWeight:700, fontSize:15, color:"#1A1A2E", marginBottom:16 }}>Tables</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:12 }}>
                {[
                  { no:"T-01", status:"occupied", guests:4 },
                  { no:"T-02", status:"available", guests:0 },
                  { no:"T-03", status:"occupied", guests:2 },
                  { no:"T-04", status:"available", guests:0 },
                  { no:"T-05", status:"occupied", guests:6 },
                  { no:"T-06", status:"available", guests:0 },
                  { no:"T-07", status:"occupied", guests:3 },
                  { no:"T-08", status:"available", guests:0 },
                  { no:"T-09", status:"available", guests:0 },
                  { no:"T-10", status:"occupied", guests:2 },
                  { no:"T-11", status:"available", guests:0 },
                  { no:"T-12", status:"occupied", guests:5 },
                ].map((t) => {
                  const occ = t.status === "occupied";
                  return (
                    <div key={t.no} style={{
                      background: occ ? "#EDE9FF" : "#fff",
                      border: occ ? "1.5px solid #7C5CFC" : "1px solid #E5E3EE",
                      borderRadius:10, padding:"16px 12px",
                      textAlign:"center", cursor:"pointer",
                    }}>
                      <div style={{ fontSize:20, marginBottom:6 }}>{occ ? "🪑" : "⬜"}</div>
                      <div style={{ fontWeight:700, fontSize:13.5, color: occ ? "#7C5CFC" : "#1A1A2E" }}>{t.no}</div>
                      <div style={{ fontSize:11.5, marginTop:4, color: occ ? "#7C5CFC" : "#9CA3AF" }}>
                        {occ ? `${t.guests} guests` : "Available"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab !== "tables" && <>

            {/* Category bar */}
            <div style={S.catBar}>
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                const cs = CAT_STYLES[cat.id] || { bg:"#F3F2F7", color:"#374151" };
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setVisibleCount(15); }}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 20,
                      border: active ? "none" : "1px solid #E5E3EE",
                      background: active ? cs.bg : "#fff",
                      color: active ? (cat.id === "all" ? "#fff" : cs.color) : cs.color,
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.12s",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Menu grid */}
            <div style={{ flex:1, overflowY:"auto", padding:"14px 18px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
              }}>
                {filtered.map((item) => {
                  const pid = item.id || item.itemid;
                  const pname = item.productname || item.itemname;
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
                        padding: "16px 8px 12px",
                        cursor: "pointer",
                        textAlign: "center",
                        position: "relative",
                        transition: "border-color 0.12s",
                      }}
                    >
                      {inCart && (
                        <span style={{
                          position:"absolute", top:-7, right:-7,
                          background:"#7C5CFC", color:"#fff",
                          width:20, height:20, borderRadius:9999,
                          fontSize:10.5, fontWeight:700,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>{inCart.qty}</span>
                      )}
                      <div style={{
                        fontWeight: 700, fontSize: 11.5, color: "#1A1A2E",
                        lineHeight: 1.35,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        flexDirection: "column",
                      }}>
                        <span>{pname}</span>
                        <span style={{ color:"#7C5CFC", marginTop:3 }}>₹{pprice}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {allFiltered.length > visibleCount && (
                <div style={{ textAlign:"center", marginTop:18 }}>
                  <button
                    onClick={() => setVisibleCount((v) => v + 10)}
                    style={{
                      background:"#fff", border:"1px solid #E5E3EE",
                      borderRadius:8, padding:"9px 36px",
                      fontSize:13, color:"#374151", fontWeight:500,
                      cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6,
                    }}
                  >Load More ↓</button>
                </div>
              )}
            </div>
          </>}
        </div>
      </div>

      {showCloseModal && (
        <CloseregisterModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
        />
      )}

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