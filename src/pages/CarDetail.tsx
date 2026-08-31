import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/axios";
import { 
  FiArrowLeft, FiTruck, FiUser, FiSettings, 
  FiFileText, FiCheckCircle, FiXCircle, FiPlayCircle 
} from "react-icons/fi";

interface Car {
  id: number;
  name: string;
  brand: string;
  plate_number: string;
  engine_type: string;
  fuel_spec?: string;
  seats: number;
  year: number;
  price_per_day: number;
  driver_price_per_day?: number;
  description?: string;
  image?: string;
  video_url?: string;
  status: string;
  user?: {
    name: string;
    email: string;
    personal_data?: {
      phone?: string;
      address?: string;
    };
  };
}

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/cars/${id}`);
        if (response.data.status === "success") {
          setCar(response.data.data);
        }
      } catch (err: any) {
        console.error("Gagal memuat detail mobil:", err);
        setErrorMessage("Gagal memuat detail mobil atau data tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetail();
    }
  }, [id]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Memuat detail kendaraan...</div>;
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

  // Helper aman tanpa package eksternal untuk handle YouTube iframe & Video File / Google Drive
  const renderVideoPlayer = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];
      return (
        <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black shadow-inner">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    let videoSource = url;
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      videoSource = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-inner">
        <video 
          src={videoSource} 
          controls 
          className="w-full max-h-[400px] object-contain mx-auto"
        >
          Browser Anda tidak mendukung pemutar video ini.
        </video>
      </div>
    );
  };

  if (errorMessage || !car) {
    return (
      <AppLayout user={user} logout={logout}>
        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto mt-10">
          <p className="text-red-500 font-semibold mb-4">{errorMessage || 'Mobil tidak ditemukan.'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  const owner = car.user;
  const personalData = owner?.personal_data;
  const isAvailable = car.status === 'tersedia';

  return (
    <AppLayout user={user} logout={logout}>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Tombol Kembali & Header Gambar */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 transition-all mb-4"
          >
            <FiArrowLeft size={16} /> Kembali
          </button>

          {/* Banner Gambar Mobil */}
          <div className="h-72 sm:h-96 w-full rounded-2xl overflow-hidden relative shadow-md bg-gray-100">
            {car.image ? (
              <img 
                src={getCarImageUrl(car.image)} 
                alt={car.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FiTruck size={64} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                {car.brand}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">{car.name}</h1>
            </div>
          </div>
        </div>

        {/* Grid Informasi Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Kolom Kiri: Harga, Spesifikasi, Video & Deskripsi */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kartu Harga */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500">Harga Sewa / Hari</p>
                <p className="text-xl font-bold text-blue-600 mt-0.5">{formatPrice(car.price_per_day)}</p>
              </div>
              <div className="border-l pl-4 border-gray-100">
                <p className="text-xs text-gray-500">Jasa Driver / Hari</p>
                <p className="text-xl font-bold text-orange-500 mt-0.5">{formatPrice(car.driver_price_per_day || 0)}</p>
              </div>
              <div className="w-full sm:w-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isAvailable ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                  {car.status}
                </span>
              </div>
            </div>

            {/* Spesifikasi Kendaraan */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiSettings className="text-blue-600" /> Spesifikasi Kendaraan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[11px] text-gray-400">Plat Nomor</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{car.plate_number}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[11px] text-gray-400">Tipe Mesin</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{car.engine_type}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[11px] text-gray-400">Spesifikasi BBM</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{car.fuel_spec || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[11px] text-gray-400">Kapasitas Kursi</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{car.seats} Kursi</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[11px] text-gray-400">Tahun Pembuatan</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{car.year}</p>
                </div>
              </div>
            </div>

            {/* Video Review Kendaraan */}
            {car.video_url && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FiPlayCircle className="text-blue-600" /> Video Review Kendaraan
                </h3>
                {renderVideoPlayer(car.video_url)}
              </div>
            )}

            {/* Deskripsi */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiFileText className="text-blue-600" /> Deskripsi
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {car.description || 'Tidak ada deskripsi tambahan untuk kendaraan ini.'}
              </p>
            </div>

          </div>

          {/* Kolom Kanan: Informasi Pemilik / Perental */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" /> Pemilik / Perental
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400">Nama Pengelola</p>
                  <p className="text-sm font-semibold text-gray-800">{owner?.name || 'Administrator'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-gray-800 break-all">{owner?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nomor HP</p>
                  <p className="text-sm font-semibold text-gray-800">{personalData?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Alamat</p>
                  <p className="text-sm font-semibold text-gray-800">{personalData?.address || '-'}</p>
                </div>
              </div>

              {/* Tombol Aksi Sewa */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  disabled={!isAvailable}
                  onClick={() => alert('Fitur form pemesanan akan segera terhubung.')}
                  className={`w-full py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                    isAvailable 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiTruck size={18} />
                  {isAvailable ? 'Sewa Mobil Ini' : 'Mobil Sedang Tidak Tersedia'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default CarDetail;