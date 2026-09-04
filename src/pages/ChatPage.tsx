import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSend, FiLock } from "react-icons/fi";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../layouts/AppLayout";

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();

  // Ambil parameter dari query URL (contoh: /chat?room=room_rental_2_user_3&name=Perental: John&avatar=...)
  const chatId = searchParams.get("room") || "";
  const receiverName = searchParams.get("name") || "Perental";
  const receiverAvatarUrl = searchParams.get("avatar") || "";

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ID & Nama User yang sedang login (aktif)
  const currentUserId = user?.id ? String(user.id) : "3";
  const currentUserName = user?.name || "Penyewa";

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Listener Real-time Firestore untuk mengambil pesan
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("created_at", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
        setIsLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      },
      (error) => {
        console.error("Gagal mengambil pesan real-time:", error);
        setIsLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  // Fungsi Kirim Pesan
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId) return;

    const messageText = inputText.trim();
    setInputText("");

    try {
      // 1. Simpan pesan ke sub-koleksi messages
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: messageText,
        sender_id: currentUserId,
        sender_name: currentUserName,
        created_at: serverTimestamp(),
      });

      // 2. Update dokumen utama room chat (last_message)
      await setDoc(
        doc(db, "chats", chatId),
        {
          last_message: messageText,
          updated_at: serverTimestamp(),
          last_sender_id: currentUserId,
          last_sender_name: currentUserName,
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
      alert("Pesan gagal terkirim. Periksa koneksi Anda.");
    }
  };

  // Inisial nama untuk avatar fallback jika tidak ada foto profil
  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  };

  // Format Waktu Pesan (HH:mm)
  const formatTime = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // Format Header Tanggal Pemisah Pesan
  const formatDateSeparator = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "";
    const date = timestamp.toDate();
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Hari ini";
    if (isYesterday) return "Kemarin";

    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Memuat sesi...</div>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <AppLayout user={user} logout={logout}>
      {/* Page header — dibungkus card putih (senada dengan card mobil di
          Dashboard) supaya jelas ini konten halaman, bukan lanjutan navbar */}
      <div className="mb-6 bg-white rounded-xl border border-gray-100 shadow-sm px-4 sm:px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <FiArrowLeft size={18} />
          </button>

          <div className="relative w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center overflow-hidden font-semibold text-xs shrink-0">
            {receiverAvatarUrl ? (
              <img src={receiverAvatarUrl} alt={receiverName} className="w-full h-full object-cover" />
            ) : (
              getInitials(receiverName)
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800 leading-tight truncate">{receiverName}</h3>
            <p className="text-xs text-emerald-600 leading-tight">Online</p>
          </div>
        </div>

        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold shrink-0">
          <FiLock size={11} /> Terenkripsi
        </span>
      </div>

      {/* Ruang Pesan — langsung menyatu dengan halaman, tanpa border/box besar */}
      <div className="min-h-[45vh] pb-28">
        {isLoadingMessages ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100 text-sm">
            <FiLock size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-gray-700 font-medium text-sm">Pesan aman dan terenkripsi</p>
            <p className="text-gray-400 text-xs mt-1">
              Mulai percakapan terkait penyewaan kendaraan dengan {receiverName}.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const isMe = String(msg.sender_id) === currentUserId;

              let showDateSeparator = false;
              if (msg.created_at) {
                if (index === 0) {
                  showDateSeparator = true;
                } else {
                  const prevMsg = messages[index - 1];
                  if (prevMsg.created_at?.toDate && msg.created_at?.toDate) {
                    const prevDate = prevMsg.created_at.toDate();
                    const currDate = msg.created_at.toDate();
                    showDateSeparator = prevDate.toDateString() !== currDate.toDateString();
                  }
                }
              }

              return (
                <React.Fragment key={msg.id || index}>
                  {showDateSeparator && msg.created_at && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-[11px] font-medium text-gray-500">
                        {formatDateSeparator(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[55%] rounded-2xl px-4 py-2.5 space-y-1 ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white text-gray-900 rounded-bl-md border border-gray-100 shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                      <div
                        className={`text-[10px] ${
                          isMe ? "text-blue-100 text-right" : "text-gray-400 text-left"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Kotak balas pesan — menempel di bawah area konten (bukan floating card
          terpisah), tetap terlihat saat scroll berkat sticky positioning */}
      <form
        onSubmit={handleSendMessage}
        className="sticky bottom-4 sm:bottom-6 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-md flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          aria-label="Kirim pesan"
          className="w-10 h-10 shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          <FiSend size={16} />
        </button>
      </form>
    </AppLayout>
  );
};

export default ChatPage;