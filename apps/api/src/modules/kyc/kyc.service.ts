import { db } from '../../utils/database';
import { creditService } from '../credit/credit.service';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import type { SubmitKYCDocumentInput, ReviewKYCDocumentInput } from './kyc.schemas';

export class KYCService {
  /**
   * Submit KYC document
   */
  async submitDocument(userId: string, data: SubmitKYCDocumentInput) {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Create document
    const document = await db.kYCDocument.create({
      data: {
        userId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        status: 'PENDING',
      },
    });

    // Update user KYC status to PENDING if not already
    if (user.kycStatus === 'NOT_STARTED') {
      await db.user.update({
        where: { id: userId },
        data: { kycStatus: 'PENDING' },
      });
    }

    logger.info('KYC document submitted:', {
      documentId: document.id,
      userId,
      type: data.documentType,
    });

    return document;
  }

  /**
   * Get user's KYC documents
   */
  async getUserDocuments(userId: string) {
    const documents = await db.kYCDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return documents;
  }

  /**
   * Get KYC document by ID
   */
  async getDocumentById(documentId: string) {
    const document = await db.kYCDocument.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            kycStatus: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('KYC Document');
    }

    return document;
  }

  /**
   * List KYC documents with filters (Admin)
   */
  async listDocuments(
    page: number = 1,
    limit: number = 20,
    status?: string,
    userId?: string,
    documentType?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (documentType) where.documentType = documentType;

    const [documents, total] = await Promise.all([
      db.kYCDocument.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.kYCDocument.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Review KYC document (Admin)
   */
  async reviewDocument(
    documentId: string,
    adminId: string,
    data: ReviewKYCDocumentInput
  ) {
    const document = await db.kYCDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) {
      throw new NotFoundError('KYC Document');
    }

    if (document.status !== 'PENDING') {
      throw new BadRequestError(`Cannot review document with status: ${document.status}`);
    }

    // Update document
    const updatedDocument = await db.kYCDocument.update({
      where: { id: documentId },
      data: {
        status: data.status,
        rejectionReason: data.rejectionReason,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    // Check if all key documents are approved
    if (data.status === 'APPROVED') {
      await this.checkAndUpdateUserKYCStatus(document.userId);
    }

    // If rejected, update user KYC status
    if (data.status === 'REJECTED') {
      await db.user.update({
        where: { id: document.userId },
        data: { kycStatus: 'REJECTED' },
      });
    }

    logger.info('KYC document reviewed:', {
      documentId,
      adminId,
      status: data.status,
      userId: document.userId,
    });

    return updatedDocument;
  }

  /**
   * Check if user has all required documents approved and update KYC status
   */
  private async checkAndUpdateUserKYCStatus(userId: string) {
    const documents = await db.kYCDocument.findMany({
      where: { userId },
    });

    const approvedDocs = documents.filter((doc) => doc.status === 'APPROVED');

    // Required documents for verification
    const hasIDCard = approvedDocs.some(
      (doc) => doc.documentType === 'ID_CARD' || doc.documentType === 'PASSPORT'
    );
    const hasDriversLicense = approvedDocs.some((doc) => doc.documentType === 'DRIVERS_LICENSE');
    const hasSelfie = approvedDocs.some((doc) => doc.documentType === 'SELFIE');

    // If all key documents are approved, mark user as verified
    if (hasIDCard && hasDriversLicense && hasSelfie) {
      await db.user.update({
        where: { id: userId },
        data: { kycStatus: 'VERIFIED' },
      });

      // Recalculate credit score (KYC completion affects score)
      await creditService.recalculateCreditScore(userId, 'KYC verified');

      logger.info('User KYC verified:', { userId });
    }
  }

  /**
   * Get KYC status summary
   */
  async getKYCStatus(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        kycStatus: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const documents = await db.kYCDocument.findMany({
      where: { userId },
      select: {
        id: true,
        documentType: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check which documents are still needed
    const approvedDocs = documents.filter((doc) => doc.status === 'APPROVED');
    const hasIDCard = approvedDocs.some(
      (doc) => doc.documentType === 'ID_CARD' || doc.documentType === 'PASSPORT'
    );
    const hasDriversLicense = approvedDocs.some((doc) => doc.documentType === 'DRIVERS_LICENSE');
    const hasSelfie = approvedDocs.some((doc) => doc.documentType === 'SELFIE');

    const missingDocuments = [];
    if (!hasIDCard) missingDocuments.push('ID_CARD or PASSPORT');
    if (!hasDriversLicense) missingDocuments.push('DRIVERS_LICENSE');
    if (!hasSelfie) missingDocuments.push('SELFIE');

    return {
      kycStatus: user.kycStatus,
      documents,
      missingDocuments,
      isComplete: missingDocuments.length === 0,
    };
  }

  /**
   * Resubmit rejected document
   */
  async resubmitDocument(userId: string, documentId: string, data: SubmitKYCDocumentInput) {
    const document = await db.kYCDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError('KYC Document');
    }

    if (document.userId !== userId) {
      throw new BadRequestError('Document does not belong to user');
    }

    if (document.status !== 'REJECTED') {
      throw new BadRequestError('Can only resubmit rejected documents');
    }

    // Update document with new data
    const updatedDocument = await db.kYCDocument.update({
      where: { id: documentId },
      data: {
        documentNumber: data.documentNumber,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl,
        status: 'PENDING',
        rejectionReason: null,
        reviewedById: null,
        reviewedAt: null,
      },
    });

    // Update user KYC status back to PENDING
    await db.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    logger.info('KYC document resubmitted:', {
      documentId,
      userId,
    });

    return updatedDocument;
  }
}

export const kycService = new KYCService();
