import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

function generateReportNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ACC-${y}${m}-${rand}`;
}

export class AccidentsService {
  async reportAccident(
    userId: string,
    data: {
      vehicleId: string;
      description: string;
      latitude?: number;
      longitude?: number;
      location?: string;
      thirdPartyInvolved?: boolean;
      occurredAt?: string;
    },
  ) {
    const vehicle = await db.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true, licensePlate: true, make: true, model: true, customerId: true },
    });
    if (!vehicle) {
      throw new NotFoundError('Véhicule introuvable');
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, customerId: true },
    });
    if (!user) {
      throw new NotFoundError('Utilisateur introuvable');
    }

    const report = await db.accidentReport.create({
      data: {
        customerId: user.customerId,
        userId,
        vehicleId: data.vehicleId,
        reportNumber: generateReportNumber(),
        description: data.description || 'Accident signalé',
        latitude: data.latitude,
        longitude: data.longitude,
        locationDescription: data.location,
        thirdPartyInvolved: data.thirdPartyInvolved ?? false,
        occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
        status: 'REPORTED',
        severity: 'MINOR',
        driverFault: 'NOT_DETERMINED',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vehicle: { select: { id: true, licensePlate: true, make: true, model: true } },
        media: true,
      },
    });

    // Notify all admins about the new accident report
    try {
      const admins = await db.admin.findMany({
        where: { status: 'ACTIVE', customerId: user.customerId },
        select: { id: true },
      });

      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            customerId: user.customerId,
            userId: admin.id,
            type: 'ACCIDENT_UPDATE' as const,
            title: "Nouvelle déclaration d'accident",
            body: `Un nouvel accident a été signalé pour le véhicule ${vehicle.licensePlate}.`,
            data: { reportId: report.id },
          })),
        });
      }
    } catch (error) {
      logger.error("Erreur lors de l'envoi des notifications aux admins:", error);
    }

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          customerId: user.customerId,
          userId,
          actorType: 'USER',
          action: 'ACCIDENT_REPORTED',
          resource: 'AccidentReport',
          resourceId: report.id,
          description: `Accident signalé pour le véhicule ${vehicle.licensePlate}`,
          metadata: { reportId: report.id },
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la journalisation de l'activité:", error);
    }

    return report;
  }

  async getAccidentReport(id: string) {
    const report = await db.accidentReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vehicle: { select: { id: true, licensePlate: true, make: true, model: true } },
        media: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            admin: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundError("Rapport d'accident introuvable");
    }

    return report;
  }

  async listAccidentReports(params: {
    page: number;
    limit: number;
    status?: string;
    severity?: string;
    driverFault?: string;
    userId?: string;
    vehicleId?: string;
  }) {
    const where: Prisma.AccidentReportWhereInput = {};
    if (params.status) where.status = params.status as any;
    if (params.severity) where.severity = params.severity as any;
    if (params.driverFault) where.driverFault = params.driverFault as any;
    if (params.userId) where.userId = params.userId;
    if (params.vehicleId) where.vehicleId = params.vehicleId;

    const [reports, total] = await Promise.all([
      db.accidentReport.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          vehicle: { select: { id: true, licensePlate: true, make: true, model: true } },
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

  async getUserAccidentReports(userId: string) {
    return db.accidentReport.findMany({
      where: { userId },
      include: {
        vehicle: { select: { id: true, licensePlate: true, make: true, model: true } },
        media: true,
        _count: { select: { media: true, notes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserAccidentCount(userId: string) {
    const count = await db.accidentReport.count({ where: { userId } });
    return { count };
  }

  async addMedia(
    reportId: string,
    data: { fileUrl: string; fileType: string; caption?: string },
  ) {
    const report = await db.accidentReport.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundError("Rapport d'accident introuvable");
    }

    return db.accidentReportMedia.create({
      data: {
        accidentReportId: reportId,
        fileUrl: data.fileUrl,
        type: data.fileType as any,
        fileName: data.fileUrl.split('/').pop() || 'file',
        caption: data.caption,
      },
    });
  }

  async addNote(reportId: string, adminId: string, content: string) {
    const report = await db.accidentReport.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundError("Rapport d'accident introuvable");
    }

    return db.accidentReportNote.create({
      data: {
        accidentReportId: reportId,
        adminId,
        content,
      },
      include: {
        admin: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async updateSeverity(id: string, adminId: string, severity: string) {
    const report = await db.accidentReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundError("Rapport d'accident introuvable");
    }

    const updatedReport = await db.accidentReport.update({
      where: { id },
      data: { severity: severity as any },
    });

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          customerId: report.customerId,
          adminId,
          actorType: 'ADMIN',
          action: 'ACCIDENT_SEVERITY_UPDATED',
          resource: 'AccidentReport',
          resourceId: id,
          description: `Gravité de l'accident mise à jour: ${severity}`,
          metadata: { reportId: id, severity },
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la journalisation de l'activité:", error);
    }

    return updatedReport;
  }

  async attachPoliceReport(
    id: string,
    adminId: string,
    data: { policeReportUrl: string; policeReportNumber?: string },
  ) {
    const report = await db.accidentReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundError("Rapport d'accident introuvable");
    }

    const updatedReport = await db.accidentReport.update({
      where: { id },
      data: {
        policeReportUrl: data.policeReportUrl,
        policeReportNumber: data.policeReportNumber,
      },
    });

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          customerId: report.customerId,
          adminId,
          actorType: 'ADMIN',
          action: 'POLICE_REPORT_ATTACHED',
          resource: 'AccidentReport',
          resourceId: id,
          description: "Rapport de police attaché à l'accident",
          metadata: { reportId: id, policeReportNumber: data.policeReportNumber },
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la journalisation de l'activité:", error);
    }

    return updatedReport;
  }

  async determineResponsibility(
    id: string,
    adminId: string,
    data: { driverFault: string; creditScoreImpact?: number },
  ) {
    const report = await db.accidentReport.findUnique({
      where: { id },
      include: { user: { select: { id: true, creditScore: true, customerId: true } } },
    });
    if (!report) {
      throw new NotFoundError("Rapport d'accident introuvable");
    }

    if (report.status === 'CLOSED') {
      throw new BadRequestError('Ce dossier est déjà clôturé');
    }

    const updateData: any = {
      driverFault: data.driverFault,
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: adminId,
    };

    // If driver is at fault, apply credit score impact
    if (data.driverFault === 'DRIVER_AT_FAULT') {
      const impact = data.creditScoreImpact || 50;
      updateData.creditScoreImpact = impact;

      const user = report.user;
      const previousScore = user.creditScore ?? 0;
      const newScore = Math.max(0, previousScore - impact);

      await db.user.update({
        where: { id: report.userId },
        data: { creditScore: { decrement: impact } },
      });

      await db.creditScoreHistory.create({
        data: {
          customerId: user.customerId,
          userId: report.userId,
          score: newScore,
          previousScore,
          calculatedAt: new Date(),
          factors: { reason: `Accident - Chauffeur en tort (-${impact} points)` },
        },
      });

      logger.info(
        `Score de crédit mis à jour pour l'utilisateur ${report.userId}: ${previousScore} → ${newScore} (accident)`,
      );
    }

    const updatedReport = await db.accidentReport.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        vehicle: { select: { id: true, licensePlate: true, make: true, model: true } },
      },
    });

    // Notify driver that their case has been resolved
    try {
      const faultMessage =
        data.driverFault === 'DRIVER_AT_FAULT'
          ? "Vous avez été jugé responsable de l'accident."
          : "Vous n'avez pas été jugé responsable de l'accident.";

      await db.notification.create({
        data: {
          customerId: report.customerId,
          userId: report.userId,
          type: 'ACCIDENT_UPDATE',
          title: "Votre dossier d'accident a été clôturé",
          body: faultMessage,
          data: { reportId: id },
        },
      });
    } catch (error) {
      logger.error("Erreur lors de l'envoi de la notification au chauffeur:", error);
    }

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          customerId: report.customerId,
          adminId,
          actorType: 'ADMIN',
          action: 'ACCIDENT_RESPONSIBILITY_DETERMINED',
          resource: 'AccidentReport',
          resourceId: id,
          description: `Responsabilité déterminée: ${data.driverFault}`,
          metadata: {
            reportId: id,
            driverFault: data.driverFault,
            creditScoreImpact:
              data.driverFault === 'DRIVER_AT_FAULT' ? data.creditScoreImpact || 50 : 0,
          },
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la journalisation de l'activité:", error);
    }

    return updatedReport;
  }

  async updateStatus(id: string, adminId: string, status: string) {
    const report = await db.accidentReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundError("Rapport d'accident introuvable");
    }

    const updateData: any = { status };

    if (status === 'RESOLVED' && !report.resolvedAt) {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = adminId;
    }

    const updatedReport = await db.accidentReport.update({
      where: { id },
      data: updateData,
    });

    // Notify driver when status changes to CLOSED
    if (status === 'CLOSED') {
      try {
        await db.notification.create({
          data: {
            customerId: report.customerId,
            userId: report.userId,
            type: 'ACCIDENT_UPDATE',
            title: "Dossier d'accident clôturé",
            body: "Votre dossier d'accident a été clôturé par l'administration.",
            data: { reportId: id },
          },
        });
      } catch (error) {
        logger.error("Erreur lors de l'envoi de la notification au chauffeur:", error);
      }
    }

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          customerId: report.customerId,
          adminId,
          actorType: 'ADMIN',
          action: 'ACCIDENT_STATUS_UPDATED',
          resource: 'AccidentReport',
          resourceId: id,
          description: `Statut de l'accident mis à jour: ${status}`,
          metadata: { reportId: id, status },
        },
      });
    } catch (error) {
      logger.error("Erreur lors de la journalisation de l'activité:", error);
    }

    return updatedReport;
  }

  async getRiskZones(params: { radiusKm: number; minIncidents: number }) {
    // Fetch all accident reports that have geolocation data
    const accidents = await db.accidentReport.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        severity: true,
        locationDescription: true,
        occurredAt: true,
      },
      orderBy: { occurredAt: 'desc' },
    });

    if (accidents.length === 0) {
      return { zones: [], totalAccidents: 0 };
    }

    // Group accidents by proximity using the specified radius
    const radiusDeg = params.radiusKm / 111.0; // approximate degrees per km
    const visited = new Set<string>();
    const zones: Array<{
      latitude: number;
      longitude: number;
      location: string | null;
      incidentCount: number;
      severityCounts: Record<string, number>;
      radiusKm: number;
    }> = [];

    for (const accident of accidents) {
      if (visited.has(accident.id)) continue;

      const lat = accident.latitude!;
      const lng = accident.longitude!;

      // Find all accidents within the radius of this point
      const nearby = accidents.filter((a) => {
        if (visited.has(a.id)) return false;
        const dLat = a.latitude! - lat;
        const dLng = a.longitude! - lng;
        return Math.sqrt(dLat * dLat + dLng * dLng) <= radiusDeg;
      });

      if (nearby.length >= params.minIncidents) {
        // Calculate centroid
        const centroidLat = nearby.reduce((sum, a) => sum + a.latitude!, 0) / nearby.length;
        const centroidLng = nearby.reduce((sum, a) => sum + a.longitude!, 0) / nearby.length;

        // Count severities
        const severityCounts: Record<string, number> = {};
        for (const a of nearby) {
          severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1;
          visited.add(a.id);
        }

        // Use the location name from the most recent accident in the cluster
        const locationName =
          nearby.find((a) => a.locationDescription)?.locationDescription ?? null;

        zones.push({
          latitude: centroidLat,
          longitude: centroidLng,
          location: locationName,
          incidentCount: nearby.length,
          severityCounts,
          radiusKm: params.radiusKm,
        });
      }
    }

    // Sort zones by incident count descending
    zones.sort((a, b) => b.incidentCount - a.incidentCount);

    return { zones, totalAccidents: accidents.length };
  }
}

export const accidentsService = new AccidentsService();
