import React, { useState, useEffect, useRef } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiShoppingBag,
  FiMapPin,
  FiSend,
  FiMessageSquare,
  FiCompass,
  FiCrosshair
} from "react-icons/fi";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import api from "../lib/axios";

// Fix icon marker Leaflet bawaan agar tampil sempurna di React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<LocationPickerProps> = ({ position, onPositionChange }) => {
  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const coord = marker.getLatLng();
          onPositionChange(coord.lat, coord.lng);
        },
      }}
    />
  );
};

export const RentalApplicationPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");

  // Koordinat default (diarahkan ke sekitar Batam / titik awal)
  const [latitude, setLatitude] = useState<number>(1.1301);
  const [longitude, setLongitude] = useState<number>(104.053);
  const [hasSelectedLocation, setHasSelectedLocation] = useState<boolean>(false);

  const [status, setStatus] = useState<string>("pending");
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Ref ke instance peta Leaflet, dipakai untuk flyTo() saat "Lokasi Saya" dipakai
  // (setara dengan MapController di Flutter)
  const mapRef = useRef<L.Map | null>(null);

  const fetchApplicationStatus = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/rental-application");
      const appData = response.data.data;

      if (appData) {
        setBusinessName(appData.business_name || "");
        setBusinessAddress(appData.business_address || "");
        setFormattedAddress(appData.formatted_address || "");
        setStatus(appData.status || "pending");
        setAdminNotes(appData.admin_notes || null);

        if (appData.latitude && appData.longitude) {
          setLatitude(Number(appData.latitude));
          setLongitude(Number(appData.longitude));
          setHasSelectedLocation(true);
        }
      }
    } catch (err: any) {
      console.error("Error fetch application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchApplicationStatus();
    }
  }, [authLoading, user]);

  // Fungsi untuk memanggil reverse geocode Laravel saat peta diklik/digeser/lokasi GPS didapat
  const handleMapLocationChange = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setHasSelectedLocation(true);
    setIsGeocoding(true);

    try {
      const response = await api.get(`/api/rental-application/reverse-geocode`, {
        params: { latitude: lat, longitude: lng }
      });

      const data = response.data.data;
      if (data && data.formatted_address) {
        setFormattedAddress(data.formatted_address);
        setBusinessAddress(data.formatted_address); // Otomatis mengisi textarea alamat usaha
      }
    } catch (err: any) {
      console.error("Gagal melakukan reverse geocode:", err.response || err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Ambil lokasi GPS/perangkat saat ini menggunakan Geolocation API bawaan browser
  // (padanan dari Geolocator.getCurrentPosition() di Flutter)
  const handleGetCurrentLocation = () => {
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Browser Anda tidak mendukung fitur lokasi.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        // Geser peta ke posisi user, sama seperti _mapController.move() di Flutter
        mapRef.current?.flyTo([lat, lng], 16);

        setIsLocating(false);
        handleMapLocationChange(lat, lng);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Layanan lokasi tidak tersedia saat ini.");
            break;
          case error.TIMEOUT:
            setLocationError("Waktu permintaan lokasi habis. Coba lagi.");
            break;
          default:
            setLocationError("Gagal mendapatkan lokasi GPS.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasSelectedLocation) {
      alert("Silakan tandai lokasi usaha Anda terlebih dahulu di peta.");
      return;
    }

    if (!businessAddress.trim()) {
      alert("Alamat usaha wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/rental-application", {
        business_name: businessName,
        business_address: businessAddress,
        formatted_address: formattedAddress,
        latitude: latitude,
        longitude: longitude,
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
      if (resData?.errors?.latitude) {
        msg = resData.errors.latitude[0];
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

              {/* Peta Interaktif Leaflet */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Tandai Lokasi Usaha di Peta <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-3">
                    {isGeocoding && (
                      <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1">
                        <FiCompass className="animate-spin" size={12} /> Mengambil alamat...
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLocating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          Mencari lokasi...
                        </>
                      ) : (
                        <>
                          <FiCrosshair size={13} /> Lokasi Saya
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500">Klik di peta, geser marker, atau gunakan tombol "Lokasi Saya" untuk menentukan lokasi usaha Anda.</p>

                {locationError && (
                  <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {locationError}
                  </p>
                )}

                <div className="h-72 w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative">
                  <MapContainer
                    ref={mapRef}
                    center={[latitude, longitude]}
                    zoom={14}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      position={[latitude, longitude]}
                      onPositionChange={handleMapLocationChange}
                    />
                  </MapContainer>
                </div>

                {hasSelectedLocation && (
                  <p className="text-[11px] text-gray-500 italic">
                    Koordinat: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </p>
                )}
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
                    placeholder="Alamat akan terisi otomatis saat Anda menandai peta, atau dapat diisi manual..."
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