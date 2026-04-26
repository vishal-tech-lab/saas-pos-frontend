import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  FileText,
  Package,
  Users,
  ShoppingCart,
  ChevronRight,
  Leaf,
  Settings,
  Menu,
  X,
} from "lucide-react";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-500",
      description: "Analytics & Overview",
    },
    {
      path: "/dashboard/reports",
      name: "Reports",
      icon: <FileText className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      description: "Business Reports",
    },
    {
      path: "/dashboard/InventoryOperation",
      name: "Items",
      icon: <Package className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
      description: "Vegetable Inventory",
    },
    {
      path: "/dashboard/salesopeartion",
      name: "Sales",
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "from-teal-500 to-cyan-500",
      description: "Sales Operations",
    },
    {
      path: "/dashboard/FinanceOperation",
      name: "Finance",
      icon: <Users className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      description: "Payment Management",
    },
    {
      path: "/dashboard/settings",
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
      color: "from-slate-500 to-slate-700",
      description: "Admin Controls",
    },
  ];

  const isActiveRoute = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <motion.div
  initial={{ x: -30 }}
  animate={{ x: 0 }}
  className={`relative h-[calc(100vh-6rem)] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-500 shadow-2xl ${
    isCollapsed ? "w-16" : "w-64"
  }`}
>
      {/* HEADER */}
      <div className="relative z-10 px-3 py-4 border-b border-slate-700/60 shrink-0">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <motion.div layout className="flex items-center gap-2">
            <motion.div
              animate={{
                width: isCollapsed ? 32 : 40,
                height: isCollapsed ? 32 : 40,
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md"
            >
              <Leaf
                className={`${
                  isCollapsed ? "w-4 h-4" : "w-6 h-6"
                } text-white`}
              />
            </motion.div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="text-xl font-bold">GVV</h1>
                  <p className="text-xs text-slate-400">
                    Vegetable Wholesale
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* TOGGLE */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-700"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>

      {/* NAV ITEMS */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        <AnimatePresence>
          {menuItems.map((item, index) => {
            const isActive = isActiveRoute(item.path);

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`block ${
                    isActive ? "translate-x-1" : "hover:translate-x-1"
                  }`}
                >
                  <motion.div
                    className={`flex items-center rounded-xl px-3 py-3 transition ${
                      isActive
                        ? `bg-gradient-to-r ${item.color}`
                        : "hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {item.icon}
                    </div>

                    {!isCollapsed && (
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {!isCollapsed && (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </nav>

      {/* DECORATION */}
      <div className="absolute top-20 right-4 w-12 h-12 bg-green-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-4 w-8 h-8 bg-blue-500/10 rounded-full blur-lg"></div>
    </motion.div>
  );
}

export default Sidebar;