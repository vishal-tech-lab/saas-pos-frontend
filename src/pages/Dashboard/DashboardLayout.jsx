import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Content area (NO pt-24 here) */}
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default DashboardLayout;