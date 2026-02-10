import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = ["home", "projects", "skills", "contact"];

  return (
    <nav className="fixed top-0 w-full z-50 glass transition-all backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Aditya M
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link}`}
              className="nav-link px-4 py-2 hover:text-blue-300 transition-colors capitalize"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(link).scrollIntoView({ behavior: "smooth" });
              }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-6">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link}`}
              className="nav-link px-4 py-2 hover:text-blue-300 transition-colors capitalize"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(link).scrollIntoView({ behavior: "smooth" });
                setIsOpen(false);
              }}
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
