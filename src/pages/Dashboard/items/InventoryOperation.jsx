import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, Edit, Package,
  Warehouse, ArrowRight, Eye
} from 'lucide-react';

function InventoryOperation() {
  const navigate = useNavigate();

  const reportCategories = [
    {
      title: "Inventory",
      description: "Stock and inventory management",
      color: "from-green-500 to-emerald-500",
      icon: <Warehouse className="w-8 h-8" />,
      reports: [
        {
          name: "Item Register",
          description: "Add new items to your inventory database",
          path: "/stock/itemregister",
          icon: <Plus className="w-5 h-5" />,
          color: "from-green-500 to-emerald-500"
        },
        {
          name: "Item Report",
          description: "Generate and download inventory reports",
          path: "/stock/itemreport",
          icon: <Download className="w-5 h-5" />,
          color: "from-blue-500 to-indigo-500"
        },
        {
          name: "Item Update",
          description: "Edit or manage existing inventory items",
          path: "/stock/itemupdate",
          icon: <Edit className="w-5 h-5" />,
          color: "from-purple-500 to-pink-500"
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const categoryVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };
  const reportVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center mb-12 w-full"
        >
          <div className="flex items-center justify-center gap-5 mb-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl flex-shrink-0"
            >
              <Warehouse className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text leading-tight">
              Inventory Operations
            </h1>
          </div>
          <p className="text-slate-600 text-sm md:text-base font-medium text-center max-w-2xl">
            Complete inventory management system for your vegetable wholesale business
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {reportCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              variants={categoryVariants}
              className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`bg-gradient-to-r ${category.color} p-4 rounded-2xl shadow-lg`}>
                  <div className="text-white">{category.icon}</div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{category.title}</h2>
                  <p className="text-slate-600 font-medium">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {category.reports.map((report, reportIndex) => (
                    <motion.div
                      key={reportIndex}
                      variants={reportVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: categoryIndex * 0.1 + reportIndex * 0.05 }}
                      whileHover={{ scale: 1.05, y: -10,
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(report.path)}
                      className="group cursor-pointer"
                    >
                      <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`bg-gradient-to-r ${report.color} p-3 rounded-xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            <div className="text-white">{report.icon}</div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 group-hover:bg-clip-text transition-all duration-300">
                            {report.name}
                          </h3>
                          <p className="text-slate-600 text-sm font-medium">{report.description}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/50">
                          <button className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors duration-300">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-semibold">Open</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="fixed top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-16 h-16 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-12 h-12 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default InventoryOperation;