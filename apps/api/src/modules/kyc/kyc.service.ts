import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class KycService {
  async submitDocument(userId: string, data: {
    type: string;
    fileUrl: string;
    fileName?: string;
    expiresAt?: string;
    metadata?: Record<string, unknown>;
  }) {
    return db.kYCDocument.create({
      data: {
        userId,
        type: data.type as any,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
        status: 'PENDING',
      },
    });
  }

  async listDocuments(params: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    type?: string;
  }) {
    const where: Prisma.KYCDocumentWhereInput = {};
    if (params.status) where.status = params.status as any;
    if (params.userId) where.userId = params.userId;
    if (params.type) where.type = params.type as any;

    const [documents, total] = await Promise.all([
      db.kYCDocument.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.kYCDocument.count({ where }),
    ]);

    return { documents, total };
  }

  async getDocument(id: string) {
    const doc = await db.kYCDocument.findUnique({
      where: { id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!doc) throw new NotFoundError('Document KYC introuvable');
    return doc;
  }

  async approveDocument(id: string, reviewedBy: string, reviewNote?: string) {
    const doc = await db.kYCDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('Document KYC introuvable');
    if (doc.status !== 'PENDING') throw new BadRequestError('Ce document a déjà été traité');

    const updated = await db.kYCDocument.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy, reviewNote, reviewedAt: new Date() },
    });

    // Check if all required docs are approved -> verify user
    const pendingDocs = await db.kYCDocument.count({
      where: { userId: doc.userId, status: { not: 'APPROVED' } },
    });
    if (pendingDocs === 0) {
      await db.user.update({
        where: { id: doc.userId },
        data: { isVerified: true, status: 'ACTIVE' },
      });
    }

    return updated;
  }

  async rejectDocument(id: string, reviewedBy: string, reviewNote?: string) {
    const doc = await db.kYCDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('Document KYC introuvable');
    if (doc.status !== 'PENDING') throw new BadRequestError('Ce document a déjà été traité');

    return db.kYCDocument.update({
      where: { id },
      data: { status: 'REJECTED', reviewedBy, reviewNote, reviewedAt: new Date() },
    });
  }

  async getUserKycStatus(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    const documents = await db.kYCDocument.findMany({
      where: { userId },
      select: { type: true, status: true, createdAt: true, reviewedAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const approved = documents.filter((d) => d.status === 'APPROVED').length;
    const pending = documents.filter((d) => d.status === 'PENDING').length;
    const rejected = documents.filter((d) => d.status === 'REJECTED').length;

    return {
      isVerified: user.isVerified,
      total: documents.length,
      approved,
      pending,
      rejected,
      documents,
    };
  }
}

export const kycService = new KycService();
