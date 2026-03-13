import { config } from '../../config';
import { logger } from '../../utils/logger';

interface YangoTrip {
  id: string;
  driverId: string;
  startTime: string;
  endTime: string;
  distance: number;
  fare: number;
  currency: string;
  status: string;
}

interface YangoDriverIncome {
  driverId: string;
  totalTrips: number;
  totalFare: number;
  totalDistance: number;
  totalHours: number;
  currency: string;
  period: { start: string; end: string };
  trips: YangoTrip[];
}

interface YangoParkStats {
  totalDrivers: number;
  activeDrivers: number;
  totalTripsToday: number;
  totalRevenueToday: number;
  currency: string;
}

export class YangoService {
  private apiUrl: string;
  private clientId: string;
  private apiKey: string;
  private parkId: string;

  constructor() {
    this.apiUrl = config.YANGO_API_URL;
    this.clientId = config.YANGO_CLIENT_ID;
    this.apiKey = config.YANGO_API_KEY;
    this.parkId = config.YANGO_PARK_ID;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Client-ID': this.clientId,
      'X-Api-Key': this.apiKey,
      'X-Park-ID': this.parkId,
    };
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
          throw new Error(`Yango API error: ${response.status} ${response.statusText}`);
        }
        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Yango API attempt ${attempt} failed:`, { error: lastError.message });
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Yango API request failed');
  }

  async syncDriverIncome(
    driverId: string,
    dateRange: { start: string; end: string },
  ): Promise<YangoDriverIncome> {
    try {
      const data = await this.request<YangoDriverIncome>(
        `/v1/parks/driver-profiles/transactions/list`,
        {
          method: 'POST',
          body: JSON.stringify({
            query: {
              park: { id: this.parkId, driver_profile: { id: driverId } },
              event_at: { from: dateRange.start, to: dateRange.end },
            },
          }),
        },
      );

      logger.info('Yango income synced', {
        driverId,
        totalTrips: data.totalTrips,
        totalFare: data.totalFare,
      });

      return data;
    } catch (error) {
      logger.error('Yango income sync error:', { error: (error as Error).message, driverId });
      throw error;
    }
  }

  async getDriverTrips(driverId: string): Promise<YangoTrip[]> {
    try {
      const data = await this.request<{ trips: YangoTrip[] }>(
        `/v1/parks/orders/list`,
        {
          method: 'POST',
          body: JSON.stringify({
            query: {
              park: { id: this.parkId, driver_profile: { id: driverId } },
            },
            limit: 100,
          }),
        },
      );

      return data.trips || [];
    } catch (error) {
      logger.error('Yango trips fetch error:', { error: (error as Error).message, driverId });
      throw error;
    }
  }

  async getParkStats(): Promise<YangoParkStats> {
    try {
      return await this.request<YangoParkStats>(
        `/v1/parks/driver-profiles/list`,
        {
          method: 'POST',
          body: JSON.stringify({
            query: { park: { id: this.parkId } },
          }),
        },
      );
    } catch (error) {
      logger.error('Yango park stats error:', { error: (error as Error).message });
      throw error;
    }
  }
}

export const yangoService = new YangoService();
