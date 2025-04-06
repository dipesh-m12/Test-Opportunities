import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Menu } from "lucide-react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="text-gray-700 focus:outline-none"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex justify-end p-4">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col items-center space-y-8 p-8">
            <Link
              to="#features"
              className="text-xl font-medium text-gray-700 hover:text-blue-600"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link
              to="#how-it-works"
              className="text-xl font-medium text-gray-700 hover:text-blue-600"
              onClick={toggleMenu}
            >
              How It Works
            </Link>
            <Link
              to="#pricing"
              className="text-xl font-medium text-gray-700 hover:text-blue-600"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
            <Link
              to="#case-studies"
              className="text-xl font-medium text-gray-700 hover:text-blue-600"
              onClick={toggleMenu}
            >
              Case Studies
            </Link>
            <Link
              to="/login"
              className="text-xl font-medium text-gray-700 hover:text-blue-600"
              onClick={toggleMenu}
            >
              Login
            </Link>
            <Link
              to="/get-started"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity w-full text-center"
              onClick={toggleMenu}
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
