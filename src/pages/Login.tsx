import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";

const Login: React.FC = () => {
  const { user, loading, error, loginWithGoogle, fetchUser } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    
    if (hash === '#success') {
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: 'Mengalihkan ke dashboard...',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchUser();
    }
    
    if (params.get("error")) {
      const errorMsg = decodeURIComponent(params.get("error") || "Terjadi kesalahan");
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: errorMsg,
        confirmButtonColor: '#2563EB',
      });
      window.history.replaceState({}, '', '/login');
    }
  }, [fetchUser]);

  const handleGoogleLogin = () => {
    Swal.fire({
      title: 'Menghubungkan ke Google',
      text: 'Mohon tunggu sebentar...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    loginWithGoogle();
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
          <p className="text-gray-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col justify-between selection:bg-[#2563EB] selection:text-white">
      
      {/* Header / Navbar yang Lebih Tebal, Solid, dan Profesional */}
      <header className="w-full bg-white border-b border-gray-200/80 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.76l.12.34V17z" />
                <circle cx="7.5" cy="14.5" r="1.5" />
                <circle cx="16.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#1E293B]">RentalCar</span>
          </div>

          {/* Tombol Login Utama di Navbar */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="bg-white p-0.5 rounded-sm">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <span>{loading ? 'Memproses...' : 'Masuk dengan Google'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 pt-12 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column: Typography & Feature Badges */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
              Layanan Rental Mobil Terpercaya
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-[#1E293B] leading-[1.15] mb-6">
              Selamat Datang
            </h1>
            
            <p className="text-gray-500 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              Masuk untuk mulai menyewa mobil impianmu dengan mudah, cepat, dan aman kapan saja serta di mana saja. Cukup klik tombol masuk di sudut kanan atas untuk mulai.
            </p>

            {/* Feature Badges */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-200/60 w-full">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-[#F97316]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Aman</h4>
                  <p className="text-[11px] text-gray-400">Terverifikasi</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-[#F97316]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">Cepat</h4>
                  <p className="text-[11px] text-gray-400">Booking instan</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-[#F97316]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">24/7</h4>
                  <p className="text-[11px] text-gray-400">Dukungan penuh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Interactive Graphic Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-white border border-gray-200 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-60"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-60"></div>
              
              {/* Logo / Icon Mobil Besar */}
              <div className="my-6 relative z-10 w-24 h-24 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] shadow-inner">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.76l.12.34V17z" />
                  <circle cx="7.5" cy="14.5" r="1.5" />
                  <circle cx="16.5" cy="14.5" r="1.5" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-[#1E293B] mb-2 relative z-10">Mulai Perjalananmu</h3>
              <p className="text-sm text-gray-500 relative z-10 mb-4">
                Akses dashboard penyewaan mobil dengan akun Google kamu secara instan dan aman.
              </p>

              <div className="w-full py-4 px-4 bg-gray-50 rounded-2xl border border-gray-100 relative z-10 flex items-center justify-center gap-3 text-xs text-gray-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Sistem Otentikasi Aman & Terenkripsi
              </div>

              <p className="mt-4 text-[11px] text-gray-400 relative z-10 leading-relaxed">
                Dengan masuk, kamu menyetujui Syarat & Ketentuan serta Kebijakan Privasi RentalCar.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 text-center py-6 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} RentalCar. Dibangun dengan Laravel, React, & Tailwind CSS.
      </footer>
    </div>
  );
};

export default Login;