import { db } from '../../utils/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class VehiclesService {
  async listVehicles(params: {
    page: number;
    limit: number;
    status?: string;
    customerId?: string;
    search?: string;
  }) {
    const where: Prisma.VehicleWhereInput = {};
    if (params.status) where.status = params.status as Prisma.EnumVehicleStatusFilter['equals'];
    if (params.customerId) where.customerId = params.customerId;
    if (params.search) {
      where.OR = [
        { registrationNo: { contains: params.search, mode: 'insensitive' } },
        { make: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.vehicle.count({ where }),
    ]);

    return { vehicles, total };
  }

  async getVehicle(id: string) {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        maintenanceRecords: { orderBy: { performedAt: 'desc' }, take: 10 },
        _count: { select: { rentals: true, contracts: true, accidentReports: true } },
      },
    });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');
    return vehicle;
  }

  async createVehicle(data: {
    registrationNo: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    vin?: string;
    fuelType?: string;
    transmission?: string;
    seatingCapacity?: number;
    dailyRate?: number;
    weeklyRate?: number;
    monthlyRate?: number;
    purchasePrice?: number;
    currentValue?: number;
    insuranceExpiry?: string;
    imageUrl?: string;
    gpsDeviceId?: string;
    customerId?: string;
  }) {
    const existing = await db.vehicle.findUnique({ where: { registrationNo: data.registrationNo } });
    if (existing) throw new ConflictError('Un véhicule avec ce numéro d\'immatriculation existe déjà');

    return db.vehicle.create({
      data: {
        ...data,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
      },
    });
  }

  async updateVehicle(id: string, data: Partial<{
    registrationNo: string;
    make: string;
    model: string;
    year: number;
    color: string;
    vin: string;
    fuelType: string;
    transmission: string;
    seatingCapacity: number;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    purchasePrice: number;
    currentValue: number;
    insuranceExpiry: string;
    imageUrl: string;
    gpsDeviceId: string;
    customerId: string;
  }>) {
    const vehicle = await db.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    const updateData: Prisma.VehicleUpdateInput = { ...data };
    if (data.insuranceExpiry) updateData.insuranceExpiry = new Date(data.insuranceExpiry);

    return db.vehicle.update({ where: { id }, data: updateData });
  }

  async retireVehicle(id: string) {
    const vehicle = await db.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    return db.vehicle.update({ where: { id }, data: { status: 'RETIRED' } });
  }

  async getMaintenanceHistory(vehicleId: string) {
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    return db.maintenanceRecord.findMany({
      where: { vehicleId },
      orderBy: { performedAt: 'desc' },
    });
  }

  async addMaintenance(vehicleId: string, data: {
    type: string;
    description: string;
    cost: number;
    mileageAt?: number;
    performedBy?: string;
    performedAt: string;
    nextDueAt?: string;
    nextDueMileage?: number;
    notes?: string;
  }) {
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    const record = await db.maintenanceRecord.create({
      data: {
        vehicleId,
        type: data.type,
        description: data.description,
        cost: data.cost,
        mileageAt: data.mileageAt,
        performedBy: data.performedBy,
        performedAt: new Date(data.performedAt),
        nextDueAt: data.nextDueAt ? new Date(data.nextDueAt) : undefined,
        nextDueMileage: data.nextDueMileage,
        notes: data.notes,
      },
    });

    // Update vehicle last service date
    await db.vehicle.update({
      where: { id: vehicleId },
      data: {
        lastServiceDate: new Date(data.performedAt),
        nextServiceDate: data.nextDueAt ? new Date(data.nextDueAt) : undefined,
        mileage: data.mileageAt ?? vehicle.mileage,
      },
    });

    return record;
  }

  async toggleFavorite(userId: string, vehicleId: string) {
    const existing = await db.vehicleFavorite.findUnique({
      where: { userId_vehicleId: { userId, vehicleId } },
    });

    if (existing) {
      await db.vehicleFavorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await db.vehicleFavorite.create({ data: { userId, vehicleId } });
    return { favorited: true };
  }

  async getUserFavorites(userId: string) {
    const favorites = await db.vehicleFavorite.findMany({
      where: { userId },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.vehicle);
  }
}

export const vehiclesService = new VehiclesService();
