import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Calendar,
  BarChart3,
  PieChart,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw
} from "lucide-react";
import instances from "../../../components/axios";
import PaymentExpenseChart from "../../../components/PaymentExpenseChart";

function Dashboard() {
  const [range, setRange] = useState("today");
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    customerPayment: 0,
    expense: 0,
    revenue: 0,
    customerBalance: 0,
    salesCount: 0,
    top5AllTimeVegetables: [],
  });
  const [chartData, setChartData] = useState([]);
  const [customebalance, setCustomerbalance] = useState(0);
  const [customerTable, setCustomerTable] = useState([]);
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
const [topCustomers, setTopCustomers] = useState([]);
const [topVegetables, setTopVegetables] = useState([]);
  // Set today's date
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = (rangeValue) => {
    setIsLoading(true);
    instances
      .get(`/calculate/dashboard?range=${rangeValue}`)
      .then((res) => setDashboardData(res.data))
      .catch((err) => console.error("Cannot fetch dashboard data", err))
      .finally(() => setIsLoading(false));
  };

  // Fetch chart data
  const fetchChartData = (rangeValue) => {
    instances
      .get(`/calculate/dashboard/payment-expense-chart?range=${rangeValue}`)
      .then((res) => setChartData(res.data))
      .catch((err) => console.error("Cannot fetch chart data", err));
  };

  // Fetch customer table
  const fetchTopCustomers = () => {
  instances
    .get("/calculate/dashboard/top5customers")
    .then((res) => setTopCustomers(res.data))
    .catch((err) => console.error("Cannot fetch top customers", err));
};

const fetchTopVegetables = () => {
  instances
    .get("/calculate/dashboard/top5vegetables")
    .then((res) => setTopVegetables(res.data))
    .catch((err) => console.error("Cannot fetch vegetables", err));
};

  useEffect(() => {
    instances
      .get("/calculate/dashboard/customerbalance")
      .then((res) => setCustomerbalance(res.data))
      .catch((err) => console.error("Cannot fetch customer total balance", err));
  }, []);

  // Trigger fetch on mount and when range changes
  useEffect(() => {
  fetchDashboardData(range);
  fetchChartData(range);
  fetchTopCustomers();
  fetchTopVegetables();
}, [range]);

  // Stats for cards
  const stats = [
    {
      title: "Total Earnings",
      value: `₹${dashboardData.revenue?.toLocaleString() || 0}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      change: "+12.5%",
      trend: "up"
    },
    {
      title: "Total Sales",
      value: `₹${dashboardData.totalSales?.toLocaleString() || 0}`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      change: "+8.2%",
      trend: "up"
    },
    {
      title: "Customer Balance",
      value: `₹${dashboardData.customerBalance?.toLocaleString() || 0}`,
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      change: "+15.3%",
      trend: "up"
    },
    {
      title: "Sales Count",
      value: dashboardData.salesCount?.toString() || "0",
      icon: <Package className="w-6 h-6" />,
      color: "from-orange-500 to-red-500",
      change: "+6.7%",
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* ✅ Beautiful Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-300/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-green-200/10 to-emerald-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* ✅ SECTION 1: Header + Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Vegetable Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[radial-gradient(circle_at_30%_40%,_theme(colors.white)_2px,_transparent_2px)] bg-[length:60px_60px]"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-black text-white mb-2"
              >
                Welcome back! <span className="text-yellow-300">GVV Dashboard</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-green-100 text-lg font-medium"
              >
                Fresh vegetable business insights & analytics dashboard
              </motion.p>
            </div>
            
            {/* Date Picker */}
            
          </div>
        </motion.div>

        {/* ✅ SECTION 2: Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              
              <div>
                <p className="text-slate-600 font-medium text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-black text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-800 group-hover:to-slate-600 group-hover:bg-clip-text transition-all duration-300">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ✅ SECTION 3: Chart + Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Revenue Analytics</h3>
                <p className="text-slate-600">Payment & expense trends over time</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl px-4 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="today">Today</option>
                <option value="thisweek">This Week</option>
                <option value="thismonth">This Month</option>
                <option value="last1month">Last 1 Month</option>
                <option value="last6month">Last 6 Months</option>
                <option value="last1year">Last 1 Year</option>
              </select>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  fetchDashboardData(range);
                  fetchChartData(range);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </motion.button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
            {isLoading && !dashboardData.totalSales ? (
              <div className="h-80 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-slate-600 font-medium">Loading chart data...</span>
                </div>
              </div>
            ) : (
              <PaymentExpenseChart data={chartData} />
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ✅ SECTION 4: Top Vegetables */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Top 5 Vegetables</h3>
                <p className="text-slate-600">All-time most sold vegetables</p>
              </div>
            </div>

            <div className="space-y-4">
              {topVegetables&& topVegetables.length > 0 ? (
                topVegetables.map((vegetable, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-slate-800 font-semibold">{vegetable}</span>
                    </div>
                    <Leaf className="w-5 h-5 text-green-500" />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🥬</div>
                  <p className="text-slate-600">No vegetable sales data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ✅ SECTION 5: Customer Balance Table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Customer Balances</h3>
                  <p className="text-slate-600">Total: ₹{customebalance?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Customer Name</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white/80">
                  <AnimatePresence>
                    {topCustomers.map((customer, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.9 }}
                        className="hover:bg-purple-50/50 transition-colors duration-200 border-b border-slate-100"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {customer.customername?.charAt(0)?.toUpperCase() || 'C'}
                              </span>
                            </div>
                            <span className="text-slate-800 font-semibold">{customer.customername}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${
                            parseFloat(customer.balance) > 0 ? 'text-green-600' : 'text-red-500'
                          }`}>
                            ₹{parseFloat(customer.balance)?.toLocaleString() || '0'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {topCustomers.length === 0 && (
                <div className="text-center py-8 bg-white/80">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-slate-600">No customer balance data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✅ Floating Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-16 h-16 bg-purple-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-12 h-12 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default Dashboard;
