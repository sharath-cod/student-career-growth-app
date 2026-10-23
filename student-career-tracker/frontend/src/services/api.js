import axios from 'axios';

export const TOKEN_KEY = 'sct_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // free hosts can take ~1 minute to wake from sleep
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // An expired/invalid session on a normal request: clear it and go to login.
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      const target = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
      if (window.location.pathname !== target) window.location.assign(target);
    }
    return Promise.reject(error);
  }
);

// Normalises an Axios error into { message, fieldErrors }.
export function parseError(error) {
  const data = error.response?.data;
  if (data) return { message: data.message || 'Something went wrong.', fieldErrors: data.errors || {} };
  if (error.code === 'ECONNABORTED') return { message: 'The server took too long to respond. Try again.', fieldErrors: {} };
  return { message: 'Cannot reach the server. Check that the backend is running.', fieldErrors: {} };
}

export default api;
