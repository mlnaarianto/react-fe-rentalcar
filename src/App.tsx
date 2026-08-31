import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CarDetail from "./pages/CarDetail";
import { CarPage } from "./pages/CarPage";
import { CarAddPage } from "./pages/CarAddPage";
import { HistoryPage } from "./pages/HistoryPage";
import { CarBookingPage } from "./pages/CarBookingPage";
import { ChatPage } from "./pages/ChatPage";
import { RentalsBookingPage } from "./pages/RentalsBookingPage";
import { DriverBookingsPage } from "./pages/DriverBookingsPage";
import { RentalApplicationPage } from "./pages/RentalApplicationPage";
import NotificationPage from "./pages/NotificationPage"; // 👈 Impor halaman Notifikasi
import { useAuth } from "./hooks/useAuth";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rute Dashboard yang dilindungi */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Rute Profil yang dilindungi */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Rute Daftar Mobil (CarPage) yang dilindungi */}
        <Route
          path="/cars"
          element={
            <ProtectedRoute>
              <CarPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Riwayat Pemesanan (HistoryPage) */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Halaman Kelola Pesanan & Driver (Perental/Admin) */}
        <Route
          path="/rentals-bookings"
          element={
            <ProtectedRoute>
              <RentalsBookingPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Halaman Tugas Penugasan Driver */}
        <Route
          path="/driver-bookings"
          element={
            <ProtectedRoute>
              <DriverBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Halaman Pengajuan Perental */}
        <Route
          path="/rental-application"
          element={
            <ProtectedRoute>
              <RentalApplicationPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Halaman Notifikasi */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Halaman Chat Real-time */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Tambah Mobil */}
        <Route
          path="/car-add"
          element={
            <ProtectedRoute>
              <CarAddPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Edit Mobil berdasarkan ID */}
        <Route
          path="/cars/:id/edit"
          element={
            <ProtectedRoute>
              <CarAddPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Form Pemesanan Mobil */}
        <Route
          path="/cars/:id/book"
          element={
            <ProtectedRoute>
              <CarBookingPage />
            </ProtectedRoute>
          }
        />

        {/* Rute Detail Mobil yang dilindungi */}
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;