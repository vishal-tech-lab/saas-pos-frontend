import React, { useEffect, useState } from "react";
import instances from "../../../../components/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Users,
  Edit3,
  Trash2,
  Filter,
  CreditCard,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import DeleteModal from "../../../../components/DeleteModal"; // adjust path as needed
import UpdateModal from "../../../../components/UpdateModal"; // adjust path as needed

function PaymentEdit() {
  const [date, setDate] = useState("");
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Update modal state
  const [updateModal, setUpdateModal] = useState({ isOpen: false, item: null });
  const [newPaymentValue, setNewPaymentValue] = useState("");

  // Toast helper
  const showToast = (message, color = "green") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold bg-${color}-500`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) document.body.removeChild(toast);
    }, 2200);
  };

  // Fetch customers
  useEffect(() => {
    instances
      .get("/customer/all")
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Set today's date
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Fetch payments
  const fetchPayments = () => {
    if (!selectedCustomer) return;
    setIsLoading(true);
    instances
      .get(`payment/${selectedCustomer.customername}/${date}`)
      .then((res) => {
        setPayments(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Cannot fetch payments", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedCustomer, date]);

  // Open update modal
  const openUpdateModal = (payment) => {
  setUpdateModal({ isOpen: true, item: payment });
  // Convert to string immediately to avoid crashes in the modal
  setNewPaymentValue(payment.customerpayment ? String(payment.customerpayment) : "");
};

  // Handle update
  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      await instances.put(`payment/update/${updateModal.item.paymentid}`, {
        customername: updateModal.item.customername,
        customerpayment: newPaymentValue,
      });
      setPayments((prev) =>
        prev.map((p) =>
          p.paymentid === updateModal.item.paymentid
            ? { ...p, customerpayment: newPaymentValue }
            : p
        )
      );
      setUpdateModal({ isOpen: false, item: null });
      setNewPaymentValue("");
      showToast("Payment updated successfully!");
      setIsLoading(false);
    } catch {
      showToast("Cannot update payment", "red");
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await instances.delete(`payment/delete/${deleteModal.item.paymentid}`);
      setPayments((prev) =>
        prev.filter((p) => p.paymentid !== deleteModal.item.paymentid)
      );
      setDeleteModal({ isOpen: false, item: null });
      showToast("Payment deleted successfully!", "red");
      setIsLoading(false);
    } catch {
      showToast("Cannot delete payment", "red");
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.customername.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  const totalPayments = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.customerpayment || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-black text-green-600">
            Payment Edit
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Manage and update customer payment records
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-green-600 to-emerald-600">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters & Selection
                </h2>
              </div>

              <div className="p-5 space-y-6">
                {/* Date Filter */}
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

                {/* Customer Search */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-emerald-600" />
                    Customer Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Customer List */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Select Customer
                  </label>
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    <AnimatePresence>
                      {filteredCustomers.map((customer) => (
                        <motion.div
                          key={customer.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedCustomer(customer)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                            selectedCustomer?.id === customer.id
                              ? "bg-emerald-50 border-emerald-400 shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:bg-green-50 hover:border-green-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-800 font-semibold text-sm">
                              {customer.customername}
                            </span>
                            {selectedCustomer?.id === customer.id && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payments Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedCustomer ? (
              <div className="space-y-6">
                {/* Stats Card */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        {selectedCustomer.customername}
                      </h3>
                      <p className="text-slate-500 text-sm">Payment Overview</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-3xl font-black text-emerald-600">
                          ₹{totalPayments.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm">
                        {payments.length} payments
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Records
                    </h2>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100">
                          <tr>
                            {["Customer Name", "Amount (₹)", "Actions"].map(
                              (header) => (
                                <th
                                  key={header}
                                  className="px-4 py-4 text-left font-semibold text-slate-700 border-b border-slate-200 text-sm"
                                >
                                  {header}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {payments.map((payment, index) => (
                              <motion.tr
                                key={payment.paymentid}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className={`border-b border-slate-100 hover:bg-green-50 transition-colors ${
                                  index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                                }`}
                              >
                                <td className="py-4 px-4">
                                  <span className="text-slate-800 font-semibold text-sm">
                                    {payment.customername}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-xl font-bold text-emerald-600">
                                    ₹{parseFloat(payment.customerpayment).toFixed(2)}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openUpdateModal(payment)}
                                      className="p-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl transition-all shadow-sm"
                                      title="Edit Payment"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteModal({ isOpen: true, item: payment })
                                      }
                                      className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all shadow-sm"
                                      title="Delete Payment"
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
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center justify-center h-96">
                <div className="text-center">
                  <Users className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">
                    Select a Customer
                  </h3>
                  <p className="text-slate-500">
                    Choose a customer from the left panel to view their payments
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Reusing existing UpdateModal component */}
      <UpdateModal
        isOpen={updateModal.isOpen}
        title="Update Payment"
        label="Payment Amount (₹)"
        placeholder="Enter payment amount"
        newValue={newPaymentValue}
        setNewValue={setNewPaymentValue}
        onUpdate={handleUpdate}
        onClose={() => {
          setUpdateModal({ isOpen: false, item: null });
          setNewPaymentValue("");
        }}
        isLoading={isLoading}
      />

      {/* Reusing existing DeleteModal component */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Payment"
        message="Are you sure want to delete:"
        itemName={deleteModal.item?.customername}
        warningText="This payment record will be permanently removed"
        onDelete={handleDelete}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        isLoading={isLoading}
      />
    </div>
  );
}

export default PaymentEdit;