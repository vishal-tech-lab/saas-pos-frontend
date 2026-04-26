import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import insatnces from "../../../components/axios";
import Customerdropdown from "../../../components/Customerdropdown";
import {
  Calendar,
  User,
  Receipt,
  Search,
  Edit3,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  FileEdit,
} from "lucide-react";

function Salesedit() {
  const [date, setDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billnos, setBillnos] = useState([]);
  const [selectedBillno, setSelectedBillno] = useState("");
  const [items, setItems] = useState([]);

  const [editMode, setEditMode] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editField, setEditField] = useState("");

  const [modalEdit, setModalEdit] = useState({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const formatINRLive = (value) => {
    if (value == null || value === "") return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const showToast = (message, color = "green") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold bg-${color}-500`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 2200);
  };

  const resetSalesData = () => {
    setBillnos([]);
    setSelectedBillno("");
    setItems([]);
  };

  const fetchBillnos = async () => {
    if (!selectedCustomer?.customername || !date) return;

    try {
      const response = await insatnces.get(
        `sales/billno/${selectedCustomer.customername}/${date}`
      );
      const uniqueBills = [...new Set(response.data || [])];
      setBillnos(uniqueBills);
      setSelectedBillno(uniqueBills[0] || "");
      setItems([]);
    } catch (error) {
      console.error("Failed to fetch bill numbers:", error);
      setBillnos([]);
      setSelectedBillno("");
      setItems([]);
    }
  };

  const fetchItems = async () => {
    if (!selectedCustomer?.customername || !selectedBillno) return;

    try {
      const response = await insatnces.get(
        `sales/items/${selectedCustomer.customername}/${selectedBillno}`
      );
      setItems(response.data || []);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setItems([]);
    }
  };

  useEffect(() => {
    if (selectedCustomer && date) {
      fetchBillnos();
    } else {
      resetSalesData();
    }
  }, [selectedCustomer, date]);

  const startEdit = (itemId, field, currentValue) => {
    setEditMode(`${itemId}-${field}`);
    setEditField(field);
    setEditValue(currentValue ?? "");
  };

  const cancelInlineEdit = () => {
    setEditMode(null);
    setEditValue("");
    setEditField("");
  };

  const handleQuickSave = async (itemId) => {
    try {
      const item = items.find((i) => i.salesid === itemId);
      if (!item || !editField) return;

      const updatedItem = {
        ...item,
        [editField]: editValue,
      };

      await insatnces.put(`sales/update/${itemId}`, updatedItem);

      setItems((prev) =>
        prev.map((i) => (i.salesid === itemId ? updatedItem : i))
      );

      cancelInlineEdit();
      showToast("Quick save successful!");
    } catch (error) {
      console.error("Quick save failed:", error);
      alert("Failed to save changes");
    }
  };

  const openModalEdit = (item) => {
    setModalEdit({ isOpen: true, item: { ...item } });
  };

  const handleModalSave = async (updatedItem) => {
    try {
      await insatnces.put(`sales/update/${updatedItem.salesid}`, updatedItem);

      setItems((prev) =>
        prev.map((i) =>
          i.salesid === updatedItem.salesid ? updatedItem : i
        )
      );

      setModalEdit({ isOpen: false, item: null });
      showToast("Item updated successfully!");
    } catch (error) {
      console.error("Modal save failed:", error);
      alert("Failed to update item");
    }
  };

  const openDeleteConfirmation = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleDeleteConfirm = async (salesid) => {
    try {
      await insatnces.delete(`sales/delete/${salesid}`);
      setItems((prev) => prev.filter((item) => item.salesid !== salesid));
      setDeleteModal({ isOpen: false, item: null });
      showToast("Item deleted successfully!", "red");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete item");
    }
  };

  const InlineEditCell = ({ item, field, value, className = "" }) => {
    const editKey = `${item.salesid}-${field}`;
    const isEditing = editMode === editKey;

    const displayValue =
      field === "itemprice" || field === "total"
        ? `₹${formatINRLive(value)}`
        : field === "weight"
        ? `${formatINRLive(value)} kg`
        : formatINRLive(value);

    return (
      <td
        className={`px-4 py-3 border-b border-slate-200 group cursor-pointer relative ${className}`}
        onDoubleClick={() => startEdit(item.salesid, field, value)}
      >
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleQuickSave(item.salesid)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickSave(item.salesid);
              if (e.key === "Escape") cancelInlineEdit();
            }}
            className="w-full px-2 py-1.5 border-2 border-blue-400 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className={className}>{displayValue}</span>
            <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-all duration-200" />
          </div>
        )}

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
          Double-click to edit
        </div>
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
            <h1 className="text-3xl md:text-4xl font-black text-green-600">
  Sales Edit
</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Search, update and manage sales items
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm"
        >
          <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-3xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Sales Records
            </h2>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Date */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 bg-white text-sm font-semibold text-slate-800"
                />
              </div>

              {/* Customer */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-emerald-600" />
                  Customer
                </label>

                <div className="bg-white border-2 border-emerald-200 rounded-2xl p-3">
                  <Customerdropdown
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={(customer) => {
                      setSelectedCustomer(customer);
                    }}
                  />
                </div>

                {selectedCustomer && (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {selectedCustomer.customername}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCustomer(null);
                        resetSalesData();
                      }}
                      className="p-1 rounded-lg hover:bg-emerald-100 transition"
                      title="Clear customer"
                    >
                      <X className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bill Number */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                  <Receipt className="w-4 h-4 mr-2 text-blue-600" />
                  Bill Number
                </label>
                <select
                  value={selectedBillno}
                  onChange={(e) => setSelectedBillno(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white text-sm font-semibold text-slate-800"
                >
                  {billnos.length > 0 ? (
                    billnos.map((bill, i) => (
                      <option key={i} value={bill}>
                        #{bill}
                      </option>
                    ))
                  ) : (
                    <option value="">No Bills Available</option>
                  )}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                onClick={fetchItems}
                disabled={!selectedCustomer || !selectedBillno}
                className="inline-flex items-center justify-center px-8 py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Load Sales Items
              </button>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileEdit className="w-5 h-5" />
                  Sales Items ({items.length})
                </h2>
                <div className="text-xs md:text-sm text-white/95 bg-white/15 px-3 py-2 rounded-xl">
                  Double-click a cell for quick edit
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-slate-100">
                  <tr>
                    {[
                      "Item Name",
                      "Price (₹)",
                      "Bags",
                      "Weight (kg)",
                      "Total (₹)",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-4 text-left font-semibold text-slate-700 border-b border-slate-200 text-sm"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.tr
                        key={item.salesid}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: index * 0.03 }}
                        className={`hover:bg-green-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <InlineEditCell
                          item={item}
                          field="itemname"
                          value={item.itemname}
                          className="text-sm font-bold text-slate-800"
                        />
                        <InlineEditCell
                          item={item}
                          field="itemprice"
                          value={item.itemprice}
                          className="text-sm font-bold text-green-600"
                        />
                        <InlineEditCell
                          item={item}
                          field="bag"
                          value={item.bag}
                          className="text-sm font-semibold text-slate-700"
                        />
                        <InlineEditCell
                          item={item}
                          field="weight"
                          value={item.weight}
                          className="text-sm font-semibold text-slate-700"
                        />
                        <InlineEditCell
                          item={item}
                          field="total"
                          value={item.total}
                          className="text-sm font-bold text-emerald-600"
                        />

                        <td className="px-4 py-3 border-b border-slate-200">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openModalEdit(item)}
                              className="p-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all shadow-sm"
                              title="Advanced Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openDeleteConfirmation(item)}
                              className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all shadow-sm"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* No Items */}
        {items.length === 0 && selectedCustomer && selectedBillno && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-sm p-10 text-center"
          >
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              No Sales Items Found
            </h3>
            <p className="text-slate-500">
              Try another bill number or customer.
            </p>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      {modalEdit.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalEdit({ isOpen: false, item: null })}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-2xl"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-5">
              Edit Sales Item
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Item Name
                </label>
                <input
                  type="text"
                  value={modalEdit.item?.itemname || ""}
                  onChange={(e) =>
                    setModalEdit((prev) => ({
                      ...prev,
                      item: { ...prev.item, itemname: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Price
                </label>
                <input
                  type="text"
                  value={formatINRLive(modalEdit.item?.itemprice) || ""}
                  onChange={(e) =>
                    setModalEdit((prev) => ({
                      ...prev,
                      item: {
                        ...prev.item,
                        itemprice: e.target.value.replace(/,/g, ""),
                      },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Bags
                </label>
                <input
                  type="text"
                  value={formatINRLive(modalEdit.item?.bag) || ""}
                  onChange={(e) =>
                    setModalEdit((prev) => ({
                      ...prev,
                      item: {
                        ...prev.item,
                        bag: e.target.value.replace(/,/g, ""),
                      },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  value={formatINRLive(modalEdit.item?.weight) || ""}
                  onChange={(e) =>
                    setModalEdit((prev) => ({
                      ...prev,
                      item: {
                        ...prev.item,
                        weight: e.target.value.replace(/,/g, ""),
                      },
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalEdit({ isOpen: false, item: null })}
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModalSave(modalEdit.item)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all font-semibold"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteModal({ isOpen: false, item: null })}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <div className="bg-red-500 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Delete Confirmation
              </h3>
              <p className="text-slate-600">
                Are you sure you want to delete this item?
              </p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Item:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {deleteModal.item?.itemname}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-600">Total:</span>
                  <span className="font-bold text-emerald-600">
                    ₹{formatINRLive(deleteModal.item?.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, item: null })}
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteModal.item.salesid)}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg transition-all font-semibold"
              >
                Delete Item
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Salesedit;