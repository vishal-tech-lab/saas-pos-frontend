import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Pages

// Dashboard
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard/dashboard/Dashboard";
import Reports from "./pages/Dashboard/Reports/Reports";

import Setting from "./pages/Dashboard/Settting/Setting";
import Bill from "./pages/Dashboard/Reports/Bill";
import MultipleBills from "./pages/Dashboard/Reports/MultipleBills";
import Customerrecord from "./pages/Dashboard/Reports/Customerrecord";

// Other Pages




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
import StockTransfer from "./pages/Inventory/Stocktransfer/Stocktransfer";
import CustomerMenu from "./pages/qrcode_order/CustomerMenu";
import Customerodertracking from "./pages/qrcode_order/Customerodertracking";
import CustomerDisplay from "./pages/qrcode_order/Customerdisplay ";
import KitchenOrders from "./pages/qrcode_order/KitchenOrders";
import TenantCreation from "./pages/SuperAdmin/TenantCreation";
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

          {/* HOME */}
       <Route
 path="/"
 element={<Auth />}
/>
<Route
  path="/superadmin/create-tenant"
  element={<TenantCreation />}
/>
          {/* QR CODE ORDER */}
<Route
  path="/order/:tenant/table/:tableId"
  element={<CustomerMenu />}
/>
<Route
  path="/order-status/:orderId"
  element={<Customerodertracking />}
/>

<Route
  path="/display/:tenant/:branchId"
  element={<CustomerDisplay />}
/>


<Route
  path="/kitchen/:tenant/:branchId"
  element={<KitchenOrders />}
/>                {/* STOCK */}
         
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