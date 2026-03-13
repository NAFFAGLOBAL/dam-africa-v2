import { config } from '../../config';
import { logger } from '../../utils/logger';

interface UffizioLiveData {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  ignition: boolean;
  fuelLevel?: number;
  mileage?: number;
  timestamp: string;
  address?: string;
}

interface UffizioDriver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedVehicle?: string;
}

interface UffizioTelemetry {
  deviceId: string;
  data: UffizioLiveData[];
}

interface UffizionDrivingBehavior {
  deviceId: string;
  harshBraking: number;
  harshAcceleration: number;
  speeding: number;
  idling: number;
  totalDistance: number;
  totalDuration: number;
  safetyScore: number;
}

export class UffizioService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private lastCallTime: number = 0;
  private rateLimitMs: number;

  constructor() {
    this.baseUrl = config.UFFIZIO_API_URL;
    this.username = config.UFFIZIO_USERNAME;
    this.password = config.UFFIZIO_PASSWORD;
    this.rateLimitMs = config.UFFIZIO_RATE_LIMIT_MS;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - elapsed;
      logger.debug(`Uffizio rate limit: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastCallTime = Date.now();
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    await this.enforceRateLimit();

    if (!this.token || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      await this.authenticate();
    }

    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      ...(options.headers as Record<string, string>),
    };

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
          if (response.status === 401) {
            await this.authenticate();
            headers.Authorization = `Bearer ${this.token}`;
            continue;
          }
          throw new Error(`Uffizio API error: ${response.status} ${response.statusText}`);
        }
        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Uffizio API attempt ${attempt} failed:`, { error: lastError.message });
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Uffizio API request failed');
  }

  async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = (await response.json()) as { token: string; expiresIn: number };
      this.token = data.token;
      this.tokenExpiry = new Date(Date.now() + (data.expiresIn || 3600) * 1000);
      logger.info('Uffizio authentication successful');
    } catch (error) {
      logger.error('Uffizio authentication failed:', { error: (error as Error).message });
      throw error;
    }
  }

  async getLiveData(): Promise<UffizioLiveData[]> {
    return this.request<UffizioLiveData[]>('/vehicles/live');
  }

  async syncTelemetry(deviceId: string, fromDate?: string, toDate?: string): Promise<UffizioTelemetry> {
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<UffizioTelemetry>(`/vehicles/${deviceId}/telemetry${query}`);
  }

  async getDrivingBehavior(deviceId: string, fromDate?: string, toDate?: string): Promise<UffizionDrivingBehavior> {
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<UffizionDrivingBehavior>(`/vehicles/${deviceId}/behavior${query}`);
  }

  async getDriverList(): Promise<UffizioDriver[]> {
    return this.request<UffizioDriver[]>('/drivers');
  }
}

export const uffizioService = new UffizioService();
