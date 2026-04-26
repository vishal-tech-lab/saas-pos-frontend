import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

function DeleteModal({ 
  isOpen, 
  itemName, 
  onDelete, 
  onClose, 
  isLoading, 
  title = "Delete Item",
  message = "Are you sure want to delete:",
  warningText = "This action cannot be undone"
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
          {/* ✅ Same animated background as update popup */}
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
              backgroundImage: "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ef4444\" fill-opacity=\"0.1\"><circle cx=\"30\" cy=\"30\" r=\"4\"/></g></g></svg>')",
            }}
          />

          <div className="relative z-10">
            {/* ✅ Professional icon with same styling */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-full shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* ✅ Title and subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-600">{warningText}</p>
            </motion.div>

            {/* ✅ PROFESSIONAL WARNING BOX */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-red-50/80 to-rose-50/80 backdrop-blur-sm border-2 border-red-200/60 rounded-2xl p-6 mb-6 shadow-inner relative overflow-hidden"
            >
              {/* ✅ Subtle pattern overlay */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "url('data:image/svg+xml,<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ef4444\" fill-opacity=\"0.3\"><rect x=\"0\" y=\"0\" width=\"4\" height=\"4\"/></g></g></svg>')",
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-500/20 p-2 rounded-lg mr-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-bold text-red-800 text-center">{message}</span>
                </div>
                
                {/* ✅ Professional name display */}
                <div className="bg-white/80 backdrop-blur-sm border border-red-300/50 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xl font-black text-red-900 break-words">
                    "{itemName}"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ✅ PERFECTLY ALIGNED BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center items-center space-x-4"
            >
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-28 h-12 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold disabled:opacity-50 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                onClick={onDelete}
                disabled={isLoading}
                className={`w-32 h-12 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span>Yes, Delete</span>
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

export default DeleteModal;
