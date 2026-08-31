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
  serverTimestamp 
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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      setIsLoadingMessages(false);
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error("Gagal mengambil pesan real-time:", error);
      setIsLoadingMessages(false);
    });

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
      await setDoc(doc(db, "chats", chatId), {
        last_message: messageText,
        updated_at: serverTimestamp(),
        last_sender_id: currentUserId,
        last_sender_name: currentUserName,
      }, { merge: true });

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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Format Header Tanggal Pemisah Pesan
  const formatDateSeparator = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "";
    const date = timestamp.toDate();
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() &&
                        date.getMonth() === yesterday.getMonth() &&
                        date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Hari ini";
    if (isYesterday) return "Kemarin";

    return date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
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
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Chat */}
        <div className="bg-blue-600 px-6 py-4 flex items-center gap-3 text-white shadow-sm">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
          >
            <FiArrowLeft size={20} />
          </button>

          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden font-bold text-sm">
            {receiverAvatarUrl ? (
              <img src={receiverAvatarUrl} alt={receiverName} className="w-full h-full object-cover" />
            ) : (
              getInitials(receiverName)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base truncate">{receiverName}</h2>
            <p className="text-[11px] text-blue-100 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span> Online (Terhubung aman)
            </p>
          </div>
        </div>

        {/* Ruang Pesan (Body Chat) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F4F6F9]">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3 shadow-sm">
                <FiLock size={24} />
              </div>
              <p className="text-gray-700 font-semibold text-sm">Pesan aman dan terenkripsi</p>
              <p className="text-gray-400 text-xs mt-1 max-w-xs">
                Silakan mulai percakapan terkait penyewaan kendaraan dengan {receiverName}.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = String(msg.sender_id) === currentUserId;
              
              let showDateSeparator = false;
              if (msg.created_at) {
                if (index === 0) {
                  showDateSeparator = true;
                } else {
                  const prevMsg = messages[index - 1];
                  if (prevMsg.created_at && prevMsg.created_at.toDate && msg.created_at.toDate) {
                    const prevDate = prevMsg.created_at.toDate();
                    const currDate = msg.created_at.toDate();
                    showDateSeparator = prevDate.toDateString() !== currDate.toDateString();
                  }
                }
              }

              return (
                <React.Fragment key={msg.id || index}>
                  {showDateSeparator && msg.created_at && (
                    <div className="flex justify-center my-3">
                      <span className="px-3 py-1 bg-white shadow-sm border border-gray-100 rounded-full text-[11px] font-semibold text-gray-500">
                        {formatDateSeparator(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div 
                      className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm relative space-y-1 ${
                        isMe 
                          ? "bg-[#DCEBFF] text-gray-900 rounded-br-none" 
                          : "bg-white text-gray-900 rounded-bl-none border border-gray-100"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                      <div className={`flex items-center gap-1 text-[10px] text-gray-400 ${isMe ? "justify-end" : "justify-start"}`}>
                        <span>{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form Input Pesan (Footer Chat) */}
        <form onSubmit={handleSendMessage} className="bg-white p-3 sm:p-4 border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <FiSend size={18} />
          </button>
        </form>

      </div>
    </AppLayout>
  );
};

export default ChatPage;