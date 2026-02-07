/**
 * Vehicle Test Factory - DAM Africa V2
 */

import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateVehicleOptions {
  make?: string;
  model?: string;
  year?: number;
  type?: VehicleType;
  licensePlate?: string;
  vin?: string;
  dailyRate?: number;
  available?: boolean;
}

export class VehicleFactory {
  private static counter = 0;

  /**
   * Generate unique license plate (Côte d'Ivoire format)
   */
  static uniqueLicensePlate(): string {
    this.counter++;
    return `CI-${1000 + this.counter}-AB`;
  }

  /**
   * Generate unique VIN
   */
  static uniqueVIN(): string {
    this.counter++;
    return `VIN${Date.now()}${this.counter}`.substring(0, 17);
  }

  /**
   * Create a vehicle
   */
  static async createVehicle(options: CreateVehicleOptions = {}) {
    return await prisma.vehicle.create({
      data: {
        make: options.make || 'Toyota',
        model: options.model || 'Corolla',
        year: options.year || 2020,
        type: options.type || 'SEDAN',
        licensePlate: options.licensePlate || this.uniqueLicensePlate(),
        vin: options.vin || this.uniqueVIN(),
        dailyRate: options.dailyRate || 25000,
        available: options.available ?? true,
      },
    });
  }

  /**
   * Create a premium vehicle
   */
  static async createPremiumVehicle(options: CreateVehicleOptions = {}) {
    return await this.createVehicle({
      ...options,
      make: options.make || 'Mercedes-Benz',
      model: options.model || 'C-Class',
      year: options.year || 2022,
      type: options.type || 'LUXURY',
      dailyRate: options.dailyRate || 75000,
    });
  }

  /**
   * Create multiple vehicles
   */
  static async createVehicles(count: number, options: CreateVehicleOptions = {}) {
    const vehicles = [];
    for (let i = 0; i < count; i++) {
      const vehicle = await this.createVehicle({
        ...options,
        model: options.model || `Vehicle${i + 1}`,
      });
      vehicles.push(vehicle);
    }
    return vehicles;
  }

  /**
   * Reset factory counter
   */
  static reset() {
    this.counter = 0;
  }
}
