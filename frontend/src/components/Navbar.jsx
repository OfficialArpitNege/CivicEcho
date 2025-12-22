import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiMap, FiAlertCircle, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FiAlertCircle className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800 hidden sm:block">CivicEcho</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
            >
              <FiHome />
              Dashboard
            </Link>
            <Link
              to="/report"
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
            >
              <FiAlertCircle />
              Report Issue
            </Link>
            <Link
              to="/map"
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
            >
              <FiMap />
              Map View
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 transition"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/report"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Report Issue
            </Link>
            <Link
              to="/map"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Map View
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
