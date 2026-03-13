import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class RentalsService {
  async requestRental(userId: string, data: {
    vehicleId: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    const vehicle = await db.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');
    if (vehicle.status !== 'AVAILABLE') throw new BadRequestError('Ce véhicule n\'est pas disponible');
    if (!vehicle.dailyRate) throw new BadRequestError('Tarif journalier non défini pour ce véhicule');

    const user = await db.user.findUnique({ where: { id: userId }, select: { customerId: true } });

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 1) throw new BadRequestError('La durée minimale est d\'un jour');

    const totalCost = days * vehicle.dailyRate;

    return db.rental.create({
      data: {
        userId,
        vehicleId: data.vehicleId,
        customerId: user?.customerId,
        startDate,
        endDate,
        dailyRate: vehicle.dailyRate,
        totalCost,
        notes: data.notes,
        status: 'REQUESTED',
      },
    });
  }

  async listRentals(params: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    vehicleId?: string;
  }) {
    const where: Prisma.RentalWhereInput = {};
    if (params.status) where.status = params.status as any;
    if (params.userId) where.userId = params.userId;
    if (params.vehicleId) where.vehicleId = params.vehicleId;

    const [rentals, total] = await Promise.all([
      db.rental.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          vehicle: { select: { id: true, registrationNo: true, make: true, model: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.rental.count({ where }),
    ]);

    return { rentals, total };
  }

  async getRental(id: string) {
    const rental = await db.rental.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vehicle: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!rental) throw new NotFoundError('Location introuvable');
    return rental;
  }

  async approveRental(id: string, approvedBy: string) {
    const rental = await db.rental.findUnique({ where: { id } });
    if (!rental) throw new NotFoundError('Location introuvable');
    if (rental.status !== 'REQUESTED') throw new BadRequestError('Cette location ne peut pas être approuvée');

    await db.vehicle.update({ where: { id: rental.vehicleId }, data: { status: 'RESERVED' } });

    return db.rental.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy, approvedAt: new Date() },
    });
  }

  async completeRental(id: string) {
    const rental = await db.rental.findUnique({ where: { id } });
    if (!rental) throw new NotFoundError('Location introuvable');
    if (rental.status !== 'ACTIVE') throw new BadRequestError('Cette location ne peut pas être complétée');

    await db.vehicle.update({ where: { id: rental.vehicleId }, data: { status: 'AVAILABLE' } });

    return db.rental.update({
      where: { id },
      data: { status: 'COMPLETED', actualEnd: new Date() },
    });
  }

  async terminateRental(id: string, terminatedBy: string, reason: string) {
    const rental = await db.rental.findUnique({ where: { id } });
    if (!rental) throw new NotFoundError('Location introuvable');
    if (!['ACTIVE', 'APPROVED'].includes(rental.status)) {
      throw new BadRequestError('Cette location ne peut pas être résiliée');
    }

    await db.vehicle.update({ where: { id: rental.vehicleId }, data: { status: 'AVAILABLE' } });

    return db.rental.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        terminatedBy,
        terminatedAt: new Date(),
        terminationReason: reason,
        actualEnd: new Date(),
      },
    });
  }

  async getUserRentals(userId: string) {
    return db.rental.findMany({
      where: { userId },
      include: {
        vehicle: { select: { id: true, registrationNo: true, make: true, model: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const rentalsService = new RentalsService();
