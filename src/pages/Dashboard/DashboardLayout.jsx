import React, { useState } from "react";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Outlet />
    </div>
  );
}

export default DashboardLayout;