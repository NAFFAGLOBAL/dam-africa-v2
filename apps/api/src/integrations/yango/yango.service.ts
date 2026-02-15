import axios, { AxiosInstance } from 'axios';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { BadRequestError } from '../../utils/errors';

interface YangoDriver {
  driver_profile_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  car_id: string;
  status: string;
}

interface YangoDriverPerformance {
  driver_profile_id: string;
  rating: number;
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  total_revenue: number;
  average_rating: number;
  acceptance_rate: number;
}

interface YangoFleetStats {
  total_drivers: number;
  active_drivers: number;
  total_trips_today: number;
  total_revenue_today: number;
}

export class YangoFleetService {
  private client: AxiosInstance | null = null;

  constructor() {
    if (config.integrations.yango.enabled && config.integrations.yango.apiUrl && config.integrations.yango.apiKey) {
      this.client = axios.create({
        baseURL: config.integrations.yango.apiUrl,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': config.integrations.yango.clientId || '',
          'X-Api-Key': config.integrations.yango.apiKey,
        },
        timeout: 30000,
      });
    }
  }

  private getMockDrivers(): YangoDriver[] {
    return [
      {
        driver_profile_id: 'mock_driver_1',
        first_name: 'Kofi',
        last_name: 'Mensah',
        phone: '+2250700000001',
        car_id: 'mock_car_1',
        status: 'active',
      },
      {
        driver_profile_id: 'mock_driver_2',
        first_name: 'Amina',
        last_name: 'Diallo',
        phone: '+2250700000002',
        car_id: 'mock_car_2',
        status: 'active',
      },
    ];
  }

  private getMockDriverPerformance(driverId: string): YangoDriverPerformance {
    return {
      driver_profile_id: driverId,
      rating: 4.7,
      total_trips: 450,
      completed_trips: 420,
      cancelled_trips: 30,
      total_revenue: 2500000,
      average_rating: 4.7,
      acceptance_rate: 0.93,
    };
  }

  private getMockFleetStats(): YangoFleetStats {
    return {
      total_drivers: 150,
      active_drivers: 98,
      total_trips_today: 320,
      total_revenue_today: 450000,
    };
  }

  async getDrivers(): Promise<YangoDriver[]> {
    if (config.integrations.mockMode || !this.client) {
      logger.info('Yango get drivers (MOCK MODE)');
      return this.getMockDrivers();
    }

    try {
      const response = await this.client.post<{ driver_profiles: YangoDriver[] }>(
        '/v1/parks/driver-profiles/list',
        {
          query: {
            park: {
              id: config.integrations.yango.partnerId,
            },
          },
        }
      );

      logger.info('Yango drivers retrieved:', { count: response.data.driver_profiles.length });
      return response.data.driver_profiles;
    } catch (error: any) {
      logger.error('Yango get drivers failed:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new BadRequestError(
        `Failed to get Yango drivers: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getDriverInfo(driverId: string): Promise<YangoDriver | null> {
    if (config.integrations.mockMode || !this.client) {
      logger.info('Yango get driver info (MOCK MODE):', { driverId });
      return this.getMockDrivers()[0];
    }

    try {
      const response = await this.client.post<{ driver_profiles: YangoDriver[] }>(
        '/v1/parks/driver-profiles/list',
        {
          query: {
            park: {
              id: config.integrations.yango.partnerId,
              driver_profile: {
                id: driverId,
              },
            },
          },
        }
      );

      const driver = response.data.driver_profiles[0] || null;
      logger.info('Yango driver info retrieved:', { driverId, found: !!driver });
      return driver;
    } catch (error: any) {
      logger.error('Yango get driver info failed:', {
        driverId,
        error: error.message,
        response: error.response?.data,
      });
      return null;
    }
  }

  async getDriverPerformance(driverId: string): Promise<YangoDriverPerformance> {
    if (config.integrations.mockMode || !this.client) {
      logger.info('Yango get driver performance (MOCK MODE):', { driverId });
      return this.getMockDriverPerformance(driverId);
    }

    try {
      // Get driver's orders/trips
      const ordersResponse = await this.client.post<{ orders: any[] }>('/v1/parks/orders/list', {
        query: {
          park: {
            id: config.integrations.yango.partnerId,
            driver_profile: {
              id: driverId,
            },
          },
        },
      });

      const orders = ordersResponse.data.orders || [];
      const completedOrders = orders.filter((o) => o.status === 'complete');
      const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

      const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.price || 0), 0);
      const avgRating =
        completedOrders.length > 0
          ? completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.length
          : 0;

      const performance: YangoDriverPerformance = {
        driver_profile_id: driverId,
        rating: avgRating,
        total_trips: orders.length,
        completed_trips: completedOrders.length,
        cancelled_trips: cancelledOrders.length,
        total_revenue: totalRevenue,
        average_rating: avgRating,
        acceptance_rate:
          orders.length > 0 ? completedOrders.length / orders.length : 0,
      };

      logger.info('Yango driver performance retrieved:', { driverId, performance });
      return performance;
    } catch (error: any) {
      logger.error('Yango get driver performance failed:', {
        driverId,
        error: error.message,
        response: error.response?.data,
      });
      // Return mock data on error
      return this.getMockDriverPerformance(driverId);
    }
  }

  async getFleetStats(): Promise<YangoFleetStats> {
    if (config.integrations.mockMode || !this.client) {
      logger.info('Yango get fleet stats (MOCK MODE)');
      return this.getMockFleetStats();
    }

    try {
      const driversResponse = await this.client.post<{ driver_profiles: YangoDriver[] }>(
        '/v1/parks/driver-profiles/list',
        {
          query: {
            park: {
              id: config.integrations.yango.partnerId,
            },
          },
        }
      );

      const drivers = driversResponse.data.driver_profiles || [];
      const activeDrivers = drivers.filter((d) => d.status === 'active');

      // Get today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const ordersResponse = await this.client.post<{ orders: any[] }>('/v1/parks/orders/list', {
        query: {
          park: {
            id: config.integrations.yango.partnerId,
          },
          created_from: today.toISOString(),
        },
      });

      const todayOrders = ordersResponse.data.orders || [];
      const completedTodayOrders = todayOrders.filter((o) => o.status === 'complete');
      const todayRevenue = completedTodayOrders.reduce((sum, order) => sum + (order.price || 0), 0);

      const stats: YangoFleetStats = {
        total_drivers: drivers.length,
        active_drivers: activeDrivers.length,
        total_trips_today: todayOrders.length,
        total_revenue_today: todayRevenue,
      };

      logger.info('Yango fleet stats retrieved:', stats);
      return stats;
    } catch (error: any) {
      logger.error('Yango get fleet stats failed:', {
        error: error.message,
        response: error.response?.data,
      });
      // Return mock data on error
      return this.getMockFleetStats();
    }
  }

  isEnabled(): boolean {
    return config.integrations.yango.enabled || config.integrations.mockMode;
  }
}

export const yangoFleetService = new YangoFleetService();
