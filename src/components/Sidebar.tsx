import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiUser, 
  FiX, 
  FiHome, 
  FiTruck, 
  FiClock, 
  FiClipboard, 
  FiNavigation, 
  FiMessageSquare 
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  // Deteksi role dari berbagai kemungkinan format struktur data API Laravel
  const userRoleStr = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
  const userRolesArr = Array.isArray(user?.roles) 
    ? user.roles.map((r: any) => (typeof r === 'string' ? r : r.name)?.toLowerCase()) 
    : [];

  const isDriver = userRoleStr === 'driver' || userRolesArr.includes('driver');
  const isPerental = userRoleStr === 'perental' || userRolesArr.includes('perental');
  const isSuperAdmin = userRoleStr === 'super_admin' || userRolesArr.includes('super_admin');

  // ID Unik untuk Chat Admin (CS)
  const userEmail = user?.email || "";
  const uniqueChatId = `room_user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

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
        <div className="flex flex-col h-full">
          {/* Logo / Brand Mobil & Tombol Close (Mobile) */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
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
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg md:hidden cursor-pointer"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Navigation */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            
            {/* Menu Utama Penyewa */}
            <Link 
              to="/dashboard" 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive('/dashboard') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiHome className="w-5 h-5" />
              Dashboard
            </Link>

            <Link 
              to="/cars" 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive('/cars') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiTruck className="h-5 w-5" />
              Mobil
            </Link>

            <Link 
              to="/history" 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive('/history') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiClock className="h-5 w-5" />
              Riwayat
            </Link>

            {/* BANTUAN / CHAT ADMIN */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Bantuan</p>
            </div>
            
            <Link 
              to={`/chat?room=${uniqueChatId}&name=${encodeURIComponent("Admin Rental (CS)")}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
            >
              <FiMessageSquare className="h-5 w-5 text-blue-600" />
              Chat Admin (CS)
            </Link>

            {/* MENU KHUSUS DRIVER */}
            {isDriver && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Menu Driver</p>
                </div>
                <Link 
                  to="/driver-bookings" 
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <FiNavigation className="h-5 w-5 text-purple-600" />
                  Tugas Penugasan
                </Link>
              </>
            )}

            {/* MANAJEMEN RENTAL (Perental / Super Admin) */}
            {(isPerental || isSuperAdmin) && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Manajemen Rental</p>
                </div>
                <Link 
                  to="/rentals-bookings" 
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <FiClipboard className="h-5 w-5 text-blue-600" />
                  Kelola Pesanan & Driver
                </Link>
              </>
            )}

          </nav>

          {/* Profil Saya di Bagian Paling Bawah */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <Link 
              to="/profile" 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive('/profile') ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiUser className="h-5 w-5" />
              Profil Saya
            </Link>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;