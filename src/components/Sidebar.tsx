import React from "react";
import { Link, useLocation } from "react-router-dom"; // 👈 Impor Link dan useLocation
import { FiUser, FiActivity, FiSettings, FiX, FiHome } from "react-icons/fi";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation(); // Untuk mendeteksi halaman aktif saat ini

  // Helper untuk mengecek apakah link sedang aktif
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Backdrop khusus Mobile ketika Sidebar terbuka */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Konten Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-none"
        }`}
      >
        <div>
          {/* Logo / Brand Mobil & Tombol Close (Mobile) */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.76l.12.34V17z" />
                  <circle cx="7.5" cy="14.5" r="1.5" />
                  <circle cx="16.5" cy="14.5" r="1.5" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-[#1E293B]">
                RentalCar
              </span>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg md:hidden"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Navigation Menggunakan React Router Link */}
          <nav className="p-4 space-y-1.5">
            <Link 
              to="/dashboard" 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive('/dashboard') 
                  ? 'text-blue-600 bg-blue-50 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiHome className="w-5 h-5" />
              Dashboard
            </Link>

            <Link 
              to="/profile" 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive('/profile') 
                  ? 'text-blue-600 bg-blue-50 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiUser className="h-5 w-5" />
              Profil Saya
            </Link>

            <a 
              href="#activity" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <FiActivity className="h-5 w-5" />
              Aktivitas
            </a>
            
            <a 
              href="#settings" 
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <FiSettings className="h-5 w-5" />
              Pengaturan
            </a>
          </nav>
        </div>
      </aside>
    </>
  );
};