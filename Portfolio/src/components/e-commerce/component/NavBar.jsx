import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaShoppingBag, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NavBar = ({ cartCount, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      if (onSearch) onSearch(searchTerm);
    }
  };
  const [tokens, setTokens] = useState();
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const [internalCartCount, setInternalCartCount] = useState(0);

  // Prefer prop if provided, else fall back to internal
  // If cartCount is undefined (not passed), use internal.
  // If cartCount passed (even 0), use it.
  const displayCount = cartCount !== undefined ? cartCount : internalCartCount;

  // ... (keep logout) ...
  const logoutButton = () => {
    localStorage.removeItem("token");
    navigate("/grocery/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setTokens(token);
    if (token) {
      axios
        .get("https://grocery-ai.onrender.com/api/cart", {
          headers: { Authorization: token },
        })
        .then((res) => {
          setInternalCartCount(res.data.length || 0);
          console.log("Updated totalCartCount in App:", res.data.length);
        })
        .catch((err) => {
          console.error("Failed to fetch cart count in App:", err);
        });
    }
  }, [cartCount]); // Add cartCount dependency to re-syn if needed, or just keep as mount only

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/grocery/home")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Fresh<span className="text-green-600">Mart</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8"></nav>

          {/* Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={() => navigate("/grocery/home/cart")}
              className="text-gray-600 hover:text-blue-600 transition relative"
            >
              <FaShoppingBag className="text-xl" />
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {displayCount}
              </span>
            </button>

            {/* User menu wrapper (IMPORTANT) */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="text-gray-600 hover:text-blue-600 transition"
              >
                <FaUser className="text-xl" />
              </button>
              {tokens
                ? open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                      <ul className="py-2 text-sm text-gray-700">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          Profile
                        </li>
                        <li
                          onClick={() =>
                            navigate("/grocery/home/order-history")
                          }
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          OrderHistory
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => logoutButton()}
                        >
                          Logout
                        </li>
                      </ul>
                    </div>
                  )
                : open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                      <ul className="py-2 text-sm text-gray-700">
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            navigate("/grocery/login");
                          }}
                        >
                          Login
                        </li>
                      </ul>
                    </div>
                  )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FaBars className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-3">
          <p
            onClick={() => navigate("/grocery/home")}
            className="block text-gray-700 font-medium cursor-pointer"
          >
            Home
          </p>
          <p className="block text-gray-700 font-medium cursor-pointer">
            Profile
          </p>
          <p
            onClick={() => navigate("/grocery/home/order-history")}
            className="block text-gray-700 font-medium cursor-pointer"
          >
            OrderHistory
          </p>
          {/* <p href="#" className="block text-gray-700 font-medium">About</p> */}
          {/* <div className="relative">
                        <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full" />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div> */}
        </div>
      )}
    </header>
  );
};

export default NavBar;
