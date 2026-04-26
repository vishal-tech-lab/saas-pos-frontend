import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, User, Receipt, Search, Calculator, DollarSign, 
  ArrowLeft, Sparkles, FileText, TrendingUp, CreditCard,
  Package, Weight, Banknote, ShoppingBag, Eye, Download,
  CheckCircle, AlertCircle, Users, FileBarChart, X,
  Filter, Leaf
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../components/ui/card';
import { format } from 'date-fns';
import ReportPreviewModal from '../../../components/report/ReportPreviewModal';
import ReportLayout from '../../../components/report/ReportLayout';
import instances from '../../../components/axios';

function Bill() {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [customername, setCustomername] = useState('');
  const [totalsales, setTotalSales] = useState([]);
  const [searchterm, setSearchTerm] = useState('');
  const [yesterBalance, setYesterdayBalance] = useState(0);
  const [todayPayments, setTodayPayments] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [billNo, setBillNo] = useState('');
  
  // ✅ Report Preview States
  const reportRef = useRef(null);
  const [openPreview, setOpenPreview] = useState(false);

  // ✅ Indian Rupee Formatting Function
  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };
 
    // Calculations
    const subtotal = totalsales.reduce((acc, sale) => acc + (sale.total ?? 0), 0);
    const appliedPayment = Math.min(yesterBalance, todayPayments);
    const todaybalance = yesterBalance - appliedPayment;
    const reamingcash = todayPayments - appliedPayment;
    const roundoff = todaybalance < 0 ? 0 : todaybalance;
    const cash = reamingcash < 0 ? 0 : reamingcash;
    const balance = todaybalance;
    const total = subtotal + balance;
    const grandtotal = total - cash;

  // ✅ Load customers on page load
  useEffect(() => {
    instances.get("/customer/all")
      .then((res) => {
        setCustomers(res.data || []);
        setFilteredCustomers(res.data || []);
      })
      .catch((error) => {
        console.error("Error loading customers:", error);
        setCustomers([]);
        setFilteredCustomers([]);
      });
  }, []);
   
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (searchterm) {
      const filtered = customers.filter(customer =>
        customer.customername.toLowerCase().startsWith(searchterm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchterm, customers]);

  // Fetch sales items
  useEffect(() => {
    if (date && customername) {
      const controller = new AbortController();
      setIsLoading(true);
      const timer = setTimeout(() => setShowSpinner(true), 300);

      instances
        .get(`sales/items/by-customer-date/${date}/${customername}`, { signal: controller.signal })
        .then(res => {
          setTotalSales(res.data);
          // ✅ Extract bill number from first sale item
          if (res.data && res.data.length > 0) {
            setBillNo(res.data[0].billno || '');
          }
          setIsLoading(false);
        })
        .catch(err => {
          if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
            console.error("Cannot fetch sales items:", err);
          }
          setIsLoading(false);
        })
        .finally(() => {
          clearTimeout(timer);
          setShowSpinner(false);
        });

      return () => {
        controller.abort();
        clearTimeout(timer);
        setShowSpinner(false);
      };
    }
  }, [date, customername]);

  // Fetch yesterday balance & today payments
  useEffect(() => {
    setYesterdayBalance(0);
    setTodayPayments(0);
    if (date && customername) {
      instances
        .get(`calculate/dashboard/${customername}/${date}?yesterdayBalance=true&todayPayments=true`)
        .then(res => {
          setYesterdayBalance(res.data.yesterdayBalance ?? 0);
          setTodayPayments(res.data.todayspayments ?? 0);
        })
        .catch(err => console.error("Cannot fetch yesterday/today payments:", err));
    }
  }, [date, customername]);

  const clearFilters = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
    setCustomername('');
    setSearchTerm('');
    setBillNo('');
    setTotalSales([]);
  };

  // ✅ GREEN Stats matching Sales Report
  const stats = [
    { 
      title: "Total Sales", 
      value: `₹${formatIndianCurrency(subtotal)}`, 
      icon: <DollarSign className="w-6 h-6" />, 
      color: "from-green-500 to-emerald-500", 
      change: "+12.5%" 
    },
    { 
      title: "Total Items", 
      value: formatIndianCurrency(totalsales.length), 
      icon: <Package className="w-6 h-6" />, 
      color: "from-emerald-500 to-teal-500", 
      change: "+8.2%" 
    },
    { 
      title: "Previous Balance", 
      value: `₹${formatIndianCurrency(yesterBalance)}`, 
      icon: <TrendingUp className="w-6 h-6" />, 
      color: "from-teal-500 to-green-500", 
      change: "Outstanding" 
    },
    { 
      title: "Final Amount", 
      value: `₹${formatIndianCurrency(grandtotal)}`, 
      icon: <Receipt className="w-6 h-6" />, 
      color: "from-green-600 to-emerald-600", 
      change: grandtotal === 0 ? "Paid" : "Due" 
    },
  ];

  // ✅ Report Data Preparation
  const tableHeaders = ["S.No", "Date", "Item Name", "Price", "Bags", "Weight (kg)", "Total"];
  
  const tableRows = totalsales.map((sale, index) => [
    <span className="font-bold">{index + 1}</span>,
    <span className="font-bold">{sale.date ? format(new Date(sale.date), "dd-MM-yyyy") : ""}</span>,
    <span className="font-bold">{sale.itemname}</span>,
    <span className="font-bold">₹{formatIndianCurrency(sale.itemprice)}</span>,
    <span className="font-bold">{formatIndianCurrency(sale.bag)}</span>,
    <span className="font-bold">{formatIndianCurrency(sale.weight)}kg</span>,
    <span className="font-bold">₹{formatIndianCurrency(sale.total)}</span>
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      
      {/* ✅ GREEN Background matching Sales Report */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4">
        
        {/* ✅ COMPACT Header - GREEN Theme */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="text-center"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 mb-2 leading-tight">
            <span className="text-green-600">Customer Bill</span>
          </h1>
        </motion.div>

        {/* ✅ COMPACT Stats Cards */}
        
        {/* ✅ COMPACT Date Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }} 
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Date Selection</h3>
              </div>
            </div>

            <button 
              onClick={clearFilters} 
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-all duration-300"
            >
              <X className="w-4 h-4" />
              <span className="font-medium">Clear</span>
            </button>
          </div>

          {/* COMPACT Date Input */}
          <div className="max-w-sm">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 bg-white/90 focus:ring-2 focus:ring-green-400 focus:border-green-500 outline-none transition-all duration-300 text-slate-700 font-medium"
            />
          </div>
        </motion.div>

        {/* ✅ COMPACT Customer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          {/* ✅ COMPACT Green Header */}
          <div className="bg-gradient-to-r from-teal-500 to-green-500 px-4 py-3 rounded-t-2xl">
            <div className="flex items-center">
              <div className="bg-white/20 p-1.5 rounded-lg mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Customer Information</h3>
              <Leaf className="w-4 h-4 text-white ml-2" />
            </div>
          </div>

          <div className="p-4">
            {/* ✅ COMPACT Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* ✅ LEFT SIDE: COMPACT Search Customer */}
              <div>
                <div className="flex items-center mb-3">
                  <Search className="w-4 h-4 text-slate-600 mr-2" />
                  <h4 className="text-md font-bold text-slate-800">Search Customer</h4>
                </div>

                {/* COMPACT Search Input */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={searchterm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type customer name..."
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-300 bg-white focus:ring-2 focus:ring-teal-400 focus:border-teal-500 outline-none transition-all duration-300 text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* COMPACT Customer List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {filteredCustomers.slice(0, 6).map((customer, index) => (
                      <motion.div
                        key={customer.customerid}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setCustomername(customer.customername)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                          customername === customer.customername
                            ? 'border-teal-400 bg-teal-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-25'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-sm ${
                            customername === customer.customername ? 'text-teal-700' : 'text-slate-700'
                          }`}>
                            {customer.customername}
                          </span>
                          {customername === customer.customername && (
                            <CheckCircle className="w-4 h-4 text-teal-600" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Show more indicator */}
                  {filteredCustomers.length > 6 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-slate-500">+{filteredCustomers.length - 6} more customers</p>
                    </div>
                  )}

                  {/* No customers found */}
                  {filteredCustomers.length === 0 && (
                    <div className="text-center py-4">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No customers found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ RIGHT SIDE: COMPACT Customer Balance */}
              <div>
                <div className="flex items-center mb-3">
                  <DollarSign className="w-4 h-4 text-slate-600 mr-2" />
                  <h4 className="text-md font-bold text-slate-800">Customer Balance</h4>
                </div>

                <AnimatePresence mode="wait">
                  {!customername ? (
                    // ✅ COMPACT No Customer Selected
                    <motion.div
                      key="no-customer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center"
                      style={{ minHeight: '200px' }}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        {/* ✅ COMPACT User Icon */}
                        <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center mb-3">
                          <User className="w-6 h-6 text-slate-500" />
                        </div>
                        
                        <h3 className="text-md font-bold text-slate-600 mb-2">
                          No Customer Selected
                        </h3>
                        <p className="text-sm text-slate-500 text-center">
                          Select a customer above
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    // ✅ COMPACT Customer Balance Cards
                    <motion.div
                      key="balance-cards"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-3"
                    >
                      {/* COMPACT Yesterday Balance */}
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 text-center hover:shadow-sm transition-all duration-300"
                      >
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1.5 rounded-full w-fit mx-auto mb-2">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-orange-700 mb-1">Yesterday Balance</p>
                        <p className="text-lg font-bold text-orange-800">₹{formatIndianCurrency(yesterBalance || 0)}</p>
                      </motion.div>

                      {/* COMPACT Today Payments */}
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 text-center hover:shadow-sm transition-all duration-300"
                      >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-full w-fit mx-auto mb-2">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-green-700 mb-1">Today Payments</p>
                        <p className="text-lg font-bold text-green-800">₹{formatIndianCurrency(todayPayments || 0)}</p>
                      </motion.div>

                      {/* COMPACT Current Balance */}
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 text-center hover:shadow-sm transition-all duration-300"
                      >
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-full w-fit mx-auto mb-2">
                          <Calculator className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-semibold text-blue-700 mb-1">Current Balance</p>
                        <p className="text-lg font-bold text-blue-800">₹{formatIndianCurrency(balance)}</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {showSpinner && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                <span className="text-sm text-slate-600 font-medium">Loading...</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ✅ Bill Number Display - COMPACT */}
        {billNo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-4"
          >
            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <h3 className="text-md font-semibold text-slate-800">Bill Information</h3>
              </div>

              <div className="mt-3">
                <Card className="border border-green-500 bg-green-50 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <FileBarChart className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs font-semibold text-green-600">Bill Number</p>
                        <p className="text-lg font-black text-green-800">#{billNo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* ✅ Sales Table with Preview Button */}
        {(date && customername) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.7 }} 
            className="mb-4"
          >
            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
              
              {/* ✅ GREEN Header with Preview Button */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white flex items-center">
                    <FileText className="w-6 h-6 mr-3" />
                    Sales Items for {customername} ({formatIndianCurrency(totalsales.length)} items)
                    <Package className="w-4 h-4 ml-3" />
                  </h3>

                  {/* ✅ Preview Report Button */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setOpenPreview(true)} 
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Bill</span>
                  </motion.button>
                </div>
              </div>

              {/* Loading Overlay */}
              {showSpinner && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="inline-flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="text-slate-600 text-sm">Loading sales data...</span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <tr>
                      {['S.No', 'Date', 'Item Name', 'Price', 'Bags', 'Weight (kg)', 'Total'].map((header, index) => (
                        <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-green-800 border-b border-green-200">
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: index * 0.05 }}
                          >
                            {header}
                          </motion.div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {totalsales.map((sale, index) => (
                      <motion.tr 
                        key={sale.salesid} 
                        layout="position" 
                        initial={false} 
                        className="hover:bg-green-50/50 transition-colors duration-200 border-b border-slate-100"
                      >
                        {/* ✅ S.No with GREEN Circle */}
                        <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-2 shadow-sm text-white font-bold text-xs">
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-sm text-slate-600 font-bold">
                          {new Date(sale.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                        </td>
                        {/* Item with Green Leaf Icon */}
                        <td className="px-4 py-3 text-sm text-slate-800 flex items-center gap-2 font-bold">
                          <Leaf className="w-4 h-4 text-green-500" />
                          {sale.itemname}
                        </td>
                        {/* Price with Green Dollar Icon */}
                        <td className="px-4 py-3 text-sm text-slate-800 font-bold">
                          <DollarSign className="w-4 h-4 text-green-500 inline mr-1" />
                          ₹{formatIndianCurrency(sale.itemprice)}
                        </td>
                        {/* Bags with Green Shopping Bag */}
                        <td className="px-4 py-3 text-sm text-slate-600 font-bold">
                          <ShoppingBag className="w-4 h-4 text-green-500 inline mr-1" />
                          {formatIndianCurrency(sale.bag)}
                        </td>
                        {/* Weight with Green Weight Icon */}
                        <td className="px-4 py-3 text-sm text-slate-600 font-bold">
                          <Weight className="w-4 h-4 text-green-500 inline mr-1" />
                          {formatIndianCurrency(sale.weight)}
                        </td>
                        {/* Total with GREEN Background */}
                        <td className="px-4 py-3 text-sm font-bold">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-black inline-flex items-center text-xs">
                            <Banknote className="w-3 h-3 mr-1" />
                            ₹{formatIndianCurrency(sale.total)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {totalsales.length === 0 && !isLoading && !showSpinner && customername && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="p-8 text-center"
                  >
                    <div className="text-4xl mb-3">🥬</div>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">No vegetable sales found</h3>
                    <p className="text-sm text-slate-500">No sales recorded for {customername} on {new Date(date).toLocaleDateString('en-GB')}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ✅ Bill Summary - GREEN Professional Theme */}
        {(date && customername && totalsales.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {/* ✅ GREEN Header with Calculator Icon */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-black text-white flex items-center">
                <Calculator className="w-6 h-6 mr-3" />
                Bill Summary
                <Sparkles className="w-4 h-4 ml-3" />
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 text-slate-600 mr-2" />
                    <span className="font-semibold text-slate-700 text-sm">Subtotal:</span>
                  </div>
                  <span className="font-bold text-lg text-slate-800">₹{formatIndianCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="font-semibold text-orange-700 text-sm">Previous Balance:</span>
                  </div>
                  <span className="font-bold text-lg text-orange-800">₹{formatIndianCurrency(roundoff)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center">
                    <Calculator className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-700 text-sm">Total Amount:</span>
                  </div>
                  <span className="font-bold text-lg text-blue-800">₹{formatIndianCurrency(total)}</span>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-semibold text-green-700 text-sm">Cash Payment:</span>
                  </div>
                  <span className="font-bold text-lg text-green-800">-₹{formatIndianCurrency(cash)}</span>
                </div>
                
                {/* ✅ GREEN Grand Total Box */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-4 text-center hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-center mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-2 shadow-md"
                    >
                      <Banknote className="w-4 h-4 text-white" />
                    </motion.div>
                    <div className="text-md font-bold text-green-900">Grand Total</div>
                  </div>
                  <div className="text-2xl font-black text-green-900 mb-2">₹{formatIndianCurrency(grandtotal)}</div>
                  
                  {/* Status Badge */}
                  <div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      grandtotal === 0 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-orange-200 text-orange-800'
                    }`}>
                      {grandtotal === 0 ? '✅ Fully Paid' : '⚠️ Payment Pending'}
                    </span>
                  </div>
                </div>

                
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ✅ Report Preview Modal - Same as Sales Report */}
      {/* ✅ Report Preview Modal - COMPLETE BILL FORMAT */}
{/* ✅ COMPLETE BILL PREVIEW - Updated */}
<ReportPreviewModal
  isOpen={openPreview}
  onClose={() => setOpenPreview(false)}
  reportRef={reportRef}
  title={`Customer Bill - ${customername}`}
  tableHeaders={tableHeaders}
  tableRows={tableRows.map(row => row.map(cell => 
    // Clean JSX elements for PDF export
    typeof cell === 'object' && cell.props ? cell.props.children : cell
  ))}
  balanceData={{
    yesterBalance: yesterBalance,
    todayPayments: todayPayments,
    currentBalance: balance
  }}
  billSummary={{
    subtotal: subtotal,
    previousBalance: roundoff,
    totalAmount: total,
    cashPayment: cash,
    grandTotal: grandtotal
  }}
>
  <ReportLayout
    title="SALES BILL"
    headerData={{
      customerName: customername,
      billNo: billNo,
      date: date ? format(new Date(date), "dd-MM-yyyy") : ""
    }}
    tableHeaders={tableHeaders}
    tableRows={tableRows.map(row => row.map(cell => 
      typeof cell === 'object' && cell.props ? cell.props.children : cell
    ))}
    footerData={{ 
      generatedOn: new Date().toLocaleDateString('en-IN')
    }}
    balanceData={{
      yesterBalance: yesterBalance,
      todayPayments: todayPayments,
      currentBalance: balance
    }}
    billSummary={{
      subtotal: subtotal,
      previousBalance: roundoff,
      totalAmount: total,
      cashPayment: cash,
      grandTotal: grandtotal
    }}
  />
</ReportPreviewModal>


      {/* ✅ GREEN Floating Elements */}
      <div className="fixed top-20 left-10 w-16 h-16 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-12 h-12 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-10 h-10 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default Bill;
