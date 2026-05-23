import { useState, useEffect, useRef } from "react";
import instances from "../../../components/axios";
import BillLayout from "../../../components/bill/BillLayout";
import BillPreviewModal from "../../../components/bill/BillPreviewModal";
import CloseregisterModal from "../../../pages/dailysales/CloseregisterModal";

// ── DATA ──────────────────────────────────────────────────────────────────────
const RECENT_IDS = [0, 1, 2, 5, 8];

// ── TOAST HOOK ────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ msg: "", show: false });
  const timerRef = useRef(null);

  const fire = (msg) => {
    clearTimeout(timerRef.current);
    setToast({ msg, show: true });
    timerRef.current = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      1600
    );
  };

  return [toast, fire];
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ product, qty, onAdd }) {
  const inCart = qty > 0;

  return (
    <button
      onClick={onAdd}
      className={`
        relative flex flex-col gap-1.5 p-3 rounded-2xl border text-left
        transition-all duration-150 active:scale-95 cursor-pointer select-none
        ${
          inCart
            ? "bg-[#0d1f16] border-[#3dd68c]"
            : "bg-[#1a1e2a] border-white/[0.07] hover:border-white/[0.15] hover:bg-[#1f2433]"
        }
      `}
    >
      {inCart && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#3dd68c] text-black text-[10px] font-bold flex items-center justify-center z-10 animate-bounce-once">
          {qty}
        </span>
      )}

      <span className="text-2xl leading-none text-center">📦</span>
      <span className="text-xs font-medium text-[#f0f2f5] leading-tight">
        {product.itemname}
      </span>

      <div className="flex justify-between items-center mt-1">
        <span className="font-mono text-xs font-semibold text-[#3dd68c]">
          ₹{product.price}
        </span>
      </div>
    </button>
  );
}

// ── CART ITEM ─────────────────────────────────────────────────────────────────
function CartItem({ item, onInc, onDec }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1e2a] border border-white/[0.07] rounded-xl animate-slideIn">
      <span className="text-lg flex-shrink-0">📦</span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#f0f2f5] truncate">{item.itemname}</p>
        <p className="font-mono text-[11px] text-[#8892a4]">
          ₹{item.price}{item.unit ? `/${item.unit}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onDec}
          className="w-7 h-7 rounded-lg border border-white/[0.12] bg-[#1f2433] text-[#8892a4]
                     hover:border-red-400/60 hover:text-red-400 hover:bg-red-400/10
                     flex items-center justify-center text-base leading-none transition-all active:scale-90"
        >
          −
        </button>

        <span className="font-mono text-sm font-medium text-[#f0f2f5] w-6 text-center">
          {item.qty}
        </span>

        <button
          onClick={onInc}
          className="w-7 h-7 rounded-lg border border-white/[0.12] bg-[#1f2433] text-[#8892a4]
                     hover:border-[#3dd68c]/60 hover:text-[#3dd68c] hover:bg-[#3dd68c]/10
                     flex items-center justify-center text-base leading-none transition-all active:scale-90"
        >
          +
        </button>
      </div>

      <span className="font-mono text-xs font-semibold text-[#3dd68c] w-12 text-right flex-shrink-0">
        ₹{(item.price * item.qty).toFixed(2)}
      </span>
    </div>
  );
}

// ── SEARCH DROPDOWN ───────────────────────────────────────────────────────────
function SearchDropdown({ query, products, onSelect }) {
  if (!query.trim()) return null;

  const results = products
    .filter(
      (p) => p.itemname.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 6);

  if (!results.length) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f2433] border border-white/[0.12] rounded-xl shadow-2xl z-50 overflow-hidden">
      {results.map((p) => (
        <button
          key={p.itemid}
          onClick={() => onSelect(p.itemid)}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252b3a] transition-colors text-left"
        >
          <span className="text-lg">📦</span>

          <span className="flex-1 text-sm text-[#f0f2f5]">{p.itemname}</span>

          <span className="font-mono text-xs text-[#3dd68c]">
            ₹{p.price}{p.unit ? `/${p.unit}` : ""}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Salesregisterplus() {
  const [cart, setCart] = useState({});
  const [activeCat, setActiveCat] = useState("all");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [time, setTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [showCloseRegister, setShowCloseRegister] = useState(false);
  const [billData, setBillData] = useState(null);
  const [toast, fireToast] = useToast();
  const searchRef = useRef(null);

  // Clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(
        `${String(n.getHours()).padStart(2, "0")}:${String(
          n.getMinutes()
        ).padStart(2, "0")}`
      );
    };

    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  // Dynamic category loading
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await instances.get("/itemcategory/all");

        const dynamicCategories = [
          { key: "all", label: "All Items" },
          ...res.data.map((category) => ({
            key: category.itemcategoryname,
            label: category.itemcategoryname,
          })),
        ];

        setCategories(dynamicCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([{ key: "all", label: "All Items" }]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    instances
      .get("/product/all")
      .then((res) => {
        setProducts(res.data || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target)) setShowDropdown(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Cart helpers
  const addToCart = (id) => {
    const p = products.find((x) => x.itemid === id);
    if (!p) return;

    setCart((prev) => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], qty: prev[id].qty + 1 } : { ...p, qty: 1 },
    }));

    fireToast(`📦 ${p.itemname} added`);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;

      const newQty = item.qty + delta;

      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }

      return { ...prev, [id]: { ...item, qty: newQty } };
    });
  };

  const clearCart = () => setCart({});

  // ── Totals
  const cartItems = Object.values(cart);
  const totalQty = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal;

  // ── Filtered products
  const visibleProducts =
    activeCat === "all"
      ? products
      : products.filter((p) => p.category === activeCat);

  // ── Checkout
  const checkout = async (method) => {

  if (!cartItems.length) {

    fireToast("🛒 Add items first");

    return;
  }

  if (!paymentMethod) {

    fireToast("💳 Select payment method");

    return;
  }

  try {

    const billNo =
      "BL-" + Date.now();

    console.log(paymentMethod);

    for (const item of cartItems) {

      await instances.post(
        "/salesitem/register",
        {
          billno: billNo,
          itemname: item.itemname,
          qty: item.qty,
          price: item.price,
          total: item.price * item.qty,
          customerid: null,
              paymentmethod: paymentMethod

        }
      );
    }

    fireToast(`✅ Bill ${billNo} saved`);

    setBillData({
      billNo,
      paymentMethod,
      cartItems,
      subtotal,
      total,
    });
    setShowBill(true);

    setTimeout(() => {
      clearCart();
      setPaymentMethod("");
    }, 1200);

  } catch (error) {

    console.log(error);

    fireToast("❌ Failed to save bill");
  }
};

  return (
    <div className="flex flex-col h-screen bg-[#0d0f12] text-[#f0f2f5] font-sans overflow-hidden select-none">
      {/* ── HEADER ── */}
      <header className="flex items-center gap-4 px-5 h-13 min-h-[52px] bg-[#141720] border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2 font-semibold text-[15px] tracking-tight whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#3dd68c] shadow-[0_0_8px_rgba(61,214,140,0.5)]" />
          <span>Kadai</span>
          <span className="font-light text-[#4f5b6e] text-xs">POS</span>
        </div>

        <div ref={searchRef} className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4f5b6e]"
            width="15"
            height="15"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M13 13l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="text"
            value={searchQ}
            onChange={(e) => {
              setSearchQ(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search product… (e.g. tomato, தக்காளி)"
            className="w-full bg-[#1a1e2a] border border-white/[0.12] rounded-xl py-2 pl-9 pr-3
                       text-[13.5px] text-[#f0f2f5] placeholder-[#4f5b6e] outline-none
                       focus:border-[#3dd68c] focus:ring-2 focus:ring-[#3dd68c]/20 transition-all"
          />

          {showDropdown && (
            <SearchDropdown
              query={searchQ}
              products={products}
              onSelect={(id) => {
                addToCart(id);
                setSearchQ("");
                setShowDropdown(false);
              }}
            />
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="font-mono text-xs text-[#4f5b6e] bg-[#1a1e2a] px-2.5 py-1 rounded-lg border border-white/[0.07]">
            #BL-2481
          </span>

          <span className="font-mono text-[13px] text-[#8892a4]">{time}</span>

          <div className="flex items-center gap-1.5 bg-[#1a1e2a] border border-white/[0.12] rounded-xl px-2.5 py-1.5 text-xs text-[#8892a4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3dd68c]" />
            Ravi
          </div>

          <button
            onClick={() => setShowCloseRegister(true)}
            className="
              flex items-center gap-2
              px-3 py-2
              rounded-xl
              bg-red-500/10
              border border-red-500/20
              text-red-400
              text-xs font-semibold
              hover:bg-red-500/20
              transition-all
              active:scale-95
            "
          >
            🔒 Close Register
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col flex-1 overflow-hidden p-3.5 gap-3">
          {/* Dynamic Category Tabs */}
          <div className="flex gap-1.5 flex-shrink-0 overflow-x-auto scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={`
                  px-3.5 py-1.5 rounded-xl border text-[12.5px] font-medium whitespace-nowrap
                  transition-all duration-150 flex-shrink-0
                  ${
                    activeCat === c.key
                      ? "bg-[#3dd68c]/12 border-[#3dd68c] text-[#3dd68c]"
                      : "bg-[#1a1e2a] border-white/[0.07] text-[#8892a4] hover:bg-[#252b3a] hover:text-[#f0f2f5]"
                  }
                `}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div
            className="grid gap-2 overflow-y-auto flex-1 content-start scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))" }}
          >
            {visibleProducts.map((p) => (
              <ProductCard
                key={p.itemid}
                product={p}
                qty={cart[p.itemid]?.qty ?? 0}
                onAdd={() => addToCart(p.itemid)}
              />
            ))}
          </div>

          {/* Recent chips */}
          <div className="flex-shrink-0">
            <p className="text-[11px] text-[#4f5b6e] uppercase tracking-widest mb-2">
              Recently added
            </p>

            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {RECENT_IDS.map((id) => {
                const p = products.find((x) => x.itemid === id);
                if (!p) return null;

                return (
                  <button
                    key={id}
                    onClick={() => addToCart(id)}
                    className="flex items-center gap-1.5 bg-[#1f2433] border border-white/[0.07] rounded-xl
                               px-3 py-1.5 text-xs text-[#8892a4] whitespace-nowrap flex-shrink-0
                               hover:border-[#3dd68c] hover:text-[#3dd68c] hover:bg-[#3dd68c]/10 transition-all"
                  >
                    📦 {p.itemname}
                    <span className="font-mono text-[11px] text-[#4f5b6e]">
                      ₹{p.price}{p.unit ? `/${p.unit}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT CART PANEL ── */}
        <div className="w-80 flex flex-col bg-[#141720] border-l border-white/[0.07] flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] flex-shrink-0">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#f0f2f5]">
              Cart
              <span className="bg-[#3dd68c] text-black text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {totalQty}
              </span>
            </div>

            <button
              onClick={clearCart}
              className="text-[11px] text-[#4f5b6e] px-2 py-1 rounded-lg border border-transparent
                         hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/10 transition-all"
            >
              Clear all
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#4f5b6e] gap-2 py-10">
                <span className="text-4xl opacity-40">🛒</span>
                <span className="text-sm">Cart is empty</span>
                <span className="text-xs">Tap a product to add</span>
              </div>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item.itemid}
                  item={item}
                  onInc={() => changeQty(item.itemid, 1)}
                  onDec={() => changeQty(item.itemid, -1)}
                />
              ))
            )}
          </div>

          <div className="mx-2 mb-0 bg-[#1a1e2a] rounded-t-2xl px-4 py-3 border-t border-white/[0.07] flex-shrink-0">
            <div className="flex justify-between py-0.5">
              <span className="text-xs text-[#4f5b6e]">Subtotal</span>
              <span className="font-mono text-xs text-[#8892a4]">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="text-xs text-[#4f5b6e]">Discount</span>
              <span className="font-mono text-xs text-red-400">— ₹0.00</span>
            </div>

           

            <div className="border-t border-dashed border-white/[0.12] my-2" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#f0f2f5]">Total</span>
              <span className="font-mono text-xl font-semibold text-[#3dd68c]">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="px-4 pb-4 pt-3 flex flex-col gap-2 flex-shrink-0">
            <p className="text-[11px] text-[#4f5b6e] uppercase tracking-widest mb-0.5">
              Payment Method
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod("Cash")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                           border border-amber-500 bg-amber-500/12 text-amber-400
                           text-[13px] font-semibold hover:bg-amber-500/22 transition-all active:scale-95
                           ${paymentMethod === "Cash" ? "ring-2 ring-amber-300 scale-[1.02]" : ""}`}
              >
                💵 Cash
              </button>

              <button
                onClick={() => setPaymentMethod("UPI")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                           border border-indigo-400 bg-indigo-500/15 text-indigo-300
                           text-[13px] font-semibold hover:bg-indigo-500/25 transition-all active:scale-95
                           ${paymentMethod === "UPI" ? "ring-2 ring-indigo-300 scale-[1.02]" : ""}`}
              >
                ⚡ UPI
              </button>
            </div>

            <button
              onClick={() => checkout(paymentMethod)}
              className="w-full py-3 rounded-xl bg-[#3dd68c] text-black text-[14px] font-bold
                         shadow-[0_0_20px_rgba(61,214,140,0.3)] hover:brightness-110
                         transition-all active:scale-97 flex items-center justify-center gap-2"
            >
              ✓ &nbsp;Confirm & Print Bill
            </button>
          </div>
        </div>
      </div>

      <BillPreviewModal isOpen={showBill} onClose={() => setShowBill(false)}>
        <BillLayout
          billNo={billData?.billNo}
          paymentMethod={billData?.paymentMethod}
          cartItems={billData?.cartItems || []}
          subtotal={billData?.subtotal || 0}
          total={billData?.total || 0}
        />
      </BillPreviewModal>

      <CloseregisterModal
        isOpen={showCloseRegister}
        onClose={() => setShowCloseRegister(false)}
      />

      {/* ── TOAST ── */}
      <div
        className={`
          fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-50
          bg-[#1f2433] border border-[#3dd68c] text-[#3dd68c] px-5 py-2 rounded-xl
          text-sm font-medium whitespace-nowrap
          transition-all duration-250
          ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        {toast.msg}
      </div>

      {/* Keyframes for cart item animation */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.18s ease; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </div>
  );
}