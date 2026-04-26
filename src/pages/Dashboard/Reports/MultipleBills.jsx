import React, { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Eye, 
  Receipt,
  ArrowLeft,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import insatnces from "../../../components/axios";
import ReportLayout from "../../../components/report/ReportLayout";
import ReportPreviewModal from "../../../components/report/ReportPreviewModal";

function MultipleBills() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customerBills, setCustomerBills] = useState([]);
  const [billsData, setBillsData] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef();

  // ✅ Indian Currency Formatting
  const formatIndianCurrency = (amount) => {
    if (amount === 0 || amount === '' || amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Set today's date by default
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch all customers
  useEffect(() => {
    insatnces
      .get("/customer/all")
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]));
  }, []);

  // Fetch bills automatically when customers or date change
  useEffect(() => {
    if (customers.length > 0 && date) {
      generateAllBills();
    }
  }, [customers, date]);

  // ✅ Auto-generate all customer bills
  const generateAllBills = async () => {
    if (!date || customers.length === 0) return;

    setIsGenerating(true);
    const bills = [];
    const billsDataArray = [];

    for (let customer of customers) {
      try {
        const safeName = encodeURIComponent(customer.customername.trim());

        // Fetch sales
        const salesRes = await insatnces.get(
          `/sales/items/by-customer-date/${date}/${safeName}`
        );
        const sales = salesRes.data || [];
        if (sales.length === 0) continue; // skip if no sales

        // Fetch balances
        const balanceRes = await insatnces.get(
          `/calculate/dashboard/${customer.customername}/${date}?yesterdayBalance=true&todayPayments=true`
        );
        const yesterBalance = balanceRes.data?.yesterdayBalance ?? 0;
        const todayPayments = balanceRes.data?.todayspayments ?? 0;

        // Calculations
        const subtotal = sales.reduce((sum, s) => sum + (s.total ?? 0), 0);
        const appliedPayment = Math.min(yesterBalance, todayPayments);
        const currentBalance = yesterBalance - appliedPayment;
        const remainingCash = todayPayments - appliedPayment;
        const roundoff = currentBalance < 0 ? 0 : currentBalance;
        const cash = remainingCash < 0 ? 0 : remainingCash;
        const total = subtotal + roundoff;
        const grandTotal = total - cash;

        // Table headers & rows
        const tableHeaders = ["S.No", "Date", "Item Name", "Price", "Bags", "Weight (kg)", "Total"];
        const tableRows = sales.map((s, i) => [
  i + 1,
  new Date(s.date).toLocaleDateString('en-GB').replace(/\//g, '-'),
  // This ensures long names don't overlap
  <div className="item-name-cell" style={{ wordBreak: 'break-word', whiteSpace: 'normal', minWidth: '120px' }}>
    {s.itemname}
  </div>,
  `₹${formatIndianCurrency(s.itemprice)}`,
  formatIndianCurrency(s.bag),
  `${formatIndianCurrency(s.weight)}kg`,
  `₹${formatIndianCurrency(s.total)}`,
]);

        // Store bill data for summary
        billsDataArray.push({
          customerName: customer.customername,
          billNo: sales[0].billno || '',
          itemCount: sales.length,
          grandTotal
        });

        // ✅ Create each bill as separate page
        bills.push(
  <div
    key={customer.customerid}
    className="bill-page"
    style={{ 
      width: "210mm",
      minHeight: "297mm", // Allows content to determine height if it overflows
      margin: "0",
      padding: "0",
      backgroundColor: "white",
      display: "block",
      pageBreakAfter: "always",
      boxSizing: "border-box",
      position: "relative"
    }}
  >
            <style>{`
      @media print {
        .bill-page { page-break-after: always; }
      }
      .item-name-cell {
        line-height: 1.2;
        font-size: 12px;
        max-width: 150px;
      }
      table {
        table-layout: auto !important; /* Let columns adjust to content */
        width: 100% !important;
      }
      td, th {
        word-wrap: break-word;
        padding: 8px 4px !important;
        vertical-align: middle !important;
      }
    `}</style>

    <div style={{ padding: "15mm", display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ReportLayout
        title="SALES BILL"
        headerData={{
          customerName: customer.customername,
          billNo: sales[0].billno || "",
          date: new Date(date).toLocaleDateString('en-GB').replace(/\//g, '-'),
        }}
        tableHeaders={tableHeaders}
        tableRows={tableRows}
        balanceData={{
          yesterBalance,
          todayPayments,
          currentBalance
        }}
        billSummary={{
          subtotal,
          previousBalance: roundoff,
          totalAmount: total,
          cashPayment: cash,
          grandTotal
        }}
        footerData={{ 
          generatedOn: new Date().toLocaleDateString("en-IN") 
        }}
      />
    </div>
  </div>
);
      } catch (err) {
        console.error(`Error fetching bill for ${customer.customername}`, err);
      }
    }

    setCustomerBills(bills);
    setBillsData(billsDataArray);
    setIsGenerating(false);
  };

  // ✅ Calculate totals for summary
  const totalCustomers = billsData.length;
  const totalItems = billsData.reduce((sum, bill) => sum + bill.itemCount, 0);
  const totalAmount = billsData.reduce((sum, bill) => sum + bill.grandTotal, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          

          <div className="text-center">
            <h1 className="text-4xl font-black text-green-800 mb-3 flex items-center justify-center">
              <Receipt className="w-10 h-10 mr-4 text-emerald-600" />
              All Customer Bills
            </h1>
            <p className="text-green-600 text-lg font-medium">
              Generate all customer bills in one PDF - each customer on separate page
            </p>
          </div>
        </motion.div>

        {/* ✅ SIMPLIFIED Controls - Just Date & Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
        >
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              <label className="text-lg font-bold text-slate-800">Select Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-6 py-3 border-2 border-green-200 rounded-xl bg-white focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all duration-300 font-bold text-lg shadow-lg"
              />
            </div>

            {/* ✅ SINGLE PREVIEW BUTTON */}
            {customerBills.length > 0 && (
              <button
                onClick={() => setOpenPreview(true)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
              >
                <Eye className="w-6 h-6" />
                Preview All Bills ({totalCustomers} customers)
              </button>
            )}
          </div>
        </motion.div>

        {/* ✅ COMPACT Stats - Reduced Size */}
        {billsData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-md">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-xl font-black text-green-800">{totalCustomers}</h4>
              <p className="text-sm text-green-600 font-medium">Customers</p>
            </div>

            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-md">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-xl font-black text-blue-800">{totalItems}</h4>
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
            </div>

            <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-xl p-4 text-center shadow-md">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-xl font-black text-emerald-800">₹{formatIndianCurrency(totalAmount)}</h4>
              <p className="text-sm text-emerald-600 font-medium">Total Amount</p>
            </div>
          </motion.div>
        )}

        {/* Status Messages */}
        {isGenerating && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-8 py-4 bg-white/80 rounded-2xl shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-4"></div>
              <span className="text-slate-700 font-bold text-lg">Generating bills for {customers.length} customers...</span>
            </div>
          </div>
        )}

        {!isGenerating && customerBills.length === 0 && date && customers.length > 0 && (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-slate-600 mb-4">No Sales Found</h3>
            <p className="text-slate-500 text-lg">No customer sales found for {new Date(date).toLocaleDateString('en-GB')}</p>
          </div>
        )}

        {/* ✅ Customer Bills List (for reference) */}
        {billsData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <Receipt className="w-6 h-6 text-green-600 mr-3" />
              Bills Generated ({billsData.length} customers)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {billsData.map((bill, index) => (
                <div key={index} className="bg-white/60 rounded-lg p-3 border border-green-200 hover:shadow-md transition-all duration-200">
                  <h4 className="font-bold text-slate-800 truncate text-sm" title={bill.customerName}>
                    {bill.customerName}
                  </h4>
                  <p className="text-xs text-green-600 font-medium">Bill #{bill.billNo}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-600">Items: {bill.itemCount}</p>
                    <p className="text-xs font-bold text-green-700">₹{formatIndianCurrency(bill.grandTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ✅ SINGLE PREVIEW MODAL - Shows ALL Bills */}
      <ReportPreviewModal
        isOpen={openPreview}
        onClose={() => setOpenPreview(false)}
        reportRef={reportRef}
        title={`All Customer Bills - ${date} (${totalCustomers} customers)`}
        tableHeaders={[]}
        tableRows={[]}
      >
        <div style={{ 
          width: "210mm", 
          margin: "0 auto",
          backgroundColor: "white"
        }}>
          {customerBills.map((bill, index) => (
            <div key={index} style={{ 
              pageBreakAfter: index === customerBills.length - 1 ? "auto" : "always" 
            }}>
              {bill}
            </div>
          ))}
        </div>
      </ReportPreviewModal>

      {/* Hidden container for PDF generation */}
      <div style={{ display: 'none' }}>
        <div ref={reportRef}>
          {customerBills}
        </div>
      </div>
    </div>
  );
}

export default MultipleBills;
  