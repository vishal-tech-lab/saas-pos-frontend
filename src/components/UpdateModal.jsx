import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, CheckCircle, X } from 'lucide-react';

function UpdateModal({ 
  isOpen, 
  newValue, 
  setNewValue, 
  onUpdate, 
  onClose, 
  isLoading, 
  title = "Update Item",
  label = "Name",
  placeholder = "Enter name"
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-md relative overflow-hidden"
        >
          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundImage: "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%2310b981\" fill-opacity=\"0.1\"><circle cx=\"30\" cy=\"30\" r=\"4\"/></g></g></svg>')",
            }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-full shadow-lg">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-600">Update the information below</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>
<input
  type="text"
  // Ensure newValue is always treated as a string for the input
  value={newValue || ""} 
  onChange={(e) => setNewValue(e.target.value)}
  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white/80 transition-all duration-300 font-semibold"
  placeholder={placeholder}
  autoFocus
/>
            </motion.div>

            {/* ✅ FIXED BUTTONS - Same size and perfectly centered */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center space-x-4"
            >
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-24 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold disabled:opacity-50"
              >

                Cancel
              </button>
              <button
                onClick={onUpdate}
disabled={isLoading || !String(newValue || "").trim()}
                className={`w-28 px-6 py-3 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center ${
                  isLoading || !newValue.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Update</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default UpdateModal;
