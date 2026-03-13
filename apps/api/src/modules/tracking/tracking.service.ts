import { db } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class TrackingService {
  async getLivePositions() {
    // Get latest position for each vehicle
    const vehicles = await db.vehicle.findMany({
      where: { status: { not: 'RETIRED' }, gpsDeviceId: { not: null } },
      select: { id: true, registrationNo: true, make: true, model: true, gpsDeviceId: true },
    });

    const positions = await Promise.all(
      vehicles.map(async (v) => {
        const latest = await db.vehicleTracking.findFirst({
          where: { vehicleId: v.id },
          orderBy: { timestamp: 'desc' },
        });
        return { vehicle: v, position: latest };
      }),
    );

    return positions.filter((p) => p.position !== null);
  }

  async getVehiclePosition(vehicleId: string) {
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    const latest = await db.vehicleTracking.findFirst({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    });

    const history = await db.vehicleTracking.findMany({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return { vehicle, currentPosition: latest, history };
  }

  async syncTelemetry(data: {
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    ignition?: boolean;
    fuelLevel?: number;
    mileage?: number;
    timestamp: string;
  }) {
    const vehicle = await db.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    const tracking = await db.vehicleTracking.create({
      data: {
        vehicleId: data.vehicleId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        altitude: data.altitude,
        ignition: data.ignition,
        fuelLevel: data.fuelLevel,
        mileage: data.mileage,
        timestamp: new Date(data.timestamp),
      },
    });

    // Update vehicle mileage if provided
    if (data.mileage && data.mileage > vehicle.mileage) {
      await db.vehicle.update({
        where: { id: data.vehicleId },
        data: { mileage: data.mileage },
      });
    }

    return tracking;
  }

  async getDrivingBehavior(vehicleId: string) {
    const behaviors = await db.drivingBehavior.findMany({
      where: { vehicleId },
      orderBy: { periodEnd: 'desc' },
      take: 30,
    });
    return behaviors;
  }

  async listGeofenceZones() {
    return db.geofenceZone.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGeofenceZone(data: {
    name: string;
    type?: string;
    coordinates: unknown;
    radius?: number;
    description?: string;
  }) {
    return db.geofenceZone.create({
      data: {
        name: data.name,
        type: (data.type as Prisma.EnumGeofenceTypeFilter['equals']) || 'CUSTOM',
        coordinates: data.coordinates as Prisma.InputJsonValue,
        radius: data.radius,
        description: data.description,
      },
    });
  }

  async updateGeofenceZone(id: string, data: {
    name?: string;
    type?: string;
    coordinates?: unknown;
    radius?: number;
    description?: string;
    isActive?: boolean;
  }) {
    const zone = await db.geofenceZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundError('Zone de géofencing introuvable');

    return db.geofenceZone.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type as Prisma.EnumGeofenceTypeFilter['equals'],
        coordinates: data.coordinates as Prisma.InputJsonValue,
        radius: data.radius,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  async deleteGeofenceZone(id: string) {
    const zone = await db.geofenceZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundError('Zone de géofencing introuvable');
    await db.geofenceZone.delete({ where: { id } });
  }

  async getGeofenceAlerts(params: {
    page: number;
    limit: number;
    vehicleId?: string;
    zoneId?: string;
    acknowledged?: boolean;
  }) {
    const where: Prisma.GeofenceAlertWhereInput = {};
    if (params.vehicleId) where.vehicleId = params.vehicleId;
    if (params.zoneId) where.zoneId = params.zoneId;
    if (params.acknowledged !== undefined) where.acknowledged = params.acknowledged;

    const [alerts, total] = await Promise.all([
      db.geofenceAlert.findMany({
        where,
        include: { zone: { select: { id: true, name: true, type: true } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { timestamp: 'desc' },
      }),
      db.geofenceAlert.count({ where }),
    ]);

    return { alerts, total };
  }
}

export const trackingService = new TrackingService();
