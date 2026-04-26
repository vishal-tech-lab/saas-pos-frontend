import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import insatnces from "./axios";
import { sortTamil } from "../utils/sortTamil";

function Itemdropdown({ value, onSelect }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSearch, setLastSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = () => {
    insatnces
      .get("/item/items")
      .then((res) => {
        setItems(sortTamil(res.data));
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = (query) => {
    setSearchTerm(query);
    setLastSearch(query);
    if (!query.trim()) {
      fetchItems();
      return;
    }
    insatnces
      .get(`/item/search?query=${query}`)
      .then((res) => {
        const data = res.data;
        if (data.length === 0) {
          setItems([{ itemname: `Add "${query}"`, _isNew: true }]);
        } else {
          setItems(sortTamil(data));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSelect = (item) => {
    if (item._isNew) {
      insatnces
        .post("/item/register", { itemname: lastSearch, itemprice: 0 })
        .then((res) => {
          onSelect && onSelect(res.data);
          setSearchTerm("");
          fetchItems();
        })
        .catch((err) => alert("Error adding item: " + err));
    } else {
      onSelect && onSelect(item);
      setSearchTerm(item.itemname);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
        <span className="text-slate-500 text-sm font-medium">Loading items...</span>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        <input
          type="text"
          placeholder="Search item..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl
                     focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400
                     bg-white text-sm font-medium transition-all outline-none"
        />
      </div>

      {/* Item List — same height as customer dropdown */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="max-h-[180px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {items.length > 0 ? (
              items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleSelect(item)}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer
                              border-b border-slate-100 last:border-b-0 transition-colors duration-150
                              ${item._isNew
                                ? 'bg-emerald-50 hover:bg-emerald-100'
                                : value === item.itemname
                                  ? 'bg-emerald-50 border-l-2 border-l-emerald-500'
                                  : 'bg-white hover:bg-green-50'
                              }`}
                >
                  <span className={`text-sm font-medium ${
                    item._isNew
                      ? 'text-emerald-600'
                      : value === item.itemname
                        ? 'text-emerald-700'
                        : 'text-slate-700'
                  }`}>
                    {item.itemname}
                  </span>

                  {item._isNew && (
                    <Plus className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                  {!item._isNew && value === item.itemname && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 font-medium">No items found</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        
      </div>
    </div>
  );
}

export default Itemdropdown;