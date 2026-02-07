/**
 * KYC Document Test Factory - DAM Africa V2
 */

import { PrismaClient, DocumentType, DocumentStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateKYCDocumentOptions {
  userId: string;
  documentType?: DocumentType;
  documentNumber?: string;
  status?: DocumentStatus;
  reviewedById?: string;
  rejectionReason?: string;
}

export class KYCFactory {
  private static counter = 0;

  /**
   * Generate unique document number
   */
  static uniqueDocumentNumber(type: DocumentType): string {
    this.counter++;
    const prefix = type === 'ID_CARD' ? 'ID' : type === 'PASSPORT' ? 'PP' : 'DL';
    return `${prefix}${Date.now()}${this.counter}`;
  }

  /**
   * Create a KYC document
   */
  static async createKYCDocument(options: CreateKYCDocumentOptions) {
    const documentType = options.documentType || 'ID_CARD';

    return await prisma.kYCDocument.create({
      data: {
        userId: options.userId,
        documentType,
        documentNumber: options.documentNumber || this.uniqueDocumentNumber(documentType),
        expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
        frontImageUrl: `https://storage.example.com/${options.userId}/front.jpg`,
        backImageUrl: `https://storage.example.com/${options.userId}/back.jpg`,
        status: options.status || 'PENDING',
        reviewedById: options.reviewedById,
        rejectionReason: options.rejectionReason,
        reviewedAt: options.reviewedById ? new Date() : null,
      },
      include: {
        user: true,
        reviewedBy: true,
      },
    });
  }

  /**
   * Create an approved KYC document
   */
  static async createApprovedKYC(options: CreateKYCDocumentOptions) {
    return await this.createKYCDocument({
      ...options,
      status: 'APPROVED',
    });
  }

  /**
   * Create a rejected KYC document
   */
  static async createRejectedKYC(options: CreateKYCDocumentOptions) {
    return await this.createKYCDocument({
      ...options,
      status: 'REJECTED',
      rejectionReason: options.rejectionReason || 'Document unclear or expired',
    });
  }

  /**
   * Create complete KYC set for a user (ID, Passport, License, Selfie)
   */
  static async createCompleteKYCSet(userId: string, status: DocumentStatus = 'APPROVED') {
    const documents = [];
    const types: DocumentType[] = ['ID_CARD', 'DRIVERS_LICENSE', 'SELFIE', 'PROOF_OF_ADDRESS'];

    for (const type of types) {
      const doc = await this.createKYCDocument({
        userId,
        documentType: type,
        status,
      });
      documents.push(doc);
    }

    return documents;
  }

  /**
   * Reset factory counter
   */
  static reset() {
    this.counter = 0;
  }
}
