import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class AccidentsService {
  async reportAccident(userId: string, data: {
    vehicleId: string;
    severity: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    description: string;
    occurredAt: string;
    damageCost?: number;
  }) {
    const vehicle = await db.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    return db.accidentReport.create({
      data: {
        userId,
        vehicleId: data.vehicleId,
        severity: data.severity as Prisma.EnumAccidentSeverityFilter['equals'],
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        occurredAt: new Date(data.occurredAt),
        damageCost: data.damageCost,
        status: 'REPORTED',
      },
    });
  }

  async getAccidentReport(id: string) {
    const report = await db.accidentReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vehicle: { select: { id: true, registrationNo: true, make: true, model: true } },
        media: true,
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!report) throw new NotFoundError('Rapport d\'accident introuvable');
    return report;
  }

  async listAccidentReports(params: {
    page: number;
    limit: number;
    status?: string;
    severity?: string;
    userId?: string;
    vehicleId?: string;
  }) {
    const where: Prisma.AccidentReportWhereInput = {};
    if (params.status) where.status = params.status as Prisma.EnumAccidentStatusFilter['equals'];
    if (params.severity) where.severity = params.severity as Prisma.EnumAccidentSeverityFilter['equals'];
    if (params.userId) where.userId = params.userId;
    if (params.vehicleId) where.vehicleId = params.vehicleId;

    const [reports, total] = await Promise.all([
      db.accidentReport.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          vehicle: { select: { id: true, registrationNo: true, make: true, model: true } },
          _count: { select: { media: true, notes: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.accidentReport.count({ where }),
    ]);

    return { reports, total };
  }

  async addAccidentMedia(reportId: string, data: { fileUrl: string; fileType: string; caption?: string }) {
    const report = await db.accidentReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundError('Rapport d\'accident introuvable');

    return db.accidentMedia.create({
      data: { reportId, fileUrl: data.fileUrl, fileType: data.fileType, caption: data.caption },
    });
  }

  async addAccidentNote(reportId: string, authorId: string, content: string) {
    const report = await db.accidentReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundError('Rapport d\'accident introuvable');

    return db.accidentNote.create({
      data: { reportId, authorId, content },
    });
  }

  async updateAccidentStatus(id: string, resolvedBy: string, data: {
    status: string;
    damageCost?: number;
    insuranceClaim?: string;
  }) {
    const report = await db.accidentReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundError('Rapport d\'accident introuvable');

    return db.accidentReport.update({
      where: { id },
      data: {
        status: data.status as Prisma.EnumAccidentStatusFilter['equals'],
        damageCost: data.damageCost ?? report.damageCost,
        insuranceClaim: data.insuranceClaim,
        ...(data.status === 'RESOLVED' ? { resolvedAt: new Date(), resolvedBy } : {}),
      },
    });
  }

  async getUserAccidentReports(userId: string) {
    return db.accidentReport.findMany({
      where: { userId },
      include: {
        vehicle: { select: { id: true, registrationNo: true, make: true, model: true } },
        _count: { select: { media: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const accidentsService = new AccidentsService();
