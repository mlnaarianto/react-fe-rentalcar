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

// Request interceptor untuk debugging
api.interceptors.request.use(
  config => {
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