import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Leaf,
  Menu,
  X,
  User,
  BarChart3,
  Package,
  DollarSign,
  Home,
  ShoppingCart,
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [

  {
    to:
      user?.role === "ROLE_ADMIN" || user?.role === "ROLE_MANAGER"
        ? "/dashboard"
        : "/",

    label: "Home",

    icon: <Home className="w-5 h-5" />
  },

  ...(      user?.role === "ROLE_ADMIN" || user?.role === "ROLE_MANAGER"


    ? [

        {
          to: "/stock",

          label: "Stock",

          icon: (
            <Package className="w-5 h-5" />
          )
        },

        {
          to: "/sale",

          label: "Order",

          icon: (
            <ShoppingCart className="w-5 h-5" />
          )
        },

        {
          to: "/finance",

          label: "Finance",

          icon: (
            <DollarSign className="w-5 h-5" />
          )
        },

        {
          to: "/dashboard",

          label: "Reports",

          icon: (
            <BarChart3 className="w-5 h-5" />
          )
        },

      ]

    : []),
];

  const isHome = location.pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isHome
          ? 'bg-transparent py-5'
          : scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-green-200 shadow-md py-2'
          : 'bg-green-600 shadow-md py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-green-500 p-2 rounded-lg shadow-md transition-transform group-hover:scale-105">
              <Leaf className="w-6 h-6 text-white" />
            </div>

            <h1
              className={`text-2xl font-black ${
                isHome
                  ? 'text-white'
                  : scrolled
                  ? 'text-green-600'
                  : 'text-white'
              }`}
            >
              GVV
            </h1>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'bg-green-500 text-white shadow-md'
                    : isHome
                    ? 'text-white hover:bg-white/20'
                    : scrolled
                    ? 'text-slate-700 hover:bg-green-50'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            {user ? (
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold border transition-all ${
                  isHome
                    ? 'text-white border-white hover:bg-white/20'
                    : scrolled
                    ? 'text-slate-700 border-slate-300 hover:bg-green-50'
                    : 'text-white border-white hover:bg-white/20'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            ) : (
              <Link
                to="/login"
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold border transition-all ${
                  isHome
                    ? 'text-white border-white hover:bg-white/20'
                    : scrolled
                    ? 'text-slate-700 border-slate-300 hover:bg-green-50'
                    : 'text-white border-white hover:bg-white/20'
                }`}
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden ${
              isHome ? 'text-white' : scrolled ? 'text-slate-700' : 'text-white'
            }`}
          >
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  location.pathname === link.to
                    ? 'bg-green-500 text-white'
                    : 'text-slate-700 hover:bg-green-50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {user ? (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-700 hover:bg-green-50 transition-all"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-slate-700 hover:bg-green-50 transition-all"
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;