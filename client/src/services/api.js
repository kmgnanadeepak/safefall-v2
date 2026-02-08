import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const isDev = import.meta.env.DEV;
api.interceptors.request.use(
  (config) => {
    if (isDev) console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => {
    if (isDev) console.log('[API] Response:', res.config.url, res.status, res.data?.length ?? typeof res.data);
    return res;
  },
  (err) => {
    if (isDev) console.error('[API] Error:', err.config?.url, err.response?.status, err.message);
    if (err.response?.status === 401) {
      localStorage.removeItem('safefall-token');
      localStorage.removeItem('safefall-user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
