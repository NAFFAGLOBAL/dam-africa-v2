import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { API_BASE_URL } from './constants';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('dam_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dam_token');
      localStorage.removeItem('dam_admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/admin/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

// ─── Dashboard ───────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getRevenueChart: (period?: string) =>
    api.get('/admin/dashboard/revenue', { params: { period } }),
  getRecentActivity: () => api.get('/admin/dashboard/activity'),
};

// ─── Users / Drivers ─────────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, unknown>) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  suspend: (id: string, reason: string) =>
    api.patch(`/users/${id}/suspend`, { reason }),
  activate: (id: string) => api.patch(`/users/${id}/activate`),
  getLoans: (id: string) => api.get(`/users/${id}/loans`),
  getPayments: (id: string) => api.get(`/users/${id}/payments`),
  getActivity: (id: string) => api.get(`/users/${id}/activity`),
};

// ─── KYC ─────────────────────────────────────────────────────────────
export const kycApi = {
  list: (params?: Record<string, unknown>) => api.get('/kyc', { params }),
  get: (id: string) => api.get(`/kyc/${id}`),
  approve: (id: string) => api.patch(`/kyc/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.patch(`/kyc/${id}/reject`, { reason }),
};

// ─── Loans ───────────────────────────────────────────────────────────
export const loansApi = {
  list: (params?: Record<string, unknown>) => api.get('/loans', { params }),
  get: (id: string) => api.get(`/loans/${id}`),
  approve: (id: string) => api.patch(`/loans/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.patch(`/loans/${id}/reject`, { reason }),
  disburse: (id: string) => api.patch(`/loans/${id}/disburse`),
};

// ─── Payments ────────────────────────────────────────────────────────
export const paymentsApi = {
  list: (params?: Record<string, unknown>) => api.get('/payments', { params }),
  get: (id: string) => api.get(`/payments/${id}`),
  getSummary: () => api.get('/payments/summary'),
};

// ─── Vehicles ────────────────────────────────────────────────────────
export const vehiclesApi = {
  list: (params?: Record<string, unknown>) => api.get('/vehicles', { params }),
  get: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: Record<string, unknown>) => api.post('/vehicles', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// ─── Rentals ─────────────────────────────────────────────────────────
export const rentalsApi = {
  list: (params?: Record<string, unknown>) => api.get('/rentals', { params }),
  get: (id: string) => api.get(`/rentals/${id}`),
  approve: (id: string) => api.patch(`/rentals/${id}/approve`),
  complete: (id: string) => api.patch(`/rentals/${id}/complete`),
};

// ─── Contracts ───────────────────────────────────────────────────────
export const contractsApi = {
  list: (params?: Record<string, unknown>) => api.get('/contracts', { params }),
  get: (id: string) => api.get(`/contracts/${id}`),
  terminate: (id: string, reason: string) =>
    api.patch(`/contracts/${id}/terminate`, { reason }),
};

// ─── Tracking ────────────────────────────────────────────────────────
export const trackingApi = {
  getLivePositions: () => api.get('/tracking/live'),
  getVehicleHistory: (id: string, params?: Record<string, unknown>) =>
    api.get(`/tracking/vehicles/${id}/history`, { params }),
};

// ─── Incidents ───────────────────────────────────────────────────────
export const incidentsApi = {
  list: (params?: Record<string, unknown>) => api.get('/incidents', { params }),
  get: (id: string) => api.get(`/incidents/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/incidents/${id}/status`, { status }),
};

// ─── Support ─────────────────────────────────────────────────────────
export const supportApi = {
  listTickets: (params?: Record<string, unknown>) =>
    api.get('/support/tickets', { params }),
  getTicket: (id: string) => api.get(`/support/tickets/${id}`),
  addMessage: (id: string, message: string) =>
    api.post(`/support/tickets/${id}/messages`, { message }),
  closeTicket: (id: string) => api.patch(`/support/tickets/${id}/close`),
};

// ─── Reports ─────────────────────────────────────────────────────────
export const reportsApi = {
  getRevenue: (params?: Record<string, unknown>) =>
    api.get('/reports/revenue', { params }),
  getDrivers: (params?: Record<string, unknown>) =>
    api.get('/reports/drivers', { params }),
  getFleet: (params?: Record<string, unknown>) =>
    api.get('/reports/fleet', { params }),
  getPayments: (params?: Record<string, unknown>) =>
    api.get('/reports/payments', { params }),
};

// ─── Admin Users ─────────────────────────────────────────────────────
export const adminApi = {
  listUsers: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  createUser: (data: Record<string, unknown>) => api.post('/admin/users', data),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

// ─── Settings ────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: Record<string, unknown>) => api.patch('/settings', data),
  getScoringConfig: () => api.get('/settings/scoring'),
  updateScoringConfig: (data: Record<string, unknown>) =>
    api.patch('/settings/scoring', data),
};

export default api;
