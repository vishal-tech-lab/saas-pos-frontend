import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Download,
  Edit,
  Users,
  FileText,
  TrendingUp,
  Receipt,
  UserPlus,
  Database,
  Settings,
  ShoppingCart,
  BarChart3
} from 'lucide-react';

function Sales() {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const salesCards = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Register Sale",
      description: "Create a new sales entry with customer details",
      buttonText: "Register",
      onClick: () => navigate("/sales/salesregisterplus"),
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Download Report",
      description: "Generate and download sales reports",
      buttonText: "Download",
      onClick: () => navigate("/sales/salesreport"),
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: <Edit className="w-6 h-6" />,
      title: "Sales Update",
      description: "Edit or delete sales records from database",
      buttonText: "Edit",
      onClick: () => navigate("/sales/salesupadate"),
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    }
  ];

  const customerCards = [
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: "Customer Register",
      description: "Add new customers to your database",
      buttonText: "Register",
      onClick: () => navigate("/sales/customerregister"),
      gradient: "from-teal-500 to-cyan-500",
      bgGradient: "from-teal-50 to-cyan-50"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Customer Report",
      description: "View and download customer reports",
      buttonText: "Download",
      onClick: () => navigate("/sales/customerreport"),
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Customer Update",
      description: "Edit or manage existing customer data",
      buttonText: "Edit",
      onClick: () => navigate("/sales/customeredit"),
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-50 to-purple-50"
    }
  ];

  // Stats for consistency
  const stats = [
    { 
      title: "Total Sales", 
      value: "₹0", 
      icon: <TrendingUp className="w-6 h-6" />, 
      color: "from-green-500 to-emerald-500", 
      change: "Today" 
    },
    { 
      title: "Active Customers", 
      value: "0", 
      icon: <Users className="w-6 h-6" />, 
      color: "from-emerald-500 to-teal-500", 
      change: "Registered" 
    },
    { 
      title: "Sales Reports", 
      value: "0", 
      icon: <FileText className="w-6 h-6" />, 
      color: "from-teal-500 to-green-500", 
      change: "Generated" 
    },
    { 
      title: "Monthly Growth", 
      value: "+0%", 
      icon: <BarChart3 className="w-6 h-6" />, 
      color: "from-green-600 to-emerald-600", 
      change: "This Month" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* ✅ GREEN Background (Same as other pages) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
              <span className="text-green-600">Sales Management</span>
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Comprehensive sales and customer management system for your business
          </p>
        </motion.div>
      
        {/* Sales Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3 mb-8"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">
              <span className="text-green-600">SALES</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {salesCards.map((card, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`group bg-gradient-to-br ${card.bgGradient} backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden`}
              >
                {/* Card gradient overlay */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`w-full h-full bg-gradient-to-br ${card.gradient}`}></div>
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`bg-gradient-to-r ${card.gradient} text-white p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    {card.icon}
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={card.onClick}
                    className={`w-full px-6 py-3 bg-gradient-to-r ${card.gradient} hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300`}
                  >
                    {card.buttonText}
                  </motion.button>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-10">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-full`}></div>
                </div>
                <div className="absolute bottom-4 left-4 opacity-10">
                  <div className={`w-8 h-8 bg-gradient-to-r ${card.gradient} rounded-full`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customer Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3 mb-8"
          >
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-3 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">
              <span className="text-teal-600">CUSTOMER</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {customerCards.map((card, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`group bg-gradient-to-br ${card.bgGradient} backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden`}
              >
                {/* Card gradient overlay */}
                <div className="absolute inset-0 opacity-5">
                  <div className={`w-full h-full bg-gradient-to-br ${card.gradient}`}></div>
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`bg-gradient-to-r ${card.gradient} text-white p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    {card.icon}
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={card.onClick}
                    className={`w-full px-6 py-3 bg-gradient-to-r ${card.gradient} hover:shadow-lg text-white rounded-xl font-semibold transition-all duration-300`}
                  >
                    {card.buttonText}
                  </motion.button>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-10">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-full`}></div>
                </div>
                <div className="absolute bottom-4 left-4 opacity-10">
                  <div className={`w-8 h-8 bg-gradient-to-r ${card.gradient} rounded-full`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ✅ GREEN Floating Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-16 h-16 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-12 h-12 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default Sales;
