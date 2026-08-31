import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { 
  FiPlus, 
  FiSave, 
  FiArrowLeft, 
  FiCamera, 
  FiTruck, 
  FiTag, 
  FiHash, 
  FiSettings, 
  FiDroplet, 
  FiUsers, 
  FiCalendar, 
  FiDollarSign, 
  FiUserCheck, 
  FiVideo, 
  FiFileText,
  FiCheckCircle,
  FiTool,
  FiAlertCircle
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import api from "../lib/axios";

export const CarAddPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Cek apakah mode edit berdasarkan parameter id atau state dari router
  const carDataFromState = location.state?.carData;
  const isEditMode = Boolean(id || carDataFromState);

  // State Form Input
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [engineType, setEngineType] = useState("Bensin (Gasoline)");
  const [fuelSpec, setFuelSpec] = useState("");
  const [seats, setSeats] = useState("");
  const [year, setYear] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [driverPricePerDay, setDriverPricePerDay] = useState("");
  const [status, setStatus] = useState("tersedia");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");

  // State File & Gambar
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Opsi Dropdown & Status
  const engineTypes = [
    "Bensin (Gasoline)",
    "Diesel (Gasoil)",
    "Listrik (Electric / EV)",
    "Hybrid (HEV / PHEV)",
  ];

  const statuses = [
    { key: "tersedia", label: "Tersedia", color: "text-green-600 bg-green-50 border-green-200" },
    { key: "disewa", label: "Disewa", color: "text-orange-600 bg-orange-50 border-orange-200" },
    { key: "perbaikan", label: "Perbaikan", color: "text-red-600 bg-red-50 border-red-200" },
  ];

  // Inisialisasi data jika mode Edit
  useEffect(() => {
    if (carDataFromState) {
      populateForm(carDataFromState);
    } else if (isEditMode && id) {
      // Jika user refresh halaman edit langsung di URL, fetch data mobil dari API
      const fetchCarDetail = async () => {
        try {
          const res = await api.get(`/api/cars/${id}`);
          if (res.data.status === "success" || res.data.data) {
            populateForm(res.data.data);
          }
        } catch (err) {
          console.error("Gagal mengambil detail mobil:", err);
          setErrorMessage("Gagal memuat data mobil untuk diedit.");
        }
      };
      fetchCarDetail();
    }
  }, [id, carDataFromState]);

  const populateForm = (car: any) => {
    setName(car.name || "");
    setBrand(car.brand || "");
    setPlateNumber(car.plate_number || "");
    setEngineType(car.engine_type || "Bensin (Gasoline)");
    setFuelSpec(car.fuel_spec || "");
    setSeats(car.seats?.toString() || "");
    setYear(car.year?.toString() || "");
    setPricePerDay(car.price_per_day?.toString() || "");
    setDriverPricePerDay(car.driver_price_per_day?.toString() || "");
    setStatus(car.status || "tersedia");
    setVideoUrl(car.video_url || "");
    setDescription(car.description || "");
    setExistingImageUrl(car.image || null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://localhost:8000${cleanPath}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("brand", brand.trim());
      formData.append("plate_number", plateNumber.trim());
      formData.append("engine_type", engineType.trim());
      formData.append("fuel_spec", fuelSpec.trim());
      formData.append("seats", seats.trim());
      formData.append("year", year.trim());
      formData.append("price_per_day", pricePerDay.trim());
      formData.append("driver_price_per_day", driverPricePerDay.trim() || "0");
      formData.append("status", status);
      formData.append("video_url", videoUrl.trim());
      formData.append("description", description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;
      const targetId = id || (carDataFromState ? carDataFromState.id : null);

      if (isEditMode && targetId) {
        // Method spoofing untuk Laravel FormData PUT request
        formData.append("_method", "PUT");
        response = await api.post(`/api/cars/${targetId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/api/cars", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.status === "success" || response.status === 200 || response.status === 201) {
        alert(isEditMode ? "Mobil berhasil diperbarui!" : "Mobil berhasil ditambahkan!");
        navigate("/cars");
      }
    } catch (err: any) {
      console.error("Gagal menyimpan mobil:", err);
      const statusHttp = err.response?.status;
      const serverMsg = err.response?.data?.message;

      if (statusHttp === 403) {
        const confirmProfile = window.confirm(
          serverMsg || "Lengkapi Data Personal (No. HP & KTP) terlebih dahulu sebelum mengelola mobil."
        );
        if (confirmProfile) {
          navigate("/profile");
        }
      } else {
        setErrorMessage(serverMsg || `Terjadi kesalahan saat menyimpan data: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
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
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        
        {/* Header Navigasi Kembali */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/cars")}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-all"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {isEditMode ? "Edit Data Mobil" : "Tambah Mobil Baru"}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEditMode ? "Perbarui informasi detail armada kendaraan Anda." : "Daftarkan armada kendaraan baru ke sistem rental."}
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <FiAlertCircle size={20} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Upload Foto */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <label className="text-sm font-bold text-gray-700 mb-3">Foto Kendaraan</label>
            <div className="relative group cursor-pointer">
              <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center shadow-inner group-hover:border-blue-500 transition-all">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : existingImageUrl ? (
                  <img src={getImageUrl(existingImageUrl)} alt="Existing" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <FiCamera size={32} className="mb-1 text-blue-500" />
                    <span className="text-[11px] font-semibold text-gray-500">Unggah Foto</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Format: JPG, PNG, atau WEBP (Maks. 2MB)</p>
          </div>

          {/* Section 2: Informasi Utama */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-blue-600 font-bold text-sm">
              <FiTruck size={18} />
              <span>Informasi Identitas Kendaraan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Mobil</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FiTruck size={16} /></span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Avanza Veloz, Zenix Hybrid"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Merek / Brand</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FiTag size={16} /></span>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Contoh: Toyota, Honda"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Plat Nomor</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FiHash size={16} /></span>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Contoh: BP 1234 XY"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Spesifikasi Teknis */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-orange-600 font-bold text-sm">
              <FiSettings size={18} />
              <span>Spesifikasi Mesin & Kapasitas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipe Mesin Penggerak</label>
                <select
                  value={engineType}
                  onChange={(e) => setEngineType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                >
                  {engineTypes.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Spesifikasi BBM (Opsional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FiDroplet size={16} /></span>
                  <input
                    type="text"
                    value={fuelSpec}
                    onChange={(e) => setFuelSpec(e.target.value)}
                    placeholder="Contoh: Pertamax, Biosolar"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Total Kursi</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FiUsers size={16} /></span>
                  <input
                    type="number"
                    required
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    placeholder="Contoh: 7"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Kendaraan</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FiCalendar size={16} /></span>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="Contoh: 2024"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Harga & Ketersediaan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-green-600 font-bold text-sm">
              <FiDollarSign size={18} />
              <span>Tarif & Status Ketersediaan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Sewa per Hari (Rp)</label>
                <input
                  type="number"
                  required
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  placeholder="Contoh: 350000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tarif Driver per Hari (Rp)</label>
                <input
                  type="number"
                  value={driverPricePerDay}
                  onChange={(e) => setDriverPricePerDay(e.target.value)}
                  placeholder="Isi 0 jika lepas kunci"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Status Mobil</label>
              <div className="grid grid-cols-3 gap-3">
                {statuses.map((st) => (
                  <button
                    type="button"
                    key={st.key}
                    onClick={() => setStatus(st.key)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      status === st.key ? `${st.color} ring-2 ring-blue-500/20 shadow-sm` : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {st.key === "tersedia" && <FiCheckCircle size={14} />}
                    {st.key === "disewa" && <FiTruck size={14} />}
                    {st.key === "perbaikan" && <FiTool size={14} />}
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Media & Deskripsi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-purple-600 font-bold text-sm">
              <FiFileText size={18} />
              <span>Media Review & Deskripsi Tambahan</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Link Video Review YouTube (Opsional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400"><FiVideo size={16} /></span>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi Kendaraan (Opsional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan catatan khusus, fasilitas tambahan, atau ketentuan sewa..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
              />
            </div>
          </div>

          {/* Tombol Simpan / Aksi */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/cars")}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              {isEditMode ? "Perbarui Mobil" : "Simpan Mobil"}
            </button>
          </div>

        </form>
      </div>
    </AppLayout>
  );
};

export default CarAddPage;