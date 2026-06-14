import { useState, useEffect } from "react";
import { FEATURES } from "../../../utils/features";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import dashboardService from "../../../services/dashboardService";
import KitchenProduction from "../../Inventory/KitchenProduction/KitchenProduction";
import Branches from "../../Branches/Branches";
import Inventory from "../../Inventory/Inventory";
import BranchStock from "../../Inventory/Branch/BranchStock";
import Products from "../../Product/Product";
import UserManagement from "../../Users/UserManagement";
import SalesRegisterPlus from "../../POS/Sales";
import Expense from "../../Expenses/Expense";
import Profile from "../../profile/Profile";
import StockTransfer from "../../Inventory/Stocktransfer/Stocktransfer";
import CustomerMenu from "../../qrcode_order/CustomerMenu";
import TableMaster from "../../qrcode_order/TableMaster";
import KitchenOrders from "../../qrcode_order/KitchenOrders";
import Customerodertracking from "../../qrcode_order/Customerodertracking";
import Customerdisplay from "../../qrcode_order/Customerdisplay ";
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --p:#7C5CFC; --p2:#9B82FD; --p3:#5B3FDB;
    --bg:#0D0D12; --bg2:#13131C; --bg3:#1A1A26; --bg4:#22223A;
    --border:#2A2A42; --border2:#3A3A58;
    --t1:#F0EFFF; --t2:#A09CC0; --t3:#6B6890;
    --green:#22C87A; --red:#F45B69; --amber:#F5A623; --blue:#4A9EFF;
    --radius:14px; --radius-sm:8px;
    --sb-width:220px;
    font-family:'DM Sans',sans-serif;
  }
  html,body,#root { height:100%; background:var(--bg); color:var(--t1); }

  /* ── Layout ── */
  .dash { display:flex; min-height:100vh;width:100%; }

  /* ── Sidebar ── */
  .sidebar {
    background:var(--bg2);
    border-right:1px solid var(--border);
    width:var(--sb-width);
    height:100vh;
    position:sticky; top:0;
    display:flex; flex-direction:column; flex-shrink:0;
    overflow:hidden;
    transition: width 0.3s cubic-bezier(.4,0,.2,1);
  }
  .sidebar.collapsed {
    width:75px;
  }

  /* Logo area */
  .sb-logo { padding:0 12px; border-bottom:1px solid var(--border); flex-shrink:0; height:64px; display:flex; align-items:center; position:relative; }
  .sb-logo-inner { display:flex; align-items:center; width:100%; gap:10px; white-space:nowrap; overflow:hidden; }
  .sidebar.collapsed .sb-logo-inner { overflow: visible; justify-content:flex-start; padding-right:10px; }
  .logo-icon {
    width:32px; height:32px; flex-shrink:0;
    background:linear-gradient(135deg,var(--p),var(--p3));
    border-radius:8px; display:flex; align-items:center;
    justify-content:center; font-size:15px; font-weight:700; color:#fff;
  }
  .sb-logo-text { overflow:hidden; transition:opacity 0.2s, width 0.3s; opacity:1; }
  .sidebar.collapsed .sb-logo-text { opacity:0; width:0; display:none; }
  .logo-text { font-size:15px; font-weight:600; color:var(--t1); letter-spacing:-0.3px; white-space:nowrap; }
  .logo-sub  { font-size:11px; color:var(--t3); margin-top:1px; white-space:nowrap; }

  /* Sidebar toggle button */
  .sb-actions {
    margin-left:auto;
    position:static;
    transform:none;
    display:flex; gap:4px; flex-shrink:0;
    transition:opacity 0.2s;
  }
  .sidebar.collapsed .sb-actions {
    position:absolute;
    right:-5px;
    top:50%;
    transform:translateY(-50%);
    margin-left:0;
  }
  .sb-btn {
    width:30px; height:30px; border-radius:var(--radius-sm);
    background:var(--bg3); border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:var(--t2); font-size:13px;
    transition:all 0.15s; flex-shrink:0;
  }
  .sb-btn:hover { background:var(--p); color:#fff; border-color:var(--p); }

  .sb-nav { padding:10px 8px; flex:1; overflow-y:auto; overflow-x:hidden; }
  .nav-label {
    font-size:10px; font-weight:600; color:var(--t3);
    letter-spacing:1.5px; text-transform:uppercase;
    padding:4px 8px 8px; white-space:nowrap;
    overflow:hidden; transition:opacity 0.2s, height 0.3s;
    height:28px;
  }
  .sidebar.collapsed .nav-label { opacity:0; height:0; padding:0; }

  .nav-item {
    display:flex; align-items:center; gap:10px;
    padding:9px 10px; border-radius:var(--radius-sm);
    color:var(--t2); font-size:13.5px; font-weight:400;
    cursor:pointer; transition:all 0.15s; margin-bottom:2px;
    text-decoration:none; border:1px solid transparent;
    white-space:nowrap; overflow:hidden;
    position:relative;
  }
  .nav-item:hover { background:var(--bg3); color:var(--t1); }
  .nav-item.active {
    background:linear-gradient(135deg,rgba(124,92,252,0.2),rgba(91,63,219,0.1));
    color:var(--p2); border-color:rgba(124,92,252,0.25);
  }
  .nav-item i { font-size:16px; width:16px; flex-shrink:0; }
  .nav-item-label { transition:opacity 0.15s, width 0.3s; white-space:nowrap; }
  .sidebar.collapsed .nav-item-label { opacity:0; width:0; overflow:hidden; }
  .nav-badge {
    margin-left:auto; background:var(--red); color:#fff;
    font-size:10px; font-weight:600; padding:2px 6px; border-radius:20px; flex-shrink:0;
    transition:opacity 0.15s;
  }
  .sidebar.collapsed .nav-badge { opacity:0; }

  /* Collapsed tooltip on hover */
  .sidebar.collapsed .nav-item:hover::after {
    content: attr(data-label);
    position:absolute; left:calc(100% + 8px); top:50%; transform:translateY(-50%);
    background:var(--bg4); color:var(--t1);
    font-size:12px; font-weight:500; padding:5px 10px;
    border-radius:var(--radius-sm); border:1px solid var(--border);
    white-space:nowrap; pointer-events:none; z-index:999;
  }

  .sb-footer { padding:10px 8px; border-top:1px solid var(--border); flex-shrink:0; }
  .user-pill {
    display:flex; align-items:center; gap:10px; padding:8px 10px;
    border-radius:var(--radius-sm); background:var(--bg3);
    overflow:hidden; white-space:nowrap;
  }
  .user-avatar {
    width:30px; height:30px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,var(--p),var(--p3));
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:600; color:#fff;
  }
  .user-info { overflow:hidden; transition:opacity 0.2s, width 0.3s; opacity:1; }
  .sidebar.collapsed .user-info { opacity:0; width:0; }
  .user-name { font-size:13px; font-weight:500; color:var(--t1); }
  .user-role { font-size:11px; color:var(--t3); }

  /* ── Main ── */
.main {
  flex: 1;
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
  .topbar {
    padding:20px 28px 0;
    display:flex; justify-content:space-between;
    align-items:flex-start; gap:16px; flex-wrap:wrap;
  }
  .topbar-left { display:flex; align-items:center; gap:12px; }

  .greeting h1 { font-size:22px; font-weight:600; color:var(--t1); letter-spacing:-0.5px; }
  .greeting p  { font-size:13px; color:var(--t2); margin-top:2px; }
  .topbar-right { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .time-val { font-family:'DM Mono',monospace; font-size:18px; font-weight:500; color:var(--t1); letter-spacing:-0.5px; }
  .date-val { font-size:12px; color:var(--t3); margin-top:1px; text-align:right; }
  .restaurant-badge {
    display:flex; align-items:center; gap:8px;
    background:var(--bg3); border:1px solid var(--border);
    padding:8px 14px; border-radius:var(--radius-sm);
  }
  .rest-dot {
    width:8px; height:8px; border-radius:50%;
    background:var(--green); box-shadow:0 0 0 2px rgba(34,200,122,0.25);
    animation:pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100%{box-shadow:0 0 0 2px rgba(34,200,122,0.25);}
    50%{box-shadow:0 0 0 5px rgba(34,200,122,0.1);}
  }
  .rest-name { font-size:13px; font-weight:500; color:var(--t1); }
  .content { padding:20px 28px 40px; }

  /* ── KPI ── */
  .section-title {
    font-size:11px; font-weight:600; color:var(--t3);
    letter-spacing:1.5px; text-transform:uppercase;
    margin-bottom:14px; margin-top:4px;
  }
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .kpi-card {
    background:var(--bg2); border:1px solid var(--border);
    border-radius:var(--radius); padding:18px 20px;
    cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .kpi-card::before { content:''; position:absolute; inset:0; opacity:0; transition:opacity 0.2s; border-radius:var(--radius); }
  .kpi-card.sales::before  { background:linear-gradient(135deg,rgba(124,92,252,0.09),transparent); }
  .kpi-card.orders::before { background:linear-gradient(135deg,rgba(74,158,255,0.09),transparent); }
  .kpi-card.profit::before { background:linear-gradient(135deg,rgba(34,200,122,0.09),transparent); }
  .kpi-card.stock::before  { background:linear-gradient(135deg,rgba(245,166,35,0.09),transparent); }
  .kpi-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
  .kpi-card:hover::before { opacity:1; }
  .kpi-icon { width:36px; height:36px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:14px; }
  .kpi-icon.purple { background:rgba(124,92,252,0.15); color:var(--p2); }
  .kpi-icon.blue   { background:rgba(74,158,255,0.15); color:var(--blue); }
  .kpi-icon.green  { background:rgba(34,200,122,0.15); color:var(--green); }
  .kpi-icon.amber  { background:rgba(245,166,35,0.15); color:var(--amber); }
  .kpi-label { font-size:12px; color:var(--t3); font-weight:500; letter-spacing:0.3px; margin-bottom:6px; }
  .kpi-value { font-size:24px; font-weight:600; color:var(--t1); letter-spacing:-0.8px; margin-bottom:8px; }
  .kpi-trend { display:flex; align-items:center; gap:4px; font-size:12px; font-weight:500; }
  .trend-up   { color:var(--green); }
  .trend-down { color:var(--red); }
  .trend-label{ color:var(--t3); font-weight:400; }

  /* ── Grids ── */
  .grid2      { display:grid; grid-template-columns:3fr 2fr; gap:14px; margin-bottom:22px; align-items:start; }
  .grid2-equal{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:22px; align-items:start; }

  /* ── Card ── */
  .card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:20px; }
  .card-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px; }
  .card-title { font-size:14px; font-weight:600; color:var(--t1); }
  .card-sub   { font-size:12px; color:var(--t3); margin-top:2px; }
  .chart-total { font-size:28px; font-weight:600; color:var(--t1); letter-spacing:-1px; font-family:'DM Mono',monospace; }

  /* ── Tabs ── */
  .tab-group { display:flex; background:var(--bg3); border-radius:var(--radius-sm); padding:3px; }
  .tab { padding:5px 12px; border-radius:5px; font-size:12px; font-weight:500; color:var(--t3); cursor:pointer; transition:all 0.15s; border:none; background:transparent; }
  .tab.active { background:var(--bg); color:var(--t1); box-shadow:0 1px 4px rgba(0,0,0,0.3); }

  /* ── Rank / Top Sellers ── */
  .rank-item { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border); }
  .rank-item:last-child { border-bottom:none; }
  .rank-num { font-family:'DM Mono',monospace; font-size:11px; color:var(--t3); width:18px; }
  .rank-bar-wrap { flex:1; }
  .rank-name { font-size:13px; font-weight:500; color:var(--t1); margin-bottom:4px; }
  .rank-meta { font-size:11px; color:var(--t3); margin-bottom:4px; }
  .rank-bar { height:3px; background:var(--bg4); border-radius:2px; overflow:hidden; }
  .rank-bar-fill { height:100%; background:linear-gradient(90deg,var(--p),var(--p2)); border-radius:2px; transition:width 1.2s cubic-bezier(.4,0,.2,1); }
  .rank-rev { font-size:13px; font-weight:600; color:var(--t1); white-space:nowrap; font-family:'DM Mono',monospace; }

  /* ── Stock ── */
  .stock-row { display:flex; align-items:center; gap:12px; padding:9px 10px; border-radius:var(--radius-sm); margin-bottom:4px; transition:background 0.15s; }
  .stock-row:hover { background:var(--bg3); }
  .stock-name { flex:1; font-size:13px; color:var(--t2); }
  .stock-qty  { font-family:'DM Mono',monospace; font-size:13px; color:var(--t1); margin-right:4px; }

  /* ── Badges ── */
  .badge        { font-size:11px; font-weight:500; padding:3px 8px; border-radius:20px; }
  .badge-green  { background:rgba(34,200,122,0.15);  color:var(--green); }
  .badge-amber  { background:rgba(245,166,35,0.15);  color:var(--amber); }
  .badge-red    { background:rgba(244,91,105,0.15);  color:var(--red); }
  .badge-purple { background:rgba(124,92,252,0.15);  color:var(--p2); }
  .badge-blue   { background:rgba(74,158,255,0.15);  color:var(--blue); }

  /* ── P&L ── */
  .pnl-row  { display:flex; gap:8px; margin-bottom:14px; }
  .pnl-stat { background:var(--bg3); border-radius:var(--radius-sm); padding:12px; flex:1; }
  .pnl-label{ font-size:11px; color:var(--t3); margin-bottom:4px; }
  .pnl-val  { font-size:18px; font-weight:600; letter-spacing:-0.5px; font-family:'DM Mono',monospace; }

  /* ── Expenses ── */
  .exp-item { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--border); }
  .exp-item:last-child { border-bottom:none; }
  .exp-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .exp-name { flex:1; font-size:13px; color:var(--t2); }
  .exp-pct  { font-size:12px; color:var(--t3); margin-right:4px; }
  .exp-amt  { font-size:13px; font-weight:600; color:var(--t1); font-family:'DM Mono',monospace; }

  /* ── Expense split (donut) ── */
  .donut-wrap      { width:150px; height:150px; flex-shrink:0; position:relative; margin:0 auto 14px; }
  .donut-legend      { display:flex; flex-direction:column; gap:0; }
  .donut-legend-item { display:flex; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid var(--border); }
  .donut-legend-item:last-child { border-bottom:none; }
  .donut-dot         { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .donut-legend-name { flex:1; font-size:13px; color:var(--t2); }
  .donut-legend-pct  { font-size:12px; color:var(--t3); margin-right:4px; }

  /* ── Quick Actions ── */
  .actions-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:22px; }
  .action-btn {
    background:var(--bg2); border:1px solid var(--border);
    border-radius:var(--radius); padding:16px;
    display:flex; align-items:center; gap:12px;
    cursor:pointer; transition:all 0.2s; text-decoration:none; color:inherit;
  }
  .action-btn:hover { border-color:var(--p3); background:rgba(124,92,252,0.08); transform:translateY(-1px); box-shadow:0 4px 20px rgba(124,92,252,0.15); }
  .action-icon { width:36px; height:36px; border-radius:var(--radius-sm); background:rgba(124,92,252,0.15); color:var(--p2); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .action-label{ font-size:13px; font-weight:500; color:var(--t1); }
  .action-sub  { font-size:11px; color:var(--t3); margin-top:1px; }

  /* ── Responsive ── */
  @media(max-width:1100px) {
    .kpi-grid { grid-template-columns:repeat(2,1fr); }
    .grid2 { grid-template-columns:1fr; }
    .grid2-equal { grid-template-columns:1fr; }
    .actions-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media(max-width:600px) {
    .kpi-grid { grid-template-columns:1fr 1fr; }
    .actions-grid { grid-template-columns:1fr 1fr; }
    .content { padding:16px 16px 32px; }
    .topbar  { padding:16px 16px 0; }
  }
`;


// ─── Helper functions ─────────────────────────────────────────────────────────
function getProductName(product) {
  return (
    product.name || product.productName || product.itemName ||
    product.product_name || product.item_name || product.title ||
    product.label || product.product?.name || product.product?.title ||
    product.product?.label || product.item?.name || product.item?.title ||
    product.item?.label || 'Unknown'
  );
}

function getExpenseName(e) {
  return (
    e.name || e.label || e.category || e.categoryName || e.title ||
    e.type || e.head || e.expense_head || e.expenseHead || e.label_name ||
    (e.product && (e.product.name || e.product.title)) || 'Unknown'
  );
}

function generateColor(i) {
  const palette = ["#9B82FD","#5B3FDB","#4A9EFF","#22C87A","#F45B69","#F5A623","#FFD166","#8A6BFF"];
  return palette[i % palette.length];
}

function getProductCount(product) {
  return product.orders ?? product.quantity ?? product.sales ?? product.count ?? product.totalQty ?? product.value ?? product.amount ?? 0;
}

function getProductRevenue(product, formatter) {
  if (typeof product.revenue === 'number') return formatter.format(product.revenue);
  if (typeof product.amount === 'number') return formatter.format(product.amount);
  if (typeof product.total === 'number') return formatter.format(product.total);
  return product.revenue || product.amount || product.total || '';
}

function getStockName(s) {
  return (
    s.name || s.itemName || s.productName || s.product?.name ||
    s.item?.name || s.label || s.title || s.stockName || s.item_name || 'Unknown'
  );
}

function getStockQty(s) {
  return s.qty ?? s.quantity ?? s.amount ?? s.count ?? s.stock ?? s.available ?? s.value ?? '';
}

// ─── Chart configs ────────────────────────────────────────────────────────────
const salesOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (v) => "₹" + v.raw.toLocaleString("en-IN") } } },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#6B6890", font: { size: 11 } } },
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#6B6890", font: { size: 11 }, callback: (v) => "₹" + Math.round(v / 1000) + "k" } },
  },
};

const pnlOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (v) => v.dataset.label + ": ₹" + v.raw.toLocaleString("en-IN") } } },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#6B6890", font: { size: 10 } } },
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#6B6890", font: { size: 10 }, callback: (v) => "₹" + Math.round(v / 1000) + "k" } },
  },
};

const donutOptions = {
  responsive: true, maintainAspectRatio: false, cutout: "72%",
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (v) => v.label + ": ₹" + v.raw.toLocaleString("en-IN") } } },
};

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: "ti-receipt",        label: "Open POS",         sub: "Start taking orders",  page: "pos" },
  { icon: "ti-plus",           label: "Add Product",      sub: "Menu management",      page: "products" },
  { icon: "ti-user-plus",      label: "Add User",         sub: "Cashier or manager",   page: "staff" },
  { icon: "ti-building-store", label: "Add Branch",       sub: "Expand locations",     page: "branches" },
  { icon: "ti-package",        label: "Manage Inventory", sub: "Stock & reorders",     page: "inventory" },
  { icon: "ti-chart-bar",      label: "View Reports",     sub: "Full analytics",       page: null },
  
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ variant, iconClass, iconColor, label, value, trendUp, trendPct, trendSub }) {
  return (
    <div className={`kpi-card ${variant}`}>
      <div className={`kpi-icon ${iconColor}`}><i className={`ti ${iconClass}`} aria-hidden="true" /></div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-trend ${trendUp ? "trend-up" : "trend-down"}`}>
        <i className={`ti ${trendUp ? "ti-trending-up" : "ti-trending-down"}`} aria-hidden="true" />
        {trendPct} <span className="trend-label">{trendSub}</span>
      </div>
    </div>
  );
}

function Clock() {
  const [t, setT] = useState({ h: "--", m: "--", date: "--" });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setT({
        h: String(now.getHours()).padStart(2, "0"),
        m: String(now.getMinutes()).padStart(2, "0"),
        date: `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <div className="time-val">{t.h}:{t.m}</div>
      <div className="date-val">{t.date}</div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { section: null,      icon: "ti-layout-dashboard", label: "Dashboard", page: "dashboard" },
  { section: null,      icon: "ti-receipt",           label: "POS",       page: "pos",      badge: "Live", feature: "POS" },
  { section: "Manage",  icon: "ti-package",           label: "Inventory", page: "inventory",       badge: "12", feature: "INVENTORY" },
  { section: null,      icon: "ti-tools-kitchen-2",   label: "Products",  page: "products", feature: "PRODUCTS" },
  { section: null,      icon: "ti-users",             label: "Staff",     page: "staff", feature: "STAFF" },
  { section: null,      icon: "ti-building-store",    label: "Branches",  page: "branches", feature: "BRANCHES" },
  { section: "Insights",      icon: "ti-wallet",            label: "Expenses",  page: "expenses" },
  { section: "Insights",      icon: "ti-wallet",       label: "Customer",  page: "customer", feature: "QR_ORDER" },
  { section: "Insights",      icon: "ti-wallet",       label: "Table",  page: "table", feature: "TABLE_MASTER" },
  { section: "Insights",      icon: "ti-wallet",       label: "Kitchen",  page: "qkitchen", feature: "KITCHEN_DISPLAY" },
  { section: "Insights",      icon: "ti-wallet",       label: "Customer Display",  page: "customerdis", feature: "CUSTOMER_DISPLAY" },
];

function Sidebar({ collapsed, onToggle, onNav, activePage }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const features = FEATURES[user.plan] || [];
  const hasFeature = (feature) => !feature || features.includes(feature);

  let lastSection = null;
  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>

      {/* ── Logo + Min/Max buttons ── */}
      <div className="sb-logo">
        <div className="sb-logo-inner">
          <div className="logo-icon">N</div>
          <div className="sb-logo-text">
            <div className="logo-text">NextGenPOS</div>
            <div className="logo-sub">Restaurant Suite</div>
          </div>
          <div className="sb-actions">
            <div className="sb-btn sb-btn-toggle" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <i className={`ti ${collapsed ? "ti-layout-sidebar-left-expand" : "ti-layout-sidebar-left-collapse"}`} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav items ── */}
      <nav className="sb-nav">
        {NAV_ITEMS
          .filter(item => hasFeature(item.feature))
          .map((item, i) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <div key={i}>
              {showSection && <div className="nav-label">{item.section}</div>}
              <div
                className={`nav-item${activePage === item.page ? " active" : ""}`}
                data-label={item.label}
                onClick={() => item.page && onNav(item.page)}
              >
                <i className={`ti ${item.icon}`} aria-hidden="true" />
                <span className="nav-item-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Footer user pill ── */}
     <div
  className="user-pill"
  onClick={() => onNav("profile")}
  style={{ cursor: "pointer" }}
>
  <div className="user-avatar">
    {user?.username?.charAt(0)?.toUpperCase()}
  </div>

  <div className="user-info">
    <div className="user-name">
      {user?.username}
    </div>

    <div className="user-role">
      {user?.role}
    </div>
  </div>
</div>
    </aside>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage({ onNav }) {
    const user = JSON.parse(localStorage.getItem("user")) || {};  // ← add this

  const [salesTab, setSalesTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [salesChart, setSalesChart] = useState({ 1: null, 7: null, 30: null });
  const [topProducts, setTopProducts] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [expenses7Days, setExpenses7Days] = useState([]);
  const [expenses30Days, setExpenses30Days] = useState({ labels: [], amounts: [], colors: [] });

  const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      dashboardService.getSummary(),
      dashboardService.getSalesChart(1),
      dashboardService.getSalesChart(7),
      dashboardService.getSalesChart(30),
      dashboardService.getTopProducts(),
      dashboardService.getStockStatus(),
      dashboardService.getProfitLoss(30),
      dashboardService.get7DayExpenses(),
      dashboardService.get30DayExpenses(),
    ])
      .then(([summaryRes, sc1, sc7, sc30, topProds, stock, pl, exp7, exp30]) => {
        setSummary(summaryRes || null);
        setSalesChart({ 1: sc1 || null, 7: sc7 || null, 30: sc30 || null });
        setTopProducts(topProds || []);
        setStockStatus(stock || []);
        setProfitLoss(pl || null);
        setExpenses7Days(exp7 || []);
        if (exp30 && Array.isArray(exp30)) {
          const mapped = exp30.map((e, i) => {
            const raw = e.amount ?? e.value ?? e.amt ?? e.total ?? 0;
            const amount = typeof raw === 'number' ? raw : (Number(raw) || 0);
            return { label: getExpenseName(e), amount, color: e.color || generateColor(i) };
          });
          setExpenses30Days({
            labels: mapped.map(m => m.label),
            amounts: mapped.map(m => m.amount),
            colors: mapped.map(m => m.color),
          });
        } else if (exp30 && exp30.labels) {
          setExpenses30Days(exp30);
        } else {
          setExpenses30Days({ labels: [], amounts: [], colors: [] });
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message || "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  const daysMap = { today: 1, "7d": 7, "30d": 30 };
  const cur = salesChart[daysMap[salesTab]] || { labels: [], data: [], total: "", label: "" };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="greeting">
            <h1>Good Morning, {user.username}</h1>
            <p>Here's your restaurant performance at a glance</p>
          </div>
        </div>
        <div className="topbar-right">
         
          <Clock />
        </div>
      </div>

      <div className="content">
        {loading && <div style={{ color: 'var(--t3)', marginBottom: 12 }}>Loading dashboard data...</div>}
        {error && <div style={{ color: 'var(--red)', marginBottom: 12 }}>{error}</div>}

        {/* KPI */}
        <div className="section-title">Today's Snapshot</div>
        <div className="kpi-grid">
          <KpiCard
            variant="sales" iconClass="ti-currency-rupee" iconColor="purple"
            label="Today's Sales"
            value={summary ? formatter.format(summary.todaySales || 0) : '—'}
            trendUp trendPct={summary?.salesChangePct ? `${summary.salesChangePct}%` : ''}
            trendSub="vs yesterday"
          />
          <KpiCard
            variant="orders" iconClass="ti-shopping-bag" iconColor="blue"
            label="Today's Orders"
            value={summary ? (summary.todayOrders ?? '—') : '—'}
            trendUp trendPct={summary?.ordersChangePct ? `${summary.ordersChangePct}%` : ''}
            trendSub="vs yesterday"
          />
          <KpiCard
            variant="profit" iconClass="ti-report-money" iconColor="green"
            label="Today's Profit"
            value={summary ? formatter.format(summary.todayProfit || 0) : '—'}
            trendUp trendPct={summary?.profitChangePct ? `${summary.profitChangePct}%` : ''}
            trendSub="vs yesterday"
          />
          <KpiCard
            variant="stock" iconClass="ti-alert-triangle" iconColor="amber"
            label="Low Stock Alerts"
            value={summary ? `${summary.lowStockItems || 0} Items` : '—'}
            trendUp={false}
            trendPct={summary?.criticalLowCount ? `${summary.criticalLowCount} critical` : ''}
            trendSub="need reorder"
          />
        </div>

        {/* Sales Chart + Top Sellers */}
        <div className="grid2">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Sales Analytics</div>
                <div className="card-sub">{cur.label || ''}</div>
                <div className="chart-total">
                  {cur.total
                    ? (typeof cur.total === 'number' ? formatter.format(cur.total) : cur.total)
                    : (summary ? formatter.format(summary.todaySales || 0) : '')}
                </div>
              </div>
              <div className="tab-group">
                {["today", "7d", "30d"].map(t => (
                  <button key={t} className={`tab${salesTab === t ? " active" : ""}`} onClick={() => setSalesTab(t)}>
                    {t === "today" ? "Today" : t === "7d" ? "7 Days" : "30 Days"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: "relative", height: 200, marginTop: 18, paddingBottom: 10 }}>
              <Bar
                key={salesTab}
                data={{
                  labels: cur.labels || [],
                  datasets: [{
                    label: "Sales", data: cur.data || [],
                    backgroundColor: "rgba(124,92,252,0.72)",
                    borderRadius: 5, borderSkipped: false,
                    hoverBackgroundColor: "rgba(155,130,253,0.9)",
                  }]
                }}
                options={salesOptions}
                aria-label={`Sales chart — ${cur.label || ''}`}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div><div className="card-title">Top Sellers</div><div className="card-sub">By quantity today</div></div>
              <i className="ti ti-flame" style={{ color: "var(--amber)", fontSize: 18 }} aria-hidden="true" />
            </div>
            {topProducts.map((s, idx) => {
              const count = getProductCount(s);
              const maxCount = topProducts.length ? Math.max(...topProducts.map(getProductCount)) : 0;
              const pct = s.pct ?? (maxCount ? Math.round((count / maxCount) * 100) : 0);
              return (
                <div className="rank-item" key={s.id || s.rank || idx}>
                  <span className="rank-num">#{s.rank || idx + 1}</span>
                  <div className="rank-bar-wrap">
                    <div className="rank-name">{getProductName(s)}</div>
                    <div className="rank-meta">{count} orders</div>
                    <div className="rank-bar"><div className="rank-bar-fill" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <span className="rank-rev">{getProductRevenue(s, formatter)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* P&L + Stock Status */}
        <div className="grid2-equal">
          <div className="card">
            <div className="card-header"><div><div className="card-title">Profit & Loss</div><div className="card-sub">Last 30 days</div></div></div>
            <div className="pnl-row">
              <div className="pnl-stat">
                <div className="pnl-label">Total Sales</div>
                <div className="pnl-val" style={{ color: "var(--blue)" }}>
                  {profitLoss ? formatter.format(profitLoss.totalSales || 0) : '—'}
                </div>
              </div>
              <div className="pnl-stat">
                <div className="pnl-label">Expenses</div>
                <div className="pnl-val" style={{ color: "var(--red)" }}>
                  {profitLoss ? formatter.format(profitLoss.totalExpenses || 0) : '—'}
                </div>
              </div>
              <div className="pnl-stat">
                <div className="pnl-label">Net Profit</div>
                <div className="pnl-val" style={{ color: "var(--green)" }}>
                  {profitLoss ? formatter.format(profitLoss.netProfit || 0) : '—'}
                </div>
              </div>
            </div>
            <div style={{ position: "relative", height: 180 }}>
              <Bar
                data={{
                  labels: ["Last 30d"],
                  datasets: [
                    { label: "Sales",    data: [profitLoss?.totalSales || 0],    backgroundColor: "rgba(74,158,255,0.75)" },
                    { label: "Expenses", data: [profitLoss?.totalExpenses || 0], backgroundColor: "rgba(244,91,105,0.75)" },
                    { label: "Profit",   data: [profitLoss?.netProfit || 0],     backgroundColor: "rgba(34,200,122,0.75)" },
                  ]
                }}
                options={pnlOptions}
              />
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header"><div><div className="card-title">Stock Status</div><div className="card-sub">Current inventory</div></div></div>
            <div style={{ flex: 1 }}>
              {stockStatus.map((s, idx) => {
                const badge = s.badge || (
                  s.status?.toLowerCase().includes('low') ? 'badge-red' :
                  s.status?.toLowerCase().includes('medium') ? 'badge-amber' : 'badge-green'
                );
                return (
                  <div className="stock-row" key={s.id || getStockName(s) || idx}>
                    <span className="stock-name">{getStockName(s)}</span>
                    <span className="stock-qty">{getStockQty(s)}</span>
                    <span className={`badge ${badge}`}>{s.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 7-Day Expenses + Expense Split */}
        <div className="grid2-equal">
          <div className="card">
            <div className="card-header">
              <div><div className="card-title">7-Day Expenses</div><div className="card-sub">Category breakdown</div></div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 18, fontWeight: 600, color: "var(--t1)" }}>
                {summary ? formatter.format(summary.expenses7 || 0) : '—'}
              </div>
            </div>
            {expenses7Days.map((e, idx) => (
              <div className="exp-item" key={`${getExpenseName(e)}_${idx}`}>
                <div className="exp-dot" style={{ background: e.color || '#9B82FD' }} />
                <div className="exp-name">{getExpenseName(e)}</div>
                <div className="exp-pct">
                  {e.pct || (e.amount && summary ? `${Math.round((e.amount / (summary.expenses7 || 1)) * 100)}%` : '')}
                </div>
                <div className="exp-amt">
                  {typeof e.amt === 'number' || typeof e.amount === 'number'
                    ? formatter.format(e.amt || e.amount)
                    : (e.amt || e.amount || '')}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div><div className="card-title">Expense Split</div><div className="card-sub">Last 30 days</div></div>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ width: 140, height: 140, flexShrink: 0 }}>
                {expenses30Days?.amounts && (
                  <Doughnut
                    data={{
                      labels: expenses30Days.labels || [],
                      datasets: [{ data: expenses30Days.amounts || [], backgroundColor: expenses30Days.colors || [], borderWidth: 0, hoverOffset: 4 }]
                    }}
                    options={donutOptions}
                    aria-label="Expense donut chart"
                  />
                )}
              </div>
              <div className="donut-legend" style={{ flex: 1 }}>
                {(expenses30Days.labels || []).map((l, i) => {
                  const amt = (expenses30Days.amounts && expenses30Days.amounts[i]) || 0;
                  const total = (expenses30Days.amounts || []).reduce((a, b) => a + (b || 0), 0) || 1;
                  return (
                    <div className="donut-legend-item" key={l}>
                      <div className="donut-dot" style={{ background: (expenses30Days.colors || [])[i] || '#9B82FD' }} />
                      <span className="donut-legend-name">{l}</span>
                      <span className="donut-legend-pct">{Math.round((amt / total) * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-title">Quick Actions</div>
        <div className="actions-grid">
          {QUICK_ACTIONS.map(a => (
            <div className="action-btn" key={a.label} onClick={() => a.page && onNav(a.page)}>
              <div className="action-icon"><i className={`ti ${a.icon}`} aria-hidden="true" /></div>
              <div>
                <div className="action-label">{a.label}</div>
                <div className="action-sub">{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [sbCollapsed, setSbCollapsed] = useState(false);
  const [activePage,  setActivePage]  = useState("dashboard");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const features = FEATURES[user.plan] || [];

  const handleNav = (page) => {
      console.log("Clicked:", page);

    if (page) setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "qkitchen":
        if (!features.includes("KITCHEN_DISPLAY")) {
          return (
            <div style={{ padding: 24, color: "#E2E8F0" }}>
              Upgrade to PRO Plan
            </div>
          );
        }
        return <KitchenOrders />;
      case "customerdis":
        if (!features.includes("CUSTOMER_DISPLAY")) {
          return (
            <div style={{ padding: 24, color: "#E2E8F0" }}>
              Upgrade to PRO Plan
            </div>
          );
        }
        return <Customerdisplay />;
      case "qtracking":
        if (!features.includes("QR_ORDER")) {
          return (
            <div style={{ padding: 24, color: "#E2E8F0" }}>
              Upgrade to PRO Plan
            </div>
          );
        }
        return <CustomerMenu />;
      case "pos":
        return <SalesRegisterPlus />;
      case "customer":
        if (!features.includes("QR_ORDER")) {
          return (
            <div style={{ padding: 24, color: "#E2E8F0" }}>
              Upgrade to PRO Plan
            </div>
          );
        }
        return <CustomerMenu />;
      case "table":
        if (!features.includes("TABLE_MASTER")) {
          return (
            <div style={{ padding: 24, color: "#E2E8F0" }}>
              Upgrade to PRO Plan
            </div>
          );
        }
        return <TableMaster />;
      case "inventory":
  return <Inventory navigate={handleNav} />;

case "branchstock":
  return <BranchStock />;

case "stocktransfer":
  return <StockTransfer />;

case "kitchen":
  return <KitchenProduction />;  
 case "branches":
  return <Branches />;
  case "products":
  return <Products />; 
  case "expenses":
  return <Expense />;
  case "staff":
  return <UserManagement />;
  case "profile":
    return <Profile />;
      case "dashboard":
      default:
        return <DashboardPage onNav={handleNav} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="dash">
        {/* Sidebar — always present, collapses to icon rail */}
        <Sidebar
          collapsed={sbCollapsed}
          onToggle={() => setSbCollapsed(c => !c)}
          onNav={handleNav}
          activePage={activePage}
        />

        {/* Right content area — swaps page, never disappears */}
        <main className="main">
          {renderPage()}
        </main>
      </div>
    </>
  );
}