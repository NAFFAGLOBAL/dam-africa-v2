/**
 * API Client for DAM Africa Admin Portal
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class APIClient {
  private getAuthHeader() {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Handle 401 Unauthorized
      if (error.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('admin');
        window.location.href = '/login';
      }

      return { success: false, error };
    }
  }

  // Auth
  async adminLogin(email: string, password: string) {
    return this.request('/api/v1/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/v1/admin/dashboard');
  }

  // Users/Drivers
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    kycStatus?: string;
    status?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/users${query ? `?${query}` : ''}`);
  }

  async getUser(userId: string) {
    return this.request(`/api/v1/users/${userId}`);
  }

  async updateUser(userId: string, data: any) {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async suspendUser(userId: string, reason: string) {
    return this.request(`/api/v1/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(userId: string) {
    return this.request(`/api/v1/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  // KYC
  async getKYCDocuments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/kyc${query ? `?${query}` : ''}`);
  }

  async getKYCDocument(documentId: string) {
    return this.request(`/api/v1/admin/kyc/${documentId}`);
  }

  async approveKYC(documentId: string, notes?: string) {
    return this.request(`/api/v1/admin/kyc/${documentId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectKYC(documentId: string, reason: string) {
    return this.request(`/api/v1/admin/kyc/${documentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Loans
  async getLoans(params?: {
    status?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/loans${query ? `?${query}` : ''}`);
  }

  async getLoan(loanId: string) {
    return this.request(`/api/v1/admin/loans/${loanId}`);
  }

  async approveLoan(loanId: string, notes?: string) {
    return this.request(`/api/v1/admin/loans/${loanId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectLoan(loanId: string, reason: string) {
    return this.request(`/api/v1/admin/loans/${loanId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async disburseLoan(loanId: string, data: {
    disbursementMethod: string;
    phoneNumber?: string;
  }) {
    return this.request(`/api/v1/admin/loans/${loanId}/disburse`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getPayments(params?: {
    status?: string;
    page?: number;
    limit?: number;
    loanId?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/payments${query ? `?${query}` : ''}`);
  }

  async getPayment(paymentId: string) {
    return this.request(`/api/v1/admin/payments/${paymentId}`);
  }

  async processPayment(paymentId: string, status: 'SUCCESS' | 'FAILED', failureReason?: string) {
    return this.request(`/api/v1/admin/payments/${paymentId}/process`, {
      method: 'POST',
      body: JSON.stringify({ status, failureReason }),
    });
  }

  // Credit Scoring
  async getCreditScores(params?: {
    page?: number;
    limit?: number;
    rating?: string;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/credit${query ? `?${query}` : ''}`);
  }

  async getCreditScore(userId: string) {
    return this.request(`/api/v1/admin/credit/${userId}`);
  }

  async recalculateCreditScore(userId: string) {
    return this.request(`/api/v1/admin/credit/${userId}/recalculate`, {
      method: 'POST',
    });
  }

  async getCreditScoreHistory(userId: string) {
    return this.request(`/api/v1/admin/credit/${userId}/history`);
  }

  // Vehicles
  async getVehicles(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/vehicles${query ? `?${query}` : ''}`);
  }

  async getVehicle(vehicleId: string) {
    return this.request(`/api/v1/vehicles/${vehicleId}`);
  }

  async createVehicle(data: any) {
    return this.request(`/api/v1/vehicles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVehicle(vehicleId: string, data: any) {
    return this.request(`/api/v1/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVehicle(vehicleId: string) {
    return this.request(`/api/v1/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  }

  async assignVehicle(vehicleId: string, data: { userId: string; weeklyRate: number }) {
    return this.request(`/api/v1/vehicles/${vehicleId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async returnVehicle(rentalId: string, data: { condition?: string; notes?: string }) {
    return this.request(`/api/v1/vehicles/rentals/${rentalId}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVehicleStats() {
    return this.request(`/api/v1/vehicles/stats`);
  }

  // Reports
  async getFinancialSummary(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/reports/financial${query ? `?${query}` : ''}`);
  }

  async getLoanAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/reports/loans${query ? `?${query}` : ''}`);
  }

  async getPaymentAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/admin/reports/payments${query ? `?${query}` : ''}`);
  }

  async getDriverAnalytics() {
    return this.request(`/api/v1/admin/reports/drivers`);
  }

  // Settings
  async getSettings() {
    return this.request(`/api/v1/admin/settings`);
  }

  async getSetting(key: string) {
    return this.request(`/api/v1/admin/settings/${key}`);
  }

  async updateSetting(key: string, data: { value: any }) {
    return this.request(`/api/v1/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/notifications${query ? `?${query}` : ''}`);
  }

  async getUnreadCount() {
    return this.request(`/api/v1/notifications/unread/count`);
  }

  async markAsRead(notificationId: string) {
    return this.request(`/api/v1/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllAsRead() {
    return this.request(`/api/v1/notifications/read-all`, {
      method: 'POST',
    });
  }
}

export const api = new APIClient();
