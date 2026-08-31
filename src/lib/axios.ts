import axios from 'axios';

// Gunakan URL yang sama untuk konsistensi
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // PENTING: Kirim cookie
  withXSRFToken: true,   // Untuk Laravel Sanctum
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Fungsi untuk mengambil CSRF cookie
export const getCsrfCookie = async () => {
  try {
    console.log('Fetching CSRF cookie...');
    // Lakukan pemanggilan aktual ke endpoint sanctum Laravel
    await api.get('/sanctum/csrf-cookie');
    console.log('CSRF cookie fetched successfully');
    return true;
  } catch (error) {
    console.error('Failed to get CSRF cookie:', error);
    return false;
  }
};

// Interceptor untuk menangani error
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        console.log('Unauthorized, redirecting to login...');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor untuk debugging & menyisipkan Bearer Token otomatis
api.interceptors.request.use(
  config => {
    // Ambil token yang dikirim via query URL Google OAuth dan simpan otomatis jika ada
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('auth_token', urlToken);
    }

    // Sisipkan Bearer token dari localStorage jika tersedia
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`Making request to: ${config.url}`, {
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;