import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiBell, FiLogOut, FiUser, FiChevronDown, FiSearch, FiX, FiAward } from "react-icons/fi";
import api from "../lib/axios";
import echo from "../lib/echo"; // 🟢 TAMBAHAN: koneksi real-time Reverb

interface NavbarProps {
  user: {
    id: number;          // 🟢 TAMBAHAN: dibutuhkan untuk channel notifikasi
    name?: string;
    email?: string;
    avatar?: string;
    roles?: string[];
  };
  onToggleSidebar: () => void;
  logout: () => void;
  onSearchChange?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onToggleSidebar, logout, onSearchChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Izinkan search bar muncul di /dashboard DAN /cars
  const showSearch = location.pathname === '/dashboard' || location.pathname === '/cars';

  // Cek status notifikasi unread dari backend
  const checkNotificationStatus = async () => {
    try {
      const response = await api.get("/api/notifications");
      const notifications = response.data.data || [];
      // Cek apakah ada yang is_read-nya false
      const hasUnread = notifications.some((notif: any) => notif.is_read === false);
      setHasNewNotifications(hasUnread);
    } catch (_) {
      // Abaikan error koneksi
    }
  };

  useEffect(() => {
    checkNotificationStatus();
  }, [location.pathname]); // Refresh status setiap pindah halaman atau kembali dari notifikasi

  // 🟢 TAMBAHAN: Listener real-time — badge langsung nyala begitu ada
  // notifikasi baru masuk dari Reverb, tanpa perlu pindah halaman dulu.
  // Ini pelengkap checkNotificationStatus() di atas (yang tetap jadi
  // fallback kalau koneksi WebSocket sempat putus).
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `notifications.${user.id}`;

    echo
      .private(channelName)
      .listen(".notification.created", () => {
        setHasNewNotifications(true);
      });

    return () => {
      echo.leave(channelName);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!showSearch && searchQuery) {
      setSearchQuery("");
      if (onSearchChange) onSearchChange("");
    }
  }, [location.pathname]);

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
      onSearchChange(value);
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
          
          {/* Bagian Tengah: Search Bar MUNCUL DI DASHBOARD & CARS */}
          {showSearch && (
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiSearch className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Cari nama mobil, merek, atau pemilik..."
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sisi Kanan: Notifikasi & Profil dengan Dropdown */}
          <div className="flex items-center gap-3">
            <Link 
              to="/notifications" 
              onClick={() => setHasNewNotifications(false)} // Langsung hilangkan titik merah saat diklik
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all flex items-center justify-center"
              title="Notifikasi"
            >
              <FiBell className="h-5 w-5" />
              {/* Titik Indikator Merah (Hanya muncul jika ada unread) */}
              {hasNewNotifications && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>

            {/* Profil Dropdown Container */}
            <div className="relative border-l pl-3 sm:pl-4 border-gray-200" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 focus:outline-none group py-1 rounded-xl px-2 hover:bg-gray-50 transition-all"
              >
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
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
                <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 hidden md:block ${dropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {/* Menu Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                  
                  <div className="px-4 py-3 mx-2 bg-gray-50/80 rounded-xl mb-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                      
                      <div className="flex flex-shrink-0 gap-1">
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
                          <span className="px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded-md">
                            No Role
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="px-2 py-1 space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group"
                    >
                      <span className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 transition-colors">
                        <FiUser className="h-4 w-4" />
                      </span>
                      Profil Saya
                    </Link>

                    <Link
                      to="/rental-application"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group"
                    >
                      <span className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 transition-colors">
                        <FiAward className="h-4 w-4" />
                      </span>
                      Pengajuan Perental
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-100 my-1.5 mx-2"></div>

                  <div className="px-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium group"
                    >
                      <span className="p-2 rounded-lg bg-red-100/60 text-red-500 group-hover:bg-red-100 transition-colors">
                        <FiLogOut className="h-4 w-4" />
                      </span>
                      Logout
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>

        {/* Search bar versi Mobile khusus di Dashboard & Cars */}
        {showSearch && (
          <div className="pb-3 pt-1 sm:hidden">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Cari nama mobil, merek, atau pemilik..."
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

export default Navbar;