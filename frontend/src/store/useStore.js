import { create } from 'zustand';
import api, {
  requestSignupOtpApi,
  verifySignupOtpApi,
  resendSignupOtpApi,
  requestEmailChangeApi,
  verifyEmailChangeApi,
  requestPasswordChangeApi,
  verifyPasswordChangeApi,
  requestPhoneChangeApi,
  verifyPhoneChangeApi,
  updateProfileApi
} from '../services/api';

const getInitialAuth = () => {
  const authData = localStorage.getItem('fintax_auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return {
        user: parsed.user,
        profile: parsed.profile,
        token: parsed.token,
        isAuthenticated: true,
      };
    } catch (e) {
      localStorage.removeItem('fintax_auth');
    }
  }
  return {
    user: null,
    profile: null,
    token: null,
    isAuthenticated: false,
  };
};

const getInitialTheme = () => {
  const isDark = localStorage.getItem('fintax_dark') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
    return true;
  }
  document.documentElement.classList.remove('dark');
  return false;
};

export const useStore = create((set, get) => ({
  ...getInitialAuth(),
  darkMode: getInitialTheme(),
  transactions: [],
  summary: null,
  taxSummary: null,
  potHistory: [],
  analytics: null,
  loading: false,
  error: null,

  // Theme Toggler
  toggleDarkMode: () => {
    const nextDark = !get().darkMode;
    localStorage.setItem('fintax_dark', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode: nextDark });
  },

  // Authentication API calls
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const authData = {
        user: res.data.user,
        profile: res.data.profile,
        token: res.data.token,
        isAuthenticated: true,
      };
      localStorage.setItem('fintax_auth', JSON.stringify(authData));
      set({ ...authData, loading: false });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Verify credentials.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  // Signup Verification API Flow
  requestSignupOtp: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await requestSignupOtpApi(formData);
      set({ loading: false });
      return { success: true, message: res.data.message, demoOtp: res.data.demoOtp };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request signup verification code.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  verifySignupOtp: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await verifySignupOtpApi({ email, otp, type: 'SIGNUP' });
      const authData = {
        user: res.data.user,
        profile: res.data.profile,
        token: res.data.token,
        isAuthenticated: true,
      };
      localStorage.setItem('fintax_auth', JSON.stringify(authData));
      set({ ...authData, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid or expired verification code.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  resendSignupOtp: async (email) => {
    set({ loading: true, error: null });
    try {
      const res = await resendSignupOtpApi({ email, type: 'SIGNUP' });
      set({ loading: false });
      return { success: true, message: res.data.message, demoOtp: res.data.demoOtp };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to resend verification code.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', formData);
      const authData = {
        user: res.data.user,
        profile: res.data.profile,
        token: res.data.token,
        isAuthenticated: true,
      };
      localStorage.setItem('fintax_auth', JSON.stringify(authData));
      set({ ...authData, loading: false });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Signup failed. Email might already exist.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('fintax_auth');
    set({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,
      transactions: [],
      summary: null,
      taxSummary: null,
      potHistory: [],
      analytics: null,
    });
  },

  // User Profile
  fetchUser: async () => {
    try {
      const res = await api.get('/users/me');
      set({
        user: res.data.user,
        profile: res.data.profile,
      });
    } catch (err) {
      console.error('Fetch profile details failed', err);
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      await updateProfileApi(profileData);
      const meRes = await api.get('/users/me');
      set({
        user: meRes.data.user,
        profile: meRes.data.profile,
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.response?.data?.error || 'Failed to update profile settings.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Profile Change Verification Actions
  requestEmailChange: async (newEmail) => {
    set({ loading: true, error: null });
    try {
      const res = await requestEmailChangeApi({ newEmail });
      set({ loading: false });
      return { success: true, message: res.data.message, demoOtp: res.data.demoOtp };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request email change verification.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  verifyEmailChange: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await verifyEmailChangeApi({ email, otp, type: 'EMAIL_CHANGE' });
      const authData = {
        user: res.data.user,
        profile: res.data.profile,
        token: res.data.token,
        isAuthenticated: true,
      };
      localStorage.setItem('fintax_auth', JSON.stringify(authData));
      set({ ...authData, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid or expired email verification code.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  requestPasswordChange: async (currentPassword, newPassword, confirmPassword) => {
    set({ loading: true, error: null });
    try {
      const res = await requestPasswordChangeApi({ currentPassword, newPassword, confirmPassword });
      set({ loading: false });
      return { success: true, message: res.data.message, demoOtp: res.data.demoOtp };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request password change verification.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  verifyPasswordChange: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await verifyPasswordChangeApi({ email, otp, type: 'PASSWORD_CHANGE' });
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid or expired password verification code.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  requestPhoneChange: async (newPhone) => {
    set({ loading: true, error: null });
    try {
      const res = await requestPhoneChangeApi({ newPhone });
      set({ loading: false });
      return { success: true, message: res.data.message, demoOtp: res.data.demoOtp };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request phone change verification.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  verifyPhoneChange: async (email, otp) => {
    set({ loading: true, error: null });
    try {
      const res = await verifyPhoneChangeApi({ email, otp, type: 'PHONE_CHANGE' });
      const meRes = await api.get('/users/me');
      set({
        user: meRes.data.user,
        profile: meRes.data.profile,
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid or expired phone verification code.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Transactions CRUD
  fetchTransactions: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.source) params.append('source', filters.source);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/transactions?${params.toString()}`);
      set({ transactions: res.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch transactions list.', loading: false });
    }
  },

  createTransaction: async (txData, filters = {}) => {
    set({ loading: true });
    try {
      await api.post('/transactions', txData);
      await get().fetchTransactions(filters);
      await get().fetchSummary();
      set({ loading: false });
      return true;
    } catch (err) {
      console.error('Create transaction failed:', err);
      set({ error: 'Failed to add transaction record.', loading: false });
      return false;
    }
  },

  updateTransaction: async (id, txData, filters = {}) => {
    set({ loading: true });
    try {
      await api.put(`/transactions/${id}`, txData);
      await get().fetchTransactions(filters);
      await get().fetchSummary();
      set({ loading: false });
      return true;
    } catch (err) {
      console.error('Update transaction failed:', err);
      set({ error: 'Failed to edit transaction record.', loading: false });
      return false;
    }
  },

  deleteTransaction: async (id, filters = {}) => {
    set({ loading: true });
    try {
      await api.delete(`/transactions/${id}`);
      await get().fetchTransactions(filters);
      await get().fetchSummary();
      set({ loading: false });
      return true;
    } catch (err) {
      console.error('Delete transaction failed:', err);
      set({ error: 'Failed to delete transaction record.', loading: false });
      return false;
    }
  },

  // Dashboard Overview
  fetchSummary: async () => {
    try {
      const res = await api.get('/summary');
      set({ summary: res.data });
    } catch (err) {
      console.error('Failed to load dashboard summaries', err);
    }
  },

  // Tax Vault
  fetchTaxSummary: async () => {
    try {
      const res = await api.get('/tax/summary');
      set({ taxSummary: res.data });
    } catch (err) {
      console.error('Failed to load tax vault summaries', err);
    }
  },

  // Income Smoother simulated actions
  simulatePotTx: async (type, amount, description) => {
    set({ loading: true });
    try {
      await api.post('/tax/pot/simulate', { type, amount, description });
      set({ loading: false });
      get().fetchTaxSummary();
      get().fetchPotHistory();
      get().fetchSummary();
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update reserve pot.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  fetchPotHistory: async () => {
    try {
      const res = await api.get('/tax/pot/history');
      set({ potHistory: res.data });
    } catch (err) {
      console.error('Failed to load reserve pot history', err);
    }
  },

  // Analytics
  fetchAnalytics: async (period = 'year') => {
    try {
      const res = await api.get(`/analytics/overview?period=${period}`);
      set({ analytics: res.data });
    } catch (err) {
      console.error('Failed to load analytics summaries', err);
    }
  },
}));
