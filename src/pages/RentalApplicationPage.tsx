import React, { useState, useEffect } from "react";
import { 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiInfo, 
  FiShoppingBag, 
  FiMapPin, 
  FiSend, 
  FiMessageSquare, 
  FiRefreshCw 
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import api from "../lib/axios";

export const RentalApplicationPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  
  const [status, setStatus] = useState<string>("pending");
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchApplicationStatus = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("/api/rental-application");
      const appData = response.data.data;

      if (appData) {
        setBusinessName(appData.business_name || "");
        setBusinessAddress(appData.business_address || "");
        setStatus(appData.status || "pending");
        setAdminNotes(appData.admin_notes || null);
      }
    } catch (err: any) {
      console.error("Error fetch application:", err);
      if (err.response?.status !== 404) {
        setErrorMessage(err.response?.data?.message || "Gagal memuat status pengajuan.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchApplicationStatus();
    }
  }, [authLoading, user]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessAddress.trim()) {
      alert("Alamat usaha wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/rental-application", {
        business_name: businessName,
        business_address: businessAddress,
      });

      if (response.status === 200 || response.status === 201) {
        alert("Pengajuan perental berhasil dikirim!");
        fetchApplicationStatus();
      }
    } catch (err: any) {
      console.error("Gagal mengirim pengajuan:", err);
      const resData = err.response?.data;
      let msg = resData?.message || "Gagal mengirim pengajuan.";
      if (resData?.errors?.personal_data) {
        msg = resData.errors.personal_data[0];
      }
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-orange-600 bg-orange-50 border-orange-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <FiCheckCircle className="w-6 h-6 text-green-600" />;
      case "rejected":
        return <FiXCircle className="w-6 h-6 text-red-600" />;
      default:
        return <FiClock className="w-6 h-6 text-orange-600" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return "Menunggu Peninjauan";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "approved":
        return "Selamat! Pengajuan Anda telah disetujui sebagai perental. Anda kini memiliki akses untuk mengelola kendaraan dan pesanan.";
      case "rejected":
        return "Pengajuan Anda ditolak oleh admin. Silakan periksa catatan di bawah dan ajukan kembali dengan data yang valid.";
      default:
        return "Pengajuan Anda sedang ditinjau oleh Admin. Mohon tunggu konfirmasi selanjutnya.";
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppLayout user={user} logout={logout}>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Pengajuan Perental</h1>
          <p className="text-sm text-gray-500 mt-1">Daftarkan diri Anda sebagai pemilik rental resmi untuk mulai menyewakan kendaraan.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-full border ${getStatusColor()}`}>
                    {getStatusIcon()}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Status Pengajuan</span>
                    <h3 className="text-lg font-bold text-gray-800">{getStatusLabel()}</h3>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border self-start sm:self-auto ${getStatusColor()}`}>
                  {status}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {getStatusDescription()}
              </p>

              {adminNotes && (
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 space-y-1">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                    <FiMessageSquare size={14} />
                    <span>Catatan dari Admin</span>
                  </div>
                  <p className="text-xs text-blue-800">{adminNotes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
              <div className="text-blue-600 mt-0.5 flex-shrink-0">
                <FiInfo size={18} />
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                Pastikan Anda sudah melengkapi <strong>Foto KTP</strong> dan <strong>Foto SIM</strong> di menu Profil sebelum mengirim pengajuan ini agar disetujui oleh Admin.
              </p>
            </div>

            <form onSubmit={handleSubmitApplication} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-800 text-base pb-2 border-b border-gray-100">Data Usaha Rental</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">Nama Usaha Rental (Opsional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiShoppingBag size={16} />
                  </span>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Maju Jaya Rent Car"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">Alamat Usaha / Domisili <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 pt-3 pointer-events-none text-gray-400">
                    <FiMapPin size={16} />
                  </span>
                  <textarea
                    rows={3}
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap lokasi usaha rental Anda..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 placeholder-gray-400 resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend size={15} />
                  )}
                  {isSubmitting ? "Mengirim..." : "Kirim / Perbarui Pengajuan"}
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default RentalApplicationPage;