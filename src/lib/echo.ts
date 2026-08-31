import Echo from "laravel-echo";
import Pusher from "pusher-js";
import api from "./axios";

// laravel-echo butuh Pusher terdaftar secara global
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 80,
  wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "http") === "https",
  enabledTransports: ["ws", "wss"],

  // Pakai axios instance yang SAMA dengan yang sudah dipakai di seluruh
  // app (lib/axios.ts) — otomatis ikut kirim Bearer token dari
  // localStorage DAN cookie session Sanctum, konsisten dengan request
  // API lain.
  //
  // Catatan: parameter di-type "any" dengan sengaja. Definisi tipe
  // resmi pusher-js/laravel-echo untuk "authorizer" berbeda-beda antar
  // versi (ada yang expect error: Error | null, ada yang expect
  // error: boolean) — dan sering tidak sinkron satu sama lain. Karena
  // fungsi ini murni internal (tidak dipanggil manual di kode lain),
  // melonggarkan tipe di sini jauh lebih aman daripada memaksakan tipe
  // yang bisa berubah tiap update package.
  authorizer: (channel: any) => {
    return {
      authorize: (socketId: any, callback: any) => {
        api
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => callback(false, response.data))
          .catch((error) => callback(true, error));
      },
    };
  },
} as any);

export default echo;