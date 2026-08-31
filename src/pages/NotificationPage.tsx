import React, { useState, useEffect } from "react";
import { 
  FiBell, 
  FiAlertCircle, 
  FiRefreshCw, 
  FiBookmark, 
  FiDollarSign, 
  FiMapPin, 
  FiXCircle, 
  FiClock, 
  FiBellOff 
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";
import api from "../lib/axios";
import echo from "../lib/echo"; // 🟢 TAMBAHAN: koneksi real-time Reverb

export const NotificationPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ambil data notifikasi dari API backend
  const fetchNotifications = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get("/api/notifications");
      if (response.data.status === "success" || response.data.data) {
        setNotifications(response.data.data || []);
      } else {
        setErrorMessage("Gagal memuat notifikasi.");
      }
    } catch (err: any) {
      console.error("Gagal mengambil notifikasi:", err);
      setErrorMessage(err.response?.data?.message || `Terjadi kesalahan koneksi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Tandai sudah dibaca otomatis saat halaman dibuka
  const markNotificationsAsRead = async () => {
    try {
      await api.post("/api/notifications/read-all");
    } catch (_) {
      // Abaikan error jika gagal agar tidak mengganggu UI
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchNotifications();
      markNotificationsAsRead();
    }
  }, [authLoading, user]);

  // 🟢 TAMBAHAN: Listener real-time — notifikasi baru langsung nempel
  // di atas list begitu event masuk dari Reverb, tanpa perlu refetch.
  useEffect(() => {
    if (!user) return;

    const channelName = `notifications.${user.id}`;

    echo
      .private(channelName)
      .listen(".notification.created", (event: { data: any }) => {
        setNotifications((prev) => {
          // 🟢 FIX: cegah duplikat. Di development, React StrictMode
          // sengaja mount -> cleanup -> mount ulang komponen, jadi ada
          // celah singkat di mana dua listener sempat aktif bersamaan
          // dan event yang sama ke-tangkep dua kali. Guard ini
          // memastikan notifikasi dengan id yang sama tidak pernah
          // di-prepend lebih dari sekali, baik di dev maupun production.
          const alreadyExists = prev.some((n) => n.id === event.data.id);
          if (alreadyExists) return prev;
          return [event.data, ...prev];
        });
      });

    // Cleanup: berhenti dengarkan channel saat komponen unmount
    // atau user berganti, supaya listener tidak numpuk duplikat.
    return () => {
      echo.leave(channelName);
    };
  }, [user]);

  // Helper Ikon berdasarkan tipe notifikasi
  const getNotifIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <FiBookmark className="w-5 h-5 text-blue-600" />;
      case "payment":
        return <FiDollarSign className="w-5 h-5 text-green-600" />;
      case "driver_assignment":
        return <FiMapPin className="w-5 h-5 text-orange-500" />;
      case "booking_cancelled":
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiBell className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getNotifColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-50 text-blue-600";
      case "payment":
        return "bg-green-50 text-green-600";
      case "driver_assignment":
        return "bg-orange-50 text-orange-500";
      case "booking_cancelled":
        return "bg-red-50 text-red-600";
      default:
        return "bg-indigo-50 text-indigo-600";
    }
  };

  const formatDate = (rawDate: string) => {
    if (!rawDate) return "";
    try {
      const date = new Date(rawDate);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (_) {
      return rawDate.split("T")[0];
    }
  };

  const formatTime = (rawDate: string) => {
    if (!rawDate) return "";
    try {
      const date = new Date(rawDate);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(".", ":");
    } catch (_) {
      return "";
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
        
        {/* Header Halaman */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi Aktivitas</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau informasi terbaru seputar pesanan, pembayaran, dan penugasan Anda.</p>
        </div>

        {/* Konten Utama */}
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
              onClick={fetchNotifications}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              <FiRefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3">
              <FiBellOff className="w-8 h-8" />
            </div>
            <p className="text-gray-600 font-semibold text-lg">Belum ada notifikasi kejadian.</p>
            <p className="text-gray-400 text-sm mt-1">Aktivitas terbaru seputar pesanan Anda akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const type = notif.type || "default";
              const isUnread = notif.is_read === false;
              const createdAt = notif.created_at || "";

              return (
                <div 
                  key={notif.id || Math.random()} 
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isUnread 
                      ? "bg-blue-50/40 border-blue-100 shadow-sm" 
                      : "bg-white border-gray-100 shadow-sm"
                  }`}
                >
                  <div className={`p-3 rounded-full flex-shrink-0 ${getNotifColor(type)}`}>
                    {getNotifIcon(type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-sm font-bold truncate ${isUnread ? "text-gray-900" : "text-gray-800"}`}>
                        {notif.title || "Informasi"}
                      </h3>
                      {isUnread && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      {notif.message || ""}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <FiClock size={12} />
                      <span>{formatDate(createdAt)} {formatTime(createdAt) ? `• ${formatTime(createdAt)}` : ""}</span>
                    </div>
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

export default NotificationPage;