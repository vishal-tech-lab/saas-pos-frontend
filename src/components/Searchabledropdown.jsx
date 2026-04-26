import { useState, useEffect } from "react";
import { Search } from "lucide-react";

function SearchableDropdown({ options, onSelect, labelKey, onSearch, value }) {
  const [search, setSearch] = useState(value || "");

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  // Local filter if parent didn’t provide onSearch
  const filteredOptions = !onSearch
    ? options.filter((opt) =>
        (opt[labelKey] || "")
          .toLowerCase()
          .startsWith(search.toLowerCase())
      )
    : options;

  return (
    <div className="w-full">
      {/* 🔍 Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
          className="w-full pl-12 pr-4 py-3 border-2 rounded-xl 
                     focus:ring-2 border-green-200 focus:ring-green-500 
                     bg-white/80"
        />
      </div>

      {/* 📋 Styled List Area */}
    {/* 📋 Styled List Area */}
<div className="bg-white/80 border-2 border-green-200 rounded-xl p-4 
                min-h-[300px] max-h-[300px] overflow-y-auto space-y-2">
  {filteredOptions.length > 0 ? (
    filteredOptions.map((opt, i) => (
      <div
        key={i}
        onClick={() => {
          onSelect && onSelect(opt);
          setSearch(opt[labelKey]); // show selection in input
        }}
        className="p-3 rounded-lg shadow-sm border cursor-pointer 
                   hover:bg-green-50 transition"
      >
        {opt[labelKey]}
      </div>
    ))
  ) : (
    <div className="text-gray-500">No results</div>
  )}
</div>

    </div>
  );
}

export default SearchableDropdown;
