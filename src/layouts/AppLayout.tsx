import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer";

interface AppLayoutProps {
  user: {
    name?: string;
    email?: string;
    avatar?: string;
    roles?: string[];
  };
  logout: () => void;
  children: React.ReactNode;
  onSearchChange?: (query: string) => void; // 👈 Tambahkan ini
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user, logout, children, onSearchChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (user?.name) {
      const params = new URLSearchParams(window.location.search);
      const isJustLoggedIn = params.get("welcome") === "true";
      const hasShownWelcome = sessionStorage.getItem("welcomed_this_session");

      if (isJustLoggedIn || !hasShownWelcome) {
        Swal.fire({
          icon: 'success',
          title: `Selamat Datang, ${user.name}!`,
          text: 'Senang melihatmu kembali di RentalCar. Selamat beraktivitas!',
          timer: 2500,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        sessionStorage.setItem("welcomed_this_session", "true");

        if (isJustLoggedIn) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    }
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar Kiri */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Konten Kanan */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          user={user} 
          onToggleSidebar={toggleSidebar} 
          logout={logout}
          onSearchChange={onSearchChange} // 👈 Teruskan ke Navbar
        />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};