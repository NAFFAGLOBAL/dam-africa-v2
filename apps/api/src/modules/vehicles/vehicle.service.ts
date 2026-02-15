import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { CreateVehicleInput, UpdateVehicleInput, AssignVehicleInput } from './vehicle.schemas';

export class VehicleService {
  async listVehicles(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          rentals: {
            where: { status: 'ACTIVE' },
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.vehicle.count({ where }),
    ]);

    return { vehicles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getVehicleById(id: string) {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        rentals: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!vehicle) throw new NotFoundError('Vehicle');
    return vehicle;
  }

  async createVehicle(data: CreateVehicleInput) {
    const existing = await db.vehicle.findUnique({
      where: { licensePlate: data.licensePlate },
    });

    if (existing) {
      throw new BadRequestError('Vehicle with this license plate already exists');
    }

    const vehicle = await db.vehicle.create({
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        color: data.color,
        vin: data.vin,
        photoUrl: data.photoUrl,
        purchasePrice: data.purchasePrice,
        currentValue: data.currentValue,
        status: 'AVAILABLE',
      },
    });

    logger.info('Vehicle created:', { vehicleId: vehicle.id, licensePlate: vehicle.licensePlate });
    return vehicle;
  }

  async updateVehicle(id: string, data: UpdateVehicleInput) {
    const vehicle = await db.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError('Vehicle');

    if (data.licensePlate && data.licensePlate !== vehicle.licensePlate) {
      const existing = await db.vehicle.findUnique({
        where: { licensePlate: data.licensePlate },
      });
      if (existing) {
        throw new BadRequestError('Vehicle with this license plate already exists');
      }
    }

    const updated = await db.vehicle.update({
      where: { id },
      data,
    });

    logger.info('Vehicle updated:', { vehicleId: id });
    return updated;
  }

  async deleteVehicle(id: string) {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: { rentals: { where: { status: 'ACTIVE' } } },
    });

    if (!vehicle) throw new NotFoundError('Vehicle');

    if (vehicle.rentals.length > 0) {
      throw new BadRequestError('Cannot delete vehicle with active rentals');
    }

    const updated = await db.vehicle.update({
      where: { id },
      data: { status: 'RETIRED' },
    });

    logger.info('Vehicle retired:', { vehicleId: id });
    return updated;
  }

  async assignVehicle(vehicleId: string, userId: string, data: AssignVehicleInput) {
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      include: { rentals: { where: { status: 'ACTIVE' } } },
    });

    if (!vehicle) throw new NotFoundError('Vehicle');

    if (vehicle.status !== 'AVAILABLE') {
      throw new BadRequestError('Vehicle is not available for rental');
    }

    if (vehicle.rentals.length > 0) {
      throw new BadRequestError('Vehicle has an active rental');
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const existingRental = await db.vehicleRental.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (existingRental) {
      throw new BadRequestError('User already has an active vehicle rental');
    }

    const rental = await db.$transaction(async (tx: any) => {
      const newRental = await tx.vehicleRental.create({
        data: {
          vehicleId,
          userId,
          startDate: new Date(data.startDate),
          weeklyRate: data.weeklyRate,
          status: 'ACTIVE',
        },
        include: {
          vehicle: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'RENTED' },
      });

      return newRental;
    });

    logger.info('Vehicle assigned:', { vehicleId, userId, rentalId: rental.id });
    return rental;
  }

  async returnVehicle(rentalId: string, notes?: string) {
    const rental = await db.vehicleRental.findUnique({
      where: { id: rentalId },
      include: { vehicle: true },
    });

    if (!rental) throw new NotFoundError('Rental');

    if (rental.status !== 'ACTIVE') {
      throw new BadRequestError('Rental is not active');
    }

    const updated = await db.$transaction(async (tx: any) => {
      const updatedRental = await tx.vehicleRental.update({
        where: { id: rentalId },
        data: {
          status: 'COMPLETED',
          endDate: new Date(),
          returnNotes: notes,
        },
        include: {
          vehicle: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      await tx.vehicle.update({
        where: { id: rental.vehicleId },
        data: { status: 'AVAILABLE' },
      });

      return updatedRental;
    });

    logger.info('Vehicle returned:', { rentalId, vehicleId: rental.vehicleId });
    return updated;
  }

  async getVehicleRentals(vehicleId: string) {
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundError('Vehicle');

    const rentals = await db.vehicleRental.findMany({
      where: { vehicleId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rentals;
  }

  async getFleetStats() {
    const [total, available, rented, maintenance, retired] = await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({ where: { status: 'AVAILABLE' } }),
      db.vehicle.count({ where: { status: 'RENTED' } }),
      db.vehicle.count({ where: { status: 'MAINTENANCE' } }),
      db.vehicle.count({ where: { status: 'RETIRED' } }),
    ]);

    const activeRentals = await db.vehicleRental.count({ where: { status: 'ACTIVE' } });

    return {
      total,
      available,
      rented,
      maintenance,
      retired,
      activeRentals,
    };
  }
}

export const vehicleService = new VehicleService();
