import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import insatnces from './axios';

function Customerdropdown({ 
  selectedCustomer, 
  onCustomerSelect, 
  className = ""
}) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const sortAlpha = (list) =>
    [...list].sort((a, b) =>
      a.customername.toLowerCase().localeCompare(b.customername.toLowerCase())
    );

  useEffect(() => {
    setIsLoading(true);
    insatnces.get("/customer/all")
      .then((res) => {
        const sorted = sortAlpha(res.data || []);
        setCustomers(sorted);
        setFilteredCustomers(sorted);
        setIsLoading(false);
      })
      .catch(() => {
        setCustomers([]);
        setFilteredCustomers([]);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      setFilteredCustomers(
        sortAlpha(customers.filter((c) =>
          c.customername?.toLowerCase().includes(q)
        ))
      );
    } else {
      setFilteredCustomers(sortAlpha(customers));
    }
  }, [searchTerm, customers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
        <span className="text-slate-500 text-sm font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        <input
          type="text"
          placeholder="Search customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl 
                     focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 
                     bg-white text-sm font-medium transition-all outline-none"
        />
      </div>

      {/* Customer List — fixed height showing ~6 rows */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="max-h-[180px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer.customerid}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onCustomerSelect(customer)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer 
                              border-b border-slate-100 last:border-b-0 transition-colors duration-150
                              ${selectedCustomer?.customerid === customer.customerid
                                ? 'bg-emerald-50 border-l-2 border-l-emerald-500'
                                : 'bg-white hover:bg-green-50'
                              }`}
                >
                  <span className={`text-sm font-medium ${
                    selectedCustomer?.customerid === customer.customerid
                      ? 'text-emerald-700'
                      : 'text-slate-700'
                  }`}>
                    {customer.customername}
                  </span>
                  {selectedCustomer?.customerid === customer.customerid && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {searchTerm ? `No match for "${searchTerm}"` : 'No customers found'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        
      </div>
    </div>
  );
}

export default Customerdropdown;