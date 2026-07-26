import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('fintax_auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing token from localStorage', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fintax_auth');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API Endpoints
export const requestSignupOtpApi = (data) => api.post('/auth/signup/request', data);
export const verifySignupOtpApi = (data) => api.post('/auth/signup/verify', data);
export const resendSignupOtpApi = (data) => api.post('/auth/signup/resend', data);

// Profile API Endpoints
export const requestEmailChangeApi = (data) => api.post('/users/profile/change-email/request', data);
export const verifyEmailChangeApi = (data) => api.post('/users/profile/change-email/verify', data);

export const requestPasswordChangeApi = (data) => api.post('/users/profile/change-password/request', data);
export const verifyPasswordChangeApi = (data) => api.post('/users/profile/change-password/verify', data);

export const requestPhoneChangeApi = (data) => api.post('/users/profile/change-phone/request', data);
export const verifyPhoneChangeApi = (data) => api.post('/users/profile/change-phone/verify', data);

export const updateProfileApi = (data) => api.put('/users/profile', data);

export default api;
