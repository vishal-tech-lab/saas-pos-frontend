import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import Customerdropdown from "../../../components/Customerdropdown";
import Itemdropdown from "../../../components/Itemdropdown";
import instances from "../../../components/axios";
import ConfirmModal from "./Salesregister/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import useDashboardData from "../../../components/DashboardWidget";
import {
  ShoppingCart, FileText, User, Package, DollarSign, Calendar, Weight,
  Hash, Plus, Edit3, Trash2, Save, ArrowLeft, CheckCircle, Calculator,
  Receipt, AlertCircle, Search, Leaf, Sparkles, TrendingUp
} from 'lucide-react';

function Salesregister() {
  const navigate = useNavigate();

  const [salesdata, setSalesdata] = useState({
    billno: "", date: "", customername: "", customerid: "", itemname: "",
    itemprice: "", weight: "", bag: "", total: "", editIndex: undefined,
  });
  const [items, setItems] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const billNo = Math.floor(100000 + Math.random() * 900000);
    setSalesdata(prev => ({ ...prev, date: dateStr, billno: billNo }));
  }, []);

  useEffect(() => {
    const weight = parseFloat(salesdata.weight) || 0;
    const bag = parseFloat(salesdata.bag) || 0;
    const price = parseFloat(salesdata.itemprice) || 0;
    const total = (weight || bag) * price;
    setSalesdata(prev => ({ ...prev, total }));
  }, [salesdata.weight, salesdata.bag, salesdata.itemprice]);

  const fields = useMemo(() => ["totalbalance"], []);
  const { data, loading } = useDashboardData(salesdata.customername, salesdata.date, fields);

  const formatINRLive = useCallback((value) => {
    if (value == null || value === "") return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  const validateItem = useCallback(() => {
    const newErrors = {};
    if (!salesdata.itemname) newErrors.itemname = "Item name is required";
    if (!salesdata.itemprice || parseFloat(salesdata.itemprice) <= 0)
      newErrors.itemprice = "Valid price is required";
    if ((!salesdata.weight || parseFloat(salesdata.weight) <= 0) &&
        (!salesdata.bag || parseFloat(salesdata.bag) <= 0))
      newErrors.quantity = "Either weight or bag quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [salesdata]);

  const handleAdd = useCallback(() => {
    if (!validateItem()) return;
    const finalWeight = salesdata.weight || salesdata.bag;
    const newItem = {
      itemname: salesdata.itemname,
      itemprice: salesdata.itemprice,
      weight: finalWeight,
      bag: salesdata.bag,
      total: salesdata.total,
    };
    if (salesdata.editIndex !== undefined) {
      setItems(prev => { const n = [...prev]; n[salesdata.editIndex] = newItem; return n; });
    } else {
      setItems(prev => [...prev, newItem]);
    }
    setSalesdata(prev => ({
      ...prev, itemname: "", itemprice: "", bag: "", weight: "", total: "", editIndex: undefined
    }));
    setErrors({});
  }, [validateItem, salesdata]);

  const handleEdit = useCallback((index) => {
    const item = items[index];
    setSalesdata(prev => ({ ...prev, ...item, editIndex: index }));
  }, [items]);

  const handleDeleteClick = useCallback((index) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setItems(prev => prev.filter((_, index) => index !== deleteIndex));
    setShowDeleteConfirm(false);
    setDeleteIndex(undefined);
  }, [deleteIndex]);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (items.length === 0) { setErrors({ submit: "Please add at least one item before submitting" }); return; }
    setIsSubmitting(true);
    setErrors({});
    try {
      await instances.post("sales/register", {
        billno: salesdata.billno,
        date: salesdata.date,
        customername: salesdata.customername,
        items: items,
      });
      const newBillNo = Math.floor(100000 + Math.random() * 900000);
      setSalesdata({
        billno: newBillNo, date: salesdata.date, customername: "", customerid: "",
        itemname: "", itemprice: "", weight: "", bag: "", total: "", editIndex: undefined,
      });
      setItems([]);
      setCustomerSearch("");
      setErrors({ success: "Sales registered successfully!" });
    } catch (error) {
      setErrors({ submit: "Failed to register sales. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [items, salesdata]);

  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0), [items]);

  const customerBalance = useMemo(() =>
    parseFloat(data?.totalbalance || 0), [data?.totalbalance]);

  const grandTotal = useMemo(() =>
    subtotal + customerBalance, [subtotal, customerBalance]);

  const updateField = useCallback((field, value) => {
    setSalesdata(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-3">

      <div className="relative z-10 max-w-7xl mx-auto space-y-3">

        {/* ── Header ── compact */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-2"
        >
          <h1 className="text-2xl font-black text-slate-800">
            <span className="text-green-600">Sales Registration</span>
          </h1>
          <p className="text-slate-500 text-xs">Fresh • Organic • Premium Quality</p>
        </motion.div>

        {/* ── Bill Information ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md"
        >
          {/* card header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-lg mr-2">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Bill Information</h2>
          </div>

          {/* card body */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                  <Hash className="w-3 h-3 mr-1" /> Bill Number
                </label>
                <div className="px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl text-base font-black text-green-900">
                  #{salesdata.billno}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> Date
                </label>
                <input
                  type="date"
                  value={salesdata.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Customer Information ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg mr-2">
              <User className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Customer Information</h2>
          </div>

          <div className="px-4 py-3">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

    {/* LEFT — Customer Dropdown (no separate search input needed) */}
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
        <Search className="w-3 h-3 mr-1" /> Select Customer
      </label>
      {/* Customerdropdown already has its own search bar inside */}
      <Customerdropdown
        selectedCustomer={
          salesdata.customername
            ? { customerid: salesdata.customerid, customername: salesdata.customername }
            : null
        }
        onCustomerSelect={(customer) => {
          setSalesdata(prev => ({
            ...prev,
            customerid: customer?.customerid || "",
            customername: customer?.customername || "",
          }));
        }}
        className="w-full"
      />
    </div>

              

              {/* Customer Balance — compact */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" /> Customer Balance
                </label>
                <AnimatePresence mode="wait">
                  {salesdata.customername ? (
                    <motion.div
                      key={salesdata.customername}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="h-[215px] p-4 bg-gradient-to-br from-emerald-100 via-teal-100 to-green-100 border border-emerald-300 rounded-xl flex flex-col justify-center items-center gap-2"
                    >
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-sm font-black text-emerald-900 text-center break-words max-w-full">
                        {salesdata.customername}
                      </h3>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                          <span className="text-emerald-700 font-bold text-sm">Loading...</span>
                        </div>
                      ) : (
                        <motion.p
                          key={data?.totalbalance}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl font-black text-emerald-800"
                        >
                          ₹{formatINRLive(data?.totalbalance || 0)}
                        </motion.p>
                      )}
                      <p className="text-xs text-emerald-600 font-bold">Available Balance</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                        data?.totalbalance > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          data?.totalbalance > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {data?.totalbalance > 0 ? 'Active Account' : 'Pending Payment'}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-customer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[215px] p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-center items-center gap-2"
                    >
                      <User className="w-10 h-10 text-slate-400" />
                      <p className="text-sm font-black text-slate-600">No Customer Selected</p>
                      <p className="text-xs text-slate-500">Search and select a customer above</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Add Items ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-lg mr-2">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Add Fresh Items</h2>
          </div>

          <div className="px-4 py-3">

            {/* Error */}
            {Object.keys(errors).length > 0 && !errors.success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-red-100 border border-red-300 rounded-xl"
              >
                <div className="flex">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <ul className="text-xs text-red-700 font-semibold space-y-1">
                    {Object.values(errors).filter(e => e !== errors.success).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {errors.success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-3 p-3 bg-green-100 border border-green-300 rounded-xl flex items-center"
              >
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <p className="text-sm font-black text-green-800">{errors.success}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Item Search */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                  <Package className="w-3 h-3 mr-1" /> Search & Select Item
                </label>
                <Itemdropdown
                  value={salesdata.itemname}
                  onSelect={(item) => {
                    setSalesdata(prev => ({
                      ...prev,
                      itemname: item.itemname,
                      itemprice: item.itemprice || '',
                    }));
                  }}
                  displayType="filtered-list"
                />
              </div>

              {/* Item Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" /> Price
                  </label>
                  <input
                    type="text"
                    value={formatINRLive(salesdata.itemprice)}
                    onChange={(e) => updateField('itemprice', e.target.value.replace(/,/g, ''))}
                    placeholder="0.00"
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 bg-white/80 text-sm font-semibold transition-all ${
                      errors.itemprice
                        ? 'border-red-300 focus:ring-red-300'
                        : 'border-slate-200 focus:ring-green-300 focus:border-green-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                      <Package className="w-3 h-3 mr-1" /> Bags/Units
                    </label>
                    <input
                      type="text"
                      value={formatINRLive(salesdata.bag)}
                      onChange={(e) => updateField('bag', e.target.value.replace(/,/g, ''))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center">
                      <Weight className="w-3 h-3 mr-1" /> Weight (kg)
                    </label>
                    <input
                      type="text"
                      value={formatINRLive(salesdata.weight)}
                      onChange={(e) => updateField('weight', e.target.value.replace(/,/g, ''))}
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-500 bg-white/80 text-sm font-semibold transition-all"
                    />
                  </div>
                </div>

                {/* Total + Add Button */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-black text-green-800 flex items-center">
                      <Calculator className="w-3 h-3 mr-1" /> Total
                    </span>
                    <span className="text-base font-black text-green-900">
                      ₹{formatINRLive(salesdata.total)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center px-4 py-2 text-sm font-black rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all shadow-lg hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {salesdata.editIndex !== undefined ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Cart Table ── */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md"
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 rounded-lg mr-2">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">
                Cart ({items.length} items)
              </h2>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      {['#', 'Item', 'Price', 'Bags', 'Weight', 'Total', 'Actions'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200 text-xs">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                        >
                          <td className="px-3 py-2 font-bold text-slate-600 border-b border-slate-100">{index + 1}</td>
                          <td className="px-3 py-2 font-bold text-slate-800 border-b border-slate-100">{item.itemname}</td>
                          <td className="px-3 py-2 font-bold text-green-600 border-b border-slate-100">₹{formatINRLive(item.itemprice)}</td>
                          <td className="px-3 py-2 text-slate-600 border-b border-slate-100">{formatINRLive(item.bag)}</td>
                          <td className="px-3 py-2 text-slate-600 border-b border-slate-100">{formatINRLive(item.weight)} kg</td>
                          <td className="px-3 py-2 font-bold text-emerald-600 border-b border-slate-100">₹{formatINRLive(item.total)}</td>
                          <td className="px-3 py-2 border-b border-slate-100">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(index)} className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg hover:scale-110 transition-all">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteClick(index)} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg hover:scale-110 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>

                    {/* Subtotal */}
                    <tr className="bg-blue-50 border-t border-blue-200">
                      <td colSpan="5" className="px-3 py-2 text-right text-sm font-semibold text-blue-700">Subtotal:</td>
                      <td className="px-3 py-2 text-sm font-bold text-blue-900">₹{formatINRLive(subtotal.toFixed(2))}</td>
                      <td></td>
                    </tr>

                    {/* Customer Balance */}
                    {salesdata.customername && (
                      <tr className="bg-green-50">
                        <td colSpan="5" className="px-3 py-2 text-right text-sm font-semibold text-green-700">Customer Balance:</td>
                        <td className="px-3 py-2 text-sm font-bold text-green-900">₹{formatINRLive(customerBalance.toFixed(2))}</td>
                        <td></td>
                      </tr>
                    )}

                    {/* Grand Total */}
                    {salesdata.customername && (
                      <tr className="bg-purple-50 border-t-2 border-purple-200">
                        <td colSpan="5" className="px-3 py-3 text-right text-base font-bold text-purple-700">Grand Total:</td>
                        <td className="px-3 py-3 text-base font-bold text-purple-900">₹{formatINRLive(grandTotal.toFixed(2))}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Submit */}
              <div className="mt-4 flex justify-center">
                <button
                  type="submit"
                  onClick={submit}
                  disabled={items.length === 0 || isSubmitting}
                  className={`inline-flex items-center px-10 py-3 text-base font-black rounded-full transition-all shadow-lg hover:scale-105 ${
                    items.length === 0 || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-300'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Submit Sales
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this item?"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteIndex(undefined); }}
        />
      )}
    </div>
  );
}

export default Salesregister;