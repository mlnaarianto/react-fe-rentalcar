import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiPlus, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiSearch, 
  FiTruck, 
  FiCalendar, 
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiTrash2
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import api from "../lib/axios";

export const CarPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [cars, setCars] = useState<any[]>([]);
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const navigate = useNavigate();

  // ================= WARNA TEMA =================
  const primaryColor = '#2563EB'; // Biru
  const accentColor = '#F97316';  // Oren

  const fetchCars = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("/api/cars");
      if (response.data.status === "success" || response.data.data) {
        const carList = response.data.data || [];
        setCars(carList);
        setFilteredCars(carList);
      } else {
        setErrorMessage("Gagal memuat data mobil dari server.");
      }
    } catch (err: any) {
      console.error("Gagal mengambil data mobil:", err);
      setErrorMessage(err.response?.data?.message || `Terjadi kesalahan koneksi ke server: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchCars();
    }
  }, [authLoading, user]);

  // ================= LOGIKA FILTERING (Pencarian & Status) =================
  useEffect(() => {
    let result = cars;
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(car => {
        const name = (car.name || '').toLowerCase();
        const brand = (car.brand || '').toLowerCase();
        const plate = (car.plate_number || '').toLowerCase();
        
        // Ambil nama pemilik agar bisa dicari lewat search bar juga
        let ownerStr = '';
        if (car.user && car.user.name) {
          ownerStr = car.user.name.toLowerCase();
        } else if (car.owner_name) {
          ownerStr = car.owner_name.toLowerCase();
        }

        return name.includes(query) ||
               brand.includes(query) ||
               plate.includes(query) ||
               ownerStr.includes(query);
      });
    }

    if (statusFilter !== 'all') {
      result = result.filter(car => car.status === statusFilter);
    }

    setFilteredCars(result);
  }, [searchQuery, statusFilter, cars]);

  const handleSearchFilter = (query: string) => {
    setSearchQuery(query);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const userRoles = user.roles?.map(r => r.toLowerCase()) || [];
  const canManageCars = !userRoles.includes('penyewa') && !userRoles.includes('driver');
  const isSuperAdmin = userRoles.includes('super admin');

  // 👇 Navigasi khusus ke halaman edit berdasarkan ID mobil
  const handleOpenEdit = (car: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah card ikut ter-klik
    navigate(`/cars/${car.id}/edit`, { state: { carData: car } });
  };

  const handleDeleteCar = async (carId: number, carName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah card ikut ter-klik
    const confirm = window.confirm(`Yakin ingin menghapus "${carName}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirm) return;

    try {
      await api.delete(`/api/cars/${carId}`);
      setCars(prev => prev.filter(c => c.id !== carId));
      alert('Mobil berhasil dihapus');
    } catch (e: any) {
      console.error("Gagal menghapus mobil:", e);
      alert(e.response?.data?.message || `Terjadi kesalahan koneksi: ${e.message}`);
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:8000${cleanPath}`;
  };

  const formatPrice = (raw: any) => {
    if (raw == null) return 'Rp 0';
    const numValue = Number(raw) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(numValue);
  };

  return (
    <AppLayout user={user} logout={logout} onSearchChange={handleSearchFilter}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daftar Mobil Rental</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola armada kendaraan, status, dan harga sewa secara terpusat.</p>
          </div>
          {canManageCars && (
            <Link
              to="/car-add"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all"
            >
              <FiPlus className="w-5 h-5" />
              Tambah Mobil
            </Link>
          )}
        </div>

        {/* Filter & Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-600">
            {searchQuery ? (
              <span className="italic text-blue-600 font-semibold">Hasil pencarian: "{searchQuery}"</span>
            ) : (
              <span className="text-gray-400">Total armada: {filteredCars.length} Unit</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setStatusFilter('tersedia')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${statusFilter === 'tersedia' ? 'bg-green-600 text-white shadow-sm' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}`}
            >
              Tersedia
            </button>
            <button
              onClick={() => setStatusFilter('disewa')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${statusFilter === 'disewa' ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'}`}
            >
              Disewa
            </button>
            <button
              onClick={() => setStatusFilter('perbaikan')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${statusFilter === 'perbaikan' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}
            >
              Perbaikan
            </button>
          </div>
        </div>

        {/* Konten Utama: Loading / Error / Empty / Grid Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
            <div className="p-4 bg-red-50 text-red-600 rounded-full mb-3">
              <FiAlertCircle className="w-8 h-8" />
            </div>
            <p className="text-gray-700 font-medium mb-4">{errorMessage}</p>
            <button
              onClick={fetchCars}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              <FiRefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
            <FiSearch size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-600 font-semibold text-lg">Belum ada data mobil yang ditemukan.</p>
            <p className="text-gray-400 text-sm mt-1">Coba sesuaikan kata kunci pencarian atau filter status Anda.</p>
          </div>
        ) : (
          /* Grid Card Estetis */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              const hasImage = car.image && car.image.toString().trim() !== '';
              
              // Cek kepemilikan mobil
              const isOwnerCar = user.id && car.user_id === user.id;
              const canEditThisCar = canManageCars && (isOwnerCar || isSuperAdmin);

              // Ambil nama pemilik
              let ownerName = 'Pemilik Tidak Diketahui';
              if (car.user && car.user.name) {
                ownerName = car.user.name;
              } else if (car.owner_name) {
                ownerName = car.owner_name;
              }

              // Tentukan warna (Oren jika milik sendiri, Biru jika milik orang lain)
              const ownerColorStyle = isOwnerCar ? accentColor : primaryColor;

              return (
                <div
                  key={car.id}
                  onClick={() => navigate(`/cars/${car.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Foto Mobil & Badge Status */}
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {hasImage ? (
                        <img
                          src={getImageUrl(car.image)}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiTruck size={40} />
                        </div>
                      )}
                      
                      <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm backdrop-blur-md ${
                        car.status === 'tersedia' ? 'bg-green-100/90 text-green-700' : 
                        car.status === 'disewa' ? 'bg-orange-100/90 text-orange-700' : 'bg-red-100/90 text-red-700'
                      }`}>
                        {car.status === 'tersedia' ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                        {car.status}
                      </span>
                    </div>

                    {/* Informasi Singkat Mobil */}
                    <div className="p-5">
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                        {car.brand || '-'}
                      </span>
                      <h3 className="font-bold text-gray-800 text-base mt-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {car.name || 'Tanpa Nama'}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Plat: <span className="font-medium text-gray-600">{car.plate_number || '-'}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <FiUsers className="text-gray-400" />
                          <span>{car.seats || '-'} Kursi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="text-gray-400" />
                          <span>Tahun {car.year || '-'}</span>
                        </div>
                      </div>

                      {/* Label Nama Pemilik dengan Warna Dinamis */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="text-xs" style={{ color: ownerColorStyle }}>👤</span>
                        <span className="text-xs font-semibold truncate" style={{ color: ownerColorStyle }}>
                          {isOwnerCar ? `Milik Anda (${ownerName})` : `Milik ${ownerName}`}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Harga & Tombol Aksi di Bawah */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-50 mt-2 bg-gray-50/50 py-3">
                    <div>
                      <span className="text-xs text-gray-400 block">Tarif Sewa</span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatPrice(car.price_per_day)} <span className="text-[11px] text-gray-400 font-normal">/ hari</span>
                      </span>
                    </div>

                    {/* Tombol Manajemen (Hanya tampil jika user adalah pemilik mobil / Super Admin) */}
                    {canEditThisCar ? (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenEdit(car, e)}
                          className="p-2 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl border border-gray-200 transition-all shadow-sm"
                          title="Edit Mobil"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteCar(car.id, car.name || 'mobil ini', e)}
                          className="p-2 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl border border-gray-200 transition-all shadow-sm"
                          title="Hapus Mobil"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm group-hover:bg-blue-700 transition-all">
                        Detail
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default CarPage;