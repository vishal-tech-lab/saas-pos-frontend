import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Eye, 
  Download, 
  Printer, 
  FileSpreadsheet,
  ArrowLeft,
  Search,
  TrendingUp,
  DollarSign,
  CreditCard,
  Receipt,
  SortAsc,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import insatnces from '../../../components/axios';
import ReportPreviewModal from '../../../components/report/ReportPreviewModal';
import ReportLayout from '../../../components/report/ReportLayout';

function Customerrecord() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [custoemrtable, setCustomertable] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [openPreview, setOpenPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const reportRef = useRef();

  // ✅ Indian Currency Formatting
  const formatIndianCurrency = (amount) => {
    if (amount === 0 || amount === '' || amount === null || amount === undefined) return '₹0';
    const num = parseFloat(amount);
    if (num < 0) {
      return `-₹${Math.abs(num).toLocaleString('en-IN')}`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Set today's date
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch customer records
  useEffect(() => {
    if (!date) return;

    setIsLoading(true);
    insatnces.get(`calculate/dashboard/customerrecord/${date}`)
      .then((res) => {
        setCustomertable(res.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Cannot fetch table data", err);
        setCustomertable([]);
        setIsLoading(false);
      });
  }, [date]);

  // ✅ SORT CUSTOMERS ALPHABETICALLY + SEARCH FILTER
  useEffect(() => {
    let filtered = [...custoemrtable];

    // ✅ Search Filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ✅ Alphabetical Sort
    filtered.sort((a, b) => {
      const nameA = a.customerName.toLowerCase();
      const nameB = b.customerName.toLowerCase();
      
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    setFilteredCustomers(filtered);
  }, [custoemrtable, searchTerm, sortOrder]);

  // ✅ Toggle Sort Order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // ✅ Calculate Summary Stats
  const totalCustomers = filteredCustomers.length;
  const totalOldBalance = filteredCustomers.reduce((sum, c) => sum + parseFloat(c.oldBalance || 0), 0);
  const totalTodayPayments = filteredCustomers.reduce((sum, c) => sum + parseFloat(c.todayPayments || 0), 0);
  const totalTodaySales = filteredCustomers.reduce((sum, c) => sum + parseFloat(c.todaySales || 0), 0);
  const totalFinalBalance = filteredCustomers.reduce((sum, c) => sum + parseFloat(c.finalBalance || 0), 0);

  // ✅ Prepare data for report
  const tableHeaders = ["S.No", "Customer Name", "Old Balance (₹)", "Today's Payment (₹)", "Today's Sales (₹)", "Final Balance (₹)"];
  
  // ✅ Regular table rows
  const tableRows = filteredCustomers.map((customer, index) => [
    index + 1,
    customer.customerName,
    formatIndianCurrency(customer.oldBalance),
    formatIndianCurrency(customer.todayPayments),
    formatIndianCurrency(customer.todaySales),
    formatIndianCurrency(customer.finalBalance)
  ]);

  // ✅ NEW: Create table rows with totals row for preview
  const tableRowsWithTotals = [
    ...tableRows, // All customer rows first
    // ✅ Add totals row at the end
    [
      "TOTAL", // First column - bold label
      `${totalCustomers} Customers`, // Customer name column
      formatIndianCurrency(totalOldBalance), // Old Balance total
      formatIndianCurrency(totalTodayPayments), // Today's Payment total
      formatIndianCurrency(totalTodaySales), // Today's Sales total
      formatIndianCurrency(totalFinalBalance) // Final Balance total
    ]
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-300/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-200/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          

          <div className="text-center">
            <h1 className="text-4xl font-black text-blue-800 mb-3 flex items-center justify-center">
              <Users className="w-10 h-10 mr-4 text-indigo-600" />
              Customer Records
              <Receipt className="w-8 h-8 ml-3 text-blue-500" />
            </h1>
            <p className="text-blue-600 text-lg font-medium">
              Complete customer financial summary and records
            </p>
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Date Picker */}
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <label className="text-lg font-bold text-slate-800">Select Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-3 border-2 border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-300 font-medium text-lg shadow-lg"
              />
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-300 w-64"
                />
              </div>

              <button
                onClick={toggleSortOrder}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <SortAsc className="w-4 h-4" />
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>

              {/* Preview Button */}
              {filteredCustomers.length > 0 && (
                <button
                  onClick={() => setOpenPreview(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview Report
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        {filteredCustomers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-2xl font-black text-blue-800 mb-1">{totalCustomers}</h4>
              <p className="text-sm text-blue-600 font-medium">Customers</p>
            </div>

            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-black text-red-800 mb-1">{formatIndianCurrency(totalOldBalance)}</h4>
              <p className="text-sm text-red-600 font-medium">Old Balance</p>
            </div>

            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-black text-green-800 mb-1">{formatIndianCurrency(totalTodayPayments)}</h4>
              <p className="text-sm text-green-600 font-medium">Payments</p>
            </div>

            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-black text-purple-800 mb-1">{formatIndianCurrency(totalTodaySales)}</h4>
              <p className="text-sm text-purple-600 font-medium">Sales</p>
            </div>

            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-black text-orange-800 mb-1">{formatIndianCurrency(totalFinalBalance)}</h4>
              <p className="text-sm text-orange-600 font-medium">Final Balance</p>
            </div>
          </motion.div>
        )}

        {/* Customer Records Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                Customer Records ({filteredCustomers.length} customers)
                {searchTerm && <span className="ml-2 text-sm text-blue-600">- Filtered</span>}
              </h3>
              
              <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full">
                Sorted: {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <span className="text-slate-600 font-medium">Loading customer records...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
                  <tr>
                    {tableHeaders.map((header, index) => (
                      <th key={index} className="px-6 py-4 text-left text-sm font-bold text-blue-800 border-b border-blue-200">
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
                  <AnimatePresence>
                    {filteredCustomers.map((customer, index) => (
                      <motion.tr
                        key={`${customer.customerName}-${index}`}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="hover:bg-blue-50/50 transition-colors duration-200 border-b border-slate-100"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          {customer.customerName}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          <span className={`${parseFloat(customer.oldBalance) < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                            {formatIndianCurrency(customer.oldBalance)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">
                          {formatIndianCurrency(customer.todayPayments)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">
                          {formatIndianCurrency(customer.todaySales)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            parseFloat(customer.finalBalance) < 0 
                              ? 'bg-red-100 text-red-800' 
                              : parseFloat(customer.finalBalance) === 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {formatIndianCurrency(customer.finalBalance)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* Empty State */}
              {!isLoading && filteredCustomers.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="p-12 text-center"
                >
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-bold text-slate-600 mb-2">
                    {searchTerm ? 'No customers found' : 'No customer records'}
                  </h3>
                  <p className="text-slate-500">
                    {searchTerm 
                      ? `No customers match "${searchTerm}"` 
                      : `No customer activity found for ${new Date(date).toLocaleDateString('en-GB')}`
                    }
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* ✅ PREVIEW MODAL - Uses tableRowsWithTotals */}
      <ReportPreviewModal
        isOpen={openPreview}
        onClose={() => setOpenPreview(false)}
        reportRef={reportRef}
        title={`Customer Records - ${date}`}
        tableHeaders={tableHeaders}
        tableRows={tableRowsWithTotals} // ✅ Uses version with totals row
      >
        <ReportLayout
          title="CUSTOMER RECORDS REPORT"
          headerData={{
            date: new Date(date).toLocaleDateString('en-GB').replace(/\//g, '-'),
            customerName: null,   // ✅ null = won't show
            billNo: null,
            totalCustomers: totalCustomers,
            sortOrder: sortOrder === 'asc' ? 'A-Z' : 'Z-A'
          }}
          tableHeaders={tableHeaders}
          tableRows={tableRowsWithTotals} // ✅ Uses version with totals row
          footerData={{
            generatedOn: new Date().toLocaleDateString('en-IN'),
            totalCustomers: totalCustomers,
            totalFinalBalance: formatIndianCurrency(totalFinalBalance)
          }}
        />
      </ReportPreviewModal>
    </div>
  );
}

export default Customerrecord;
