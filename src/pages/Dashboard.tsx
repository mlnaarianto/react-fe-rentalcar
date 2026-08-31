import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import api from "../lib/axios";
import { FiTruck, FiSearch } from "react-icons/fi";

interface Car {
  id: number;
  user_id: number; // 👈 Pastikan user_id ditangkap dari API mobil
  name: string;
  brand: string;
  status: string;
  seats: number;
  year: number;
  price_per_day: number;
  image?: string;
  user?: {
    name: string;
  };
  owner_name?: string;
}

const Dashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ================= WARNA TEMA =================
  const primaryColor = '#2563EB'; // Biru
  const accentColor = '#F97316';  // Oren

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await api.get("/api/cars");
        if (response.data.status === "success") {
          setAllCars(response.data.data);
          setFilteredCars(response.data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data mobil:", err);
      } finally {
        setLoadingCars(false);
      }
    };

    fetchCars();
  }, []);

  const handleSearchFilter = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredCars(allCars);
    } else {
      const filtered = allCars.filter((car) => {
        const name = (car.name || '').toLowerCase();
        const brand = (car.brand || '').toLowerCase();
        
        // 👇 Ambil nama pemilik untuk dicari juga lewat search bar
        let ownerStr = '';
        if (car.user && car.user.name) {
          ownerStr = car.user.name.toLowerCase();
        } else if (car.owner_name) {
          ownerStr = car.owner_name.toLowerCase();
        }

        const q = query.toLowerCase();
        return name.includes(q) || brand.includes(q) || ownerStr.includes(q);
      });
      setFilteredCars(filtered);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const getCarImageUrl = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:8000${cleanPath}`;
  };

  return (
    <AppLayout user={user} logout={logout} onSearchChange={handleSearchFilter}>
      {/* Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Halo, {user.name}! 👋
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Temukan mobil impian untuk perjalanan nyaman Anda hari ini.
          </p>
        </div>
        <div className="p-3 bg-white/15 rounded-full hidden sm:block">
          <FiTruck size={28} className="text-white" />
        </div>
      </div>

      {/* Daftar Mobil Section Header */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-gray-800">Daftar Mobil Tersedia</h3>
          {searchQuery && (
            <p className="text-xs text-gray-500 italic mt-0.5">
              Hasil pencarian untuk: "{searchQuery}"
            </p>
          )}
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
          {filteredCars.length} Unit
        </span>
      </div>

      {/* Grid List Mobil */}
      {loadingCars ? (
        <div className="text-center py-16 text-gray-400 text-sm">Memuat data mobil...</div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100 text-sm">
          <FiSearch size={32} className="mx-auto mb-2 opacity-40" />
          {searchQuery ? 'Tidak ada mobil yang cocok dengan pencarian Anda.' : 'Belum ada mobil yang tersedia.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCars.map((car) => {
            // 👇 Logika Pengecekan Kepemilikan Mobil
            const isOwnerCar = user.id && car.user_id === user.id;

            // 👇 Ambil string nama pemilik
            let ownerName = 'Pemilik Tidak Diketahui';
            if (car.user && car.user.name) {
              ownerName = car.user.name;
            } else if (car.owner_name) {
              ownerName = car.owner_name;
            }

            // 👇 Tentukan warna (Oren jika milik sendiri, Biru jika milik orang lain)
            const ownerColorStyle = isOwnerCar ? accentColor : primaryColor;

            return (
              <Link 
                to={`/cars/${car.id}`} 
                key={car.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    {car.image ? (
                      <img 
                        src={getCarImageUrl(car.image)} 
                        alt={car.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FiTruck size={36} />
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      car.status === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {car.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{car.brand}</p>
                    <h4 className="font-bold text-gray-800 text-sm mt-0.5 truncate group-hover:text-blue-600 transition-colors">{car.name}</h4>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <span>💺 {car.seats} Kursi</span>
                      <span>📅 {car.year}</span>
                    </div>

                    {/* 👇 Menampilkan Nama Pemilik dengan Warna Dinamis */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-xs" style={{ color: ownerColorStyle }}>👤</span>
                      <span className="text-xs font-semibold truncate" style={{ color: ownerColorStyle }}>
                        {isOwnerCar ? `Milik Anda (${ownerName})` : `Milik ${ownerName}`}
                      </span>
                    </div>

                  </div>
                </div>
                <div className="p-4 pt-0 flex items-center justify-between">
                  <span className="text-blue-600 font-bold text-sm">
                    {formatPrice(car.price_per_day)} <span className="text-[11px] text-gray-400 font-normal">/ hari</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;