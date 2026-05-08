import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import Navbar from "./components/Navbar";
import Auth from "./components/auth";

// Dashboard
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard/dashboard/Dashboard";
import Reports from "./pages/Dashboard/Reports/Reports";
import SalesOperation from "./pages/Dashboard/sales/SalesOperation";
import FinanceOperation from "./pages/Dashboard/Finance/FinanceOperation";
import InventoryOperation from "./pages/Dashboard/items/InventoryOperation";
import Setting from "./pages/Dashboard/Settting/Setting";
import RolesPermissions from "./pages/Dashboard/Settting/roles/RolesPermissions";
import Bill from "./pages/Dashboard/Reports/Bill";
import MultipleBills from "./pages/Dashboard/Reports/MultipleBills";
import Customerrecord from "./pages/Dashboard/Reports/Customerrecord";

// Other Pages
import Stock from "./pages/Stock/Stock";
import Sales from "./pages/Sales/Sales";
import Fianance from "./pages/Finance/Fianance";

import Salesregister from "./pages/Sales/Sale/Salesregister";
import Salesreport from "./pages/Sales/Sale/Salesreport";
import Salesedit from "./pages/Sales/Sale/Salesedit";

import Customerregister from "./pages/Sales/Customer/Customerregister";
import Customerreport from "./pages/Sales/Customer/Customerreport";
import Customerupadate from "./pages/Sales/Customer/Customeredit";

import Itemregister from "./pages/Stock/Item/Itemregister";
import Itemreport from "./pages/Stock/Item/Itemreport";
import Itemedit from "./pages/Stock/Item/Itemedit";

import Payment from "./pages/Finance/Payment/Payment_register/Payment";
import Paymentedit from "./pages/Finance/Payment/Payment_edit/Paymentedit";
import Paymentreport from "./pages/Finance/Payment/Payment_report/Paymentreport";

import Expenseregister from "./pages/Finance/Expense/Expenseregister";
import Expensereport from "./pages/Finance/Expense/Expensereport";
import Expenseedit from "./pages/Finance/Expense/Expenseedit";

// Utils
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/profile/Profile";

// Wrapper
const PageWrapper = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen w-full">
      <div className={isLogin ? "" : isHome ? "" : "pt-24"}>
        {children}
      </div>
    </div>
  );
};

function App() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <>
      {!isLogin && <Navbar />}

      <PageWrapper>
        <ScrollToTop />

        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<Auth />} />

          {/* HOME */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* STOCK */}
          <Route
            path="/stock"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Stock />
              </ProtectedRoute>
            }
          />
          <Route path="/stock/itemregister" element={<Itemregister />} />
          <Route path="/stock/itemreport" element={<Itemreport />} />
          <Route path="/stock/itemupdate" element={<Itemedit />} />

          {/* SALES */}
          <Route
            path="/sale"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route path="/sales/salesregister" element={<Salesregister />} />
          <Route path="/sales/salesreport" element={<Salesreport />} />
          <Route path="/sales/salesupadate" element={<Salesedit />} />

          {/* CUSTOMER */}
          <Route path="/sales/customerregister" element={<Customerregister />} />
          <Route path="/sales/customerreport" element={<Customerreport />} />
          <Route path="/sales/customeredit" element={<Customerupadate />} />

          {/* FINANCE */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Fianance />
              </ProtectedRoute>
            }
          />
          <Route path="/fianance/paymentregister" element={<Payment />} />
          <Route path="/fianance/paymentedit" element={<Paymentedit />} />
          <Route path="/fianance/paymentreport" element={<Paymentreport />} />

          {/* EXPENSE */}
          <Route path="/fianance/expenseregister" element={<Expenseregister />} />
          <Route path="/fianance/expensereport" element={<Expensereport />} />
          <Route path="/fianance/expenseedit" element={<Expenseedit />} />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
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
            <Route path="settings/collaborators" element={<RolesPermissions />} />
          </Route>

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
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