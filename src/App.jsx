import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages

// Dashboard
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard/dashboard/Dashboard";
import Reports from "./pages/Dashboard/Reports/Reports";
import SalesOperation from "./pages/Dashboard/sales/SalesOperation";
import FinanceOperation from "./pages/Dashboard/Finance/FinanceOperation";
import InventoryOperation from "./pages/Dashboard/items/InventoryOperation";
import Setting from "./pages/Dashboard/Settting/Setting";
import Bill from "./pages/Dashboard/Reports/Bill";
import MultipleBills from "./pages/Dashboard/Reports/MultipleBills";
import Customerrecord from "./pages/Dashboard/Reports/Customerrecord";

// Other Pages
import Fianance from "./pages/Finance/Fianance";



import Payment from "./pages/Finance/Payment/Payment_register/Payment";
import Paymentedit from "./pages/Finance/Payment/Payment_edit/Paymentedit";
import Paymentreport from "./pages/Finance/Payment/Payment_report/Paymentreport";

import Expensereport from "./pages/Finance/Expense/Expensereport";
import Expenseedit from "./pages/Finance/Expense/Expenseedit";
import ProtectedRoute from "./components/ProtectedRoute";

// Utils
import ScrollToTop from "./components/ScrollToTop";
import Profile from "./pages/profile/Profile";
import Dailysales from "./pages/dailysales/Dailysales";
import Branches from "./pages/Branches/Branches";
import KitchenProduction from "./pages/Inventory/KitchenProduction/KitchenProduction";
import BranchStock from "./pages/Inventory/Branch/BranchStock";

import Auth from "./components/auth";
import Inventory from "./pages/Inventory/Inventory";
import Product from "./pages/Product/Product";
import TenantLogin from "./components/TenantLogin";
import StockTransfer from "./pages/Inventory/Stocktransfer/Stocktransfer";

// Wrapper
const PageWrapper = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname.startsWith("/login");
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen w-full">
      <div className="">
        {children}
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  const isLogin = location.pathname.startsWith("/login");

  return (
    <>
      {!isLogin }

      <PageWrapper>
        <ScrollToTop />

        <Routes>
          {/* LOGIN */}
          <Route path="/login/:tenantId" element={<Auth />} />

          {/* HOME */}
          <Route
  path="/"
  element={<TenantLogin />}
/>

          {/* STOCK */}
         
{/* INVENTORY */}
<Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CASHIER"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route path="/inventory/branchstock" element={<BranchStock />} />
          <Route path="/inventory/stocktransfer" element={<StockTransfer/>} />
          <Route path="/inventory/kitchenproduction" element={<KitchenProduction />} />

{/* Product */}
          <Route path="/product/addproduct" element={<Product />} />
        
{/* BRANCHES */}
          <Route path="/branches" element={<Branches />} />



          {/* FINANCE */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CASHIER"]}>
                <Fianance />
              </ProtectedRoute>
            }
          />
          <Route path="/fianance/paymentregister" element={<Payment />} />
          <Route path="/fianance/paymentedit" element={<Paymentedit />} />
          <Route path="/fianance/paymentreport" element={<Paymentreport />} />

          {/* EXPENSE */}
          <Route path="/fianance/expensereport" element={<Expensereport />} />
          <Route path="/fianance/expenseedit" element={<Expenseedit />} />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CASHIER", "ROLE_KITCHEN"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="bill" element={<Bill />} />
            <Route path="reports/mutiplebill" element={<MultipleBills />} />
            <Route path="reports/customerrecord" element={<Customerrecord />} />
            <Route path="salesopeartion" element={<SalesOperation />} />
            <Route path="InventoryOperation" element={<InventoryOperation />} />
            <Route path="FinanceOperation" element={<FinanceOperation />} />
            <Route path="settings" element={<Setting />} />
            <Route path="reports/Dailysales" element={<Dailysales />} />
          </Route>

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_CASHIER", "ROLE_KITCHEN"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </PageWrapper>
    </>
  );
}

export default App;