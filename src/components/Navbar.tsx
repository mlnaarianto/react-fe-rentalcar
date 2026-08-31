import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // 👈 Impor useLocation
import { FiMenu, FiBell, FiSettings, FiLogOut, FiUser, FiChevronDown, FiSearch, FiX } from "react-icons/fi"; // 👈 Impor FiSearch & FiX

interface NavbarProps {
  user: {
    name?: string;
    email?: string;
    avatar?: string;
    roles?: string[];
  };
  onToggleSidebar: () => void;
  logout: () => void;
  onSearchChange?: (query: string) => void; // 👈 Callback untuk mengirim teks pencarian
}

export const Navbar: React.FC<NavbarProps> = ({ user, onToggleSidebar, logout, onSearchChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation(); // 👈 Mendeteksi path aktif saat ini

  // Cek apakah halaman saat ini adalah /dashboard
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value); // 👈 Kirim teks ke parent (Dashboard)
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super admin':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'perental':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'driver':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-orange-50 text-orange-600 border-orange-200';
    }
  };

  return (
    <header className="bg-white/85 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Sisi Kiri: Tombol Hamburger & Brand Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all focus:outline-none"
              title="Toggle Sidebar"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-gray-800 md:hidden">RentalCar</span>
          </div>
          
          {/* Bagian Tengah: Search Bar HANYA MUNCUL DI DASHBOARD */}
          {isDashboard && (
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiSearch className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Cari nama mobil atau merek..."
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sisi Kanan: Notifikasi, Settings, Profil dengan Dropdown */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <FiBell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all hidden sm:block">
              <FiSettings className="h-5 w-5" />
            </button>

            {/* Profil Dropdown Container */}
            <div className="relative border-l pl-3 sm:pl-4 border-gray-200" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 focus:outline-none group py-1"
              >
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
                <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 hidden md:block ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getRoleBadgeColor(role)}`}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-50 rounded-md">
                          No Role Assigned
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiUser className="h-4 w-4 text-gray-400" />
                    Profil Saya
                  </Link>

                  <a
                    href="#settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiSettings className="h-4 w-4 text-gray-400" />
                    Pengaturan Akun
                  </a>
                  
                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Search bar versi Mobile khusus di halaman Dashboard */}
        {isDashboard && (
          <div className="pb-3 pt-1 sm:hidden">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Cari nama mobil atau merek..."
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};