import { create } from 'zustand';
import { authApi } from '@/lib/api';

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, admin: Admin) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  admin: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { token, admin } = response.data.data || response.data;
    localStorage.setItem('dam_token', token);
    localStorage.setItem('dam_admin', JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('dam_token');
    localStorage.removeItem('dam_admin');
    set({ token: null, admin: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  setAuth: (token: string, admin: Admin) => {
    set({ token, admin, isAuthenticated: true });
  },

  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    const token = localStorage.getItem('dam_token');
    const adminStr = localStorage.getItem('dam_admin');
    if (token && adminStr) {
      try {
        const admin = JSON.parse(adminStr);
        set({ token, admin, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
