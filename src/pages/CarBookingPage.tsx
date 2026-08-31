import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiTruck, 
  FiCalendar, 
  FiUserCheck, 
  FiCreditCard, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle 
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import api from "../lib/axios";

export const CarBookingPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Ambil data mobil yang dikirim melalui router state (atau fetch jika di-refresh)
  const carFromState = location.state?.carData;
  const [car, setCar] = useState<any>(carFromState || null);
  const [isLoadingCar, setIsLoadingCar] = useState<boolean>(!carFromState);

  // State Form Pemesanan
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [withDriver, setWithDriver] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Jika halaman di-refresh langsung dari URL /cars/:id/book, ambil data mobil dari API
  React.useEffect(() => {
    if (!car && id) {
      const fetchCar = async () => {
        try {
          const res = await api.get(`/api/cars/${id}`);
          if (res.data.status === "success" || res.data.data) {
            setCar(res.data.data);
          }
        } catch (err) {
          console.error("Gagal mengambil data mobil:", err);
          setErrorMessage("Gagal memuat informasi kendaraan.");
        } finally {
          setIsLoadingCar(false);
        }
      };
      fetchCar();
    }
  }, [car, id]);

  // Tarif kalkulasi
  const carRatePerDay = Number(car?.price_per_day) || 0;
  const driverRatePerDay = Number(car?.driver_price_per_day) || 0;

  // Hitung total hari
  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays + 1 : 0;
  };

  const totalDays = calculateTotalDays();
  const totalPrice = totalDays > 0 ? totalDays * (carRatePerDay + (withDriver ? driverRatePerDay : 0)) : 0;

  const formatPrice = (raw: any) => {
    if (raw == null) return "Rp 0";
    const numValue = Number(raw) || 0;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(numValue);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Silakan pilih tanggal mulai dan selesai sewa!");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.post("/api/bookings", {
        car_id: car.id,
        start_date: startDate,
        end_date: endDate,
        with_driver: withDriver,
        payment_method: paymentMethod,
        notes: notes.trim(),
      });

      if (response.status === 201 || response.data.status === "success") {
        alert("Booking berhasil dibuat! Silakan cek riwayat pesanan.");
        navigate("/history");
      }
    } catch (err: any) {
      console.error("Gagal membuat booking:", err);
      const statusHttp = err.response?.status;
      const serverMsg = err.response?.data?.message || "Gagal membuat pemesanan.";

      if (statusHttp === 403 && serverMsg.toLowerCase().includes("data personal")) {
        const confirmProfile = window.confirm(serverMsg + "\n\nlengkapi data personal sekarang?");
        if (confirmProfile) {
          navigate("/profile");
        }
      } else {
        setErrorMessage(serverMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingCar) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (!car) {
    return (
      <AppLayout user={user} logout={logout}>
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
          <p className="text-red-500 font-semibold mb-4">Informasi kendaraan tidak ditemukan.</p>
          <button onClick={() => navigate("/cars")} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium">
            Kembali ke Daftar Mobil
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} logout={logout}>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        
        {/* Header Kembali */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-all"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Form Pemesanan Mobil</h1>
            <p className="text-xs text-gray-500 mt-0.5">Lengkapi jadwal dan opsi tambahan sewa kendaraan Anda.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <FiAlertCircle size={20} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          
          {/* Ringkasan Mobil */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiTruck size={28} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{car.brand}</span>
              <h3 className="font-bold text-gray-800 text-base">{car.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tarif: <strong className="text-blue-600">{formatPrice(carRatePerDay)}</strong> / hari
                {driverRatePerDay > 0 && ` • Sopir: ${formatPrice(driverRatePerDay)} / hari`}
              </p>
            </div>
          </div>

          {/* Jadwal Sewa */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
              <FiCalendar className="text-blue-600" /> Jadwal Sewa Kendaraan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  min={startDate || new Date().toISOString().split("T")[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                />
              </div>
            </div>

            {totalDays > 0 && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold text-center">
                Total Durasi Sewa: {totalDays} Hari
              </div>
            )}
          </div>

          {/* Opsi Tambahan & Pembayaran */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
              <FiUserCheck className="text-orange-500" /> Opsi & Pembayaran
            </h3>

            {/* Toggle Driver */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-bold text-gray-800">Gunakan Jasa Sopir</p>
                <p className="text-[11px] text-gray-500">Tambahan {formatPrice(driverRatePerDay)} / hari</p>
              </div>
              <input
                type="checkbox"
                checked={withDriver}
                onChange={(e) => setWithDriver(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Metode Pembayaran */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
              >
                <option value="cod">Bayar di Tempat (COD / Tunai)</option>
                <option value="qris">QRIS (Online / Midtrans)</option>
              </select>
            </div>
          </div>

          {/* Catatan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-2">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
              <FiFileText className="text-teal-600" /> Catatan Tambahan (Opsional)
            </h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tolong siapkan mobil bersih jam 8 pagi..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
            />
          </div>

          {/* Ringkasan Biaya & Tombol Submit */}
          {totalDays > 0 && (
            <div className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Sewa Mobil ({totalDays} hari):</span>
                <span>{formatPrice(totalDays * carRatePerDay)}</span>
              </div>
              {withDriver && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Jasa Sopir ({totalDays} hari):</span>
                  <span>{formatPrice(totalDays * driverRatePerDay)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center font-bold text-gray-800">
                <span>Total Biaya:</span>
                <span className="text-lg text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || totalDays <= 0}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <FiCheckCircle size={16} /> Konfirmasi & Buat Pesanan
            </button>
          </div>

        </form>
      </div>
    </AppLayout>
  );
};

export default CarBookingPage;