import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Tag,
  DollarSign,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Receipt,
  CheckCircle,
  FileText
} from 'lucide-react';
import instances from '../../../components/axios';

function Expenseedit() {
  const [selectedDate, setSelectedDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [editRowId, setEditRowId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    title: "",
    message: ""
  });

  const [editForm, setEditForm] = useState({
    date: "",
    category: "",
    amount: "",
    description: ""
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const formatIndianCurrency = (amount) => {
    if (amount === 0 || amount === "" || amount === null || amount === undefined) return "0";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    instances.get("/expcatgory/all")
      .then((res) => setCategories((res.data || []).filter(cat => cat.expensecategory?.trim())))
      .catch((error) => console.error("Cannot fetch categories", error));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);
    instances.get(`/expense/date/${selectedDate}`)
      .then((res) => {
        setExpenses(res.data || []);
        setSelectedCategory("ALL");
      })
      .catch((error) => {
        console.error("Cannot fetch expenses", error);
        setExpenses([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === "ALL") return expenses;
    return expenses.filter((item) => item.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const startEdit = (row) => {
    setEditRowId(row.expenseid);
    setEditForm({
      date: row.date,
      category: row.category,
      amount: row.amount,
      description: row.description
    });
  };

  const cancelEdit = () => {
    setEditRowId(null);
    setEditForm({
      date: "",
      category: "",
      amount: "",
      description: ""
    });
  };

  const handleUpdate = async () => {
    if (!editForm.category || !editForm.amount || !editForm.description) {
      setPopup({
        open: true,
        type: "warning",
        title: "Missing Fields",
        message: "Please fill category, amount, and description before updating."
      });
      return;
    }

    try {
      const res = await instances.put(`/expense/update/${editRowId}`, editForm);

      setExpenses((prev) =>
        prev.map((item) =>
          item.expenseid === editRowId ? res.data : item
        )
      );

      cancelEdit();

      setPopup({
        open: true,
        type: "success",
        title: "Updated Successfully",
        message: "Expense updated successfully."
      });
    } catch (error) {
      console.error("Cannot update expense", error);
      setPopup({
        open: true,
        type: "error",
        title: "Update Failed",
        message: "Cannot update expense. Check backend update API."
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await instances.delete(`/expense/delete/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp.expenseid !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Cannot delete the data", error);
      setPopup({
        open: true,
        type: "error",
        title: "Delete Failed",
        message: "Cannot delete the expense."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-11 h-11 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
              <span className="text-green-600">Expense Edit</span>
            </h1>
          </div>
          <p className="text-slate-600 text-sm">
            Select one date and filter category to edit expenses easily
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-lg"
        >
          <label className="text-sm font-semibold text-slate-700 flex items-center mb-2">
            <Calendar className="w-4 h-4 mr-2 text-green-500" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-72 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-lg"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-500" />
            Category Filter
          </h3>

          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory("ALL")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                selectedCategory === "ALL"
                  ? "bg-green-500 text-white border-green-500 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
              }`}
            >
              All Categories ({expenses.length})
            </motion.button>

            {categories.map((cat) => (
              <motion.button
                key={cat.expensecategoryid}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.expensecategory)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  selectedCategory === cat.expensecategory
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                }`}
              >
                {cat.expensecategory}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="bg-white/80 rounded-2xl p-8 text-center shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
            <p className="text-slate-600 font-medium">Loading expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white/80 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-5xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No expenses found</h3>
            <p className="text-sm text-slate-500">
              No entries available for this date and category.
            </p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Expense List ({filteredExpenses.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((row) => (
                    <tr
                      key={row.expenseid}
                      className="border-b border-slate-100 hover:bg-green-50/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                        {formatDate(row.date)}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {editRowId === row.expenseid ? (
                          <select
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, category: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-green-300"
                          >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat.expensecategoryid} value={cat.expensecategory}>
                                {cat.expensecategory}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 text-green-500 mr-2" />
                            {row.category}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {editRowId === row.expenseid ? (
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-green-300"
                          />
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-lg font-bold inline-flex items-center">
                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                            ₹{formatIndianCurrency(row.amount)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {editRowId === row.expenseid ? (
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, description: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-green-300"
                          />
                        ) : (
                          row.description
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editRowId === row.expenseid ? (
                            <>
                              <button
                                onClick={handleUpdate}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(row)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(row.expenseid)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AnimatePresence>
          {deleteId !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Expense</h3>
                  <p className="text-slate-600 mb-5 text-sm">
                    Are you sure you want to delete this expense entry?
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={() => handleDelete(deleteId)}
                      className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center space-x-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Yes, Delete</span>
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="px-5 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold flex items-center space-x-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {popup.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={closePopup}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-white/70 overflow-hidden"
              >
                <div
                  className={`px-6 pt-6 pb-4 text-center ${
                    popup.type === "success"
                      ? "bg-gradient-to-br from-green-50 to-emerald-100"
                      : popup.type === "error"
                      ? "bg-gradient-to-br from-red-50 to-rose-100"
                      : "bg-gradient-to-br from-yellow-50 to-amber-100"
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0.7, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-md ${
                      popup.type === "success"
                        ? "bg-green-500"
                        : popup.type === "error"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {popup.type === "success" && <CheckCircle className="w-8 h-8 text-white" />}
                    {popup.type === "error" && <X className="w-8 h-8 text-white" />}
                    {popup.type === "warning" && <AlertTriangle className="w-8 h-8 text-white" />}
                  </motion.div>

                  <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                    {popup.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                    {popup.message}
                  </p>
                </div>

                <div className="px-6 py-5 flex justify-center bg-white">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={closePopup}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md ${
                      popup.type === "success"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : popup.type === "error"
                        ? "bg-gradient-to-r from-red-500 to-rose-500"
                        : "bg-gradient-to-r from-yellow-500 to-amber-500"
                    }`}
                  >
                    OK
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Expenseedit;