import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, Trash2, Users, UserX, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import insatnces from '../../../components/axios';
import UpdateModal from '../../../components/UpdateModal';
import DeleteModal from '../../../components/DeleteModal';  

function CustomerEdit() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [newName, setNewName] = useState('');
  const [popType, setPopType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // ✅ ALPHABETICAL SORTING FUNCTION
  const sortAlphabetically = (customerList) => {
    return [...customerList].sort((a, b) => 
      a.customername.toLowerCase().localeCompare(b.customername.toLowerCase())
    );
  };

  useEffect(() => {
    setIsPageLoading(true);
    insatnces.get("/customer/all")
      .then((response) => {
        const sortedCustomers = sortAlphabetically(response.data || []);
        setCustomers(sortedCustomers);
        setFilteredCustomers(sortedCustomers);
      })
      .catch((error) => {
        console.log("Error loading customer names", error);
        setCustomers([]);
        setFilteredCustomers([]);
      })
      .finally(() => {
        setTimeout(() => setIsPageLoading(false), 500);
      });
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = customers.filter(c =>
      c.customername.toLowerCase().startsWith(value)
    );
    // ✅ Keep alphabetical order in filtered results
    setFilteredCustomers(sortAlphabetically(filtered));
  };

  const startEdit = (id, name) => {
    setSelectedId(id);
    setNewName(name);
    setPopType("edit");
  };

  const startDelete = (id) => {
    setSelectedId(id);
    setPopType("delete");
  };

  const updateCustomer = async () => {
    if (!newName.trim()) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      errorDiv.textContent = 'Name cannot be empty';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 3000);
      return;
    }

    setIsLoading(true);
    try {
      await insatnces.put(`/customer/${selectedId}`, { customername: newName });
      
      const updatedCustomers = customers.map(c =>
        c.customerid === selectedId ? { ...c, customername: newName } : c
      );
      const sortedCustomers = sortAlphabetically(updatedCustomers);
      
      setCustomers(sortedCustomers);
      setFilteredCustomers(sortAlphabetically(
        filteredCustomers.map(c =>
          c.customerid === selectedId ? { ...c, customername: newName } : c
        )
      ));

      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      successDiv.textContent = 'Customer updated successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);

      closePopup();
    } catch (error) {
      console.log("Update error", error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      errorDiv.textContent = 'Update failed. Please try again.';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async () => {
    setIsLoading(true);
    try {
      await insatnces.delete(`/customer/${selectedId}`);
      
      setCustomers(prev => prev.filter(c => c.customerid !== selectedId));
      setFilteredCustomers(prev => prev.filter(c => c.customerid !== selectedId));

      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      successDiv.textContent = 'Customer deleted successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);

      closePopup();
    } catch (error) {
      console.log("Delete error", error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
      errorDiv.textContent = 'Cannot delete customer. May have associated records.';
      document.body.appendChild(errorDiv);
      setTimeout(() => document.body.removeChild(errorDiv), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setPopType(null);
    setSelectedId(null);
    setNewName('');
  };

  // Stats calculations
  const totalCustomers = filteredCustomers.length;
  const allCustomers = customers.length;
  
  const stats = [
    { 
      title: "Total Customers", 
      value: allCustomers.toString(), 
      icon: <Users className="w-6 h-6" />, 
      color: "from-green-500 to-emerald-500", 
      change: "Registered" 
    },
    { 
      title: "Filtered Results", 
      value: totalCustomers.toString(), 
      icon: <Search className="w-6 h-6" />, 
      color: "from-emerald-500 to-teal-500", 
      change: "Showing" 
    },
    { 
      title: "Alphabetical", 
      value: "A-Z", 
      icon: <Users className="w-6 h-6" />, 
      color: "from-teal-500 to-green-500", 
      change: "Sorted" 
    },
  ];

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Loading Customers</h2>
          <p className="text-green-600">Please wait...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-green-300/10 to-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-teal-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-200/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
        className="relative z-10 max-w-7xl mx-auto space-y-6"
      >
        
        {/* ✅ MEDIUM SIZED Header - Same as Customer Report */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-xl"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 mb-3 leading-tight">
            <span className="text-green-600">Customer Management</span>
          </h1>
          <p className="text-slate-600 text-base mb-4">Update and delete customers efficiently (A-Z Sorted)</p>
        </motion.div>

        {/* ✅ MEDIUM SIZED Stats - Same as Customer Report */}
        

        {/* ✅ MEDIUM SIZED Search Section - Same as Customer Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
            <h2 className="text-lg font-bold text-white flex items-center">
              <div className="bg-white/20 p-2 rounded-xl mr-3">
                <Search className="w-5 h-5 text-white" />
              </div>
              Search Customers
              <Sparkles className="w-4 h-4 ml-3 text-yellow-300" />
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Find Customers</h3>
                <p className="text-slate-600 text-sm">Search customers in alphabetical order</p>
              </div>

              <button 
                onClick={() => {
                  setSearchTerm("");
                  const sortedCustomers = sortAlphabetically(customers);
                  setFilteredCustomers(sortedCustomers);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-300 hover:scale-105 shadow-md font-medium text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Refresh All</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              <input
                type="text"
                placeholder="Search customers by name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-6 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl text-green-900 placeholder-green-500"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
                <motion.div
                  animate={{ scale: searchTerm ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm font-semibold"
                >
                  {filteredCustomers.length} found
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ MEDIUM SIZED Customer Table - Same as Customer Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center">
                <div className="bg-white/20 p-2 rounded-xl mr-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Customer Database ({filteredCustomers.length} customers - A-Z sorted)
                <Filter className="w-4 h-4 ml-3 text-yellow-300" />
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            {filteredCustomers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center"
                >
                  <UserX className="w-6 h-6 text-gray-500" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No Customers Found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
              </motion.div>
            ) : (
              <div className="overflow-hidden rounded-xl border-2 border-slate-200 shadow-xl">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700 border-b border-slate-300 text-base">
                        S.No
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700 border-b border-slate-300 text-base">
                        Customer Name
                      </th>
                      
                      <th className="px-6 py-3 text-center font-semibold text-slate-700 border-b border-slate-300 text-base">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredCustomers.map((customer, index) => (
                        <motion.tr
                          key={customer.customerid}
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            transition: { duration: 0.2 }
                          }}
                          className={`cursor-pointer transition-colors duration-300 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                          }`}
                        >
                          <td className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mr-3 shadow-lg"
                              >
                                <span className="text-white font-bold text-xs">
                                  {index + 1}
                                </span>
                              </motion.div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-3 shadow-lg"
                              >
                                <span className="text-white font-bold text-base">
                                  {customer.customername.charAt(0).toUpperCase()}
                                </span>
                              </motion.div>
                              <div>
                                <p className="text-lg font-bold text-slate-800">
                                  {customer.customername}
                                </p>
                                
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 border-b border-slate-100">
                            <div className="flex justify-center space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => startEdit(customer.customerid, customer.customername)}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                              >
                                <Edit3 className="w-4 h-4 mr-1" />
                                Edit
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => startDelete(customer.customerid)}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </motion.button>
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
        </motion.div>
      </motion.div>

      {/* ✅ REUSABLE MODALS */}
      <UpdateModal
        isOpen={popType === "edit"}
        newValue={newName}
        setNewValue={setNewName}
        onUpdate={updateCustomer}
        onClose={closePopup}
        isLoading={isLoading}
        title="Update Customer"
        label="Customer Name"
        placeholder="Enter customer name"
      />

      <DeleteModal
        isOpen={popType === "delete"}
        itemName={customers.find(c => c.customerid === selectedId)?.customername || ""}
        onDelete={deleteCustomer}
        onClose={closePopup}
        isLoading={isLoading}
        title="Delete Customer"
        message="Are you sure you want to delete this customer:"
      />

      {/* Floating Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "0s" }}></div>
      <div className="fixed top-40 right-10 w-16 h-16 bg-emerald-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "1s" }}></div>
      <div className="fixed bottom-20 left-20 w-12 h-12 bg-teal-500/20 rounded-full opacity-60 animate-bounce" style={{ animationDelay: "2s" }}></div>
    </div>
  );
}

export default CustomerEdit;
