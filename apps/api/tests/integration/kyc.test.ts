/**
 * KYC Management Integration Tests - DAM Africa V2
 * Tests for KYC document submission and review
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { UserFactory, KYCFactory, resetAllFactories } from '../factories';
import { testDb } from '../setup';

const app = createApp();

describe('KYC Management API', () => {
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    resetAllFactories();

    testUser = await UserFactory.createUser();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'password123',
      });

    authToken = loginResponse.body.data.accessToken;
  });

  // ==========================================================================
  // KYC DOCUMENT SUBMISSION
  // ==========================================================================

  describe('POST /api/v1/kyc/documents', () => {
    const validDocumentData = {
      documentType: 'ID_CARD',
      documentNumber: 'CI123456789',
      expiryDate: '2028-12-31',
      frontImageUrl: 'https://storage.example.com/id-front.jpg',
      backImageUrl: 'https://storage.example.com/id-back.jpg',
    };

    it('should submit KYC document successfully', async () => {
      const response = await request(app)
        .post('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validDocumentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.documentType).toBe(validDocumentData.documentType);
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.userId).toBe(testUser.id);
    });

    it('should update user KYC status to PENDING after first document', async () => {
      await request(app)
        .post('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validDocumentData)
        .expect(201);

      const updatedUser = await testDb.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser?.kycStatus).toBe('PENDING');
    });

    it('should accept all document types', async () => {
      const types = ['ID_CARD', 'PASSPORT', 'DRIVERS_LICENSE', 'SELFIE', 'PROOF_OF_ADDRESS'];

      for (const type of types) {
        const response = await request(app)
          .post('/api/v1/kyc/documents')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...validDocumentData,
            documentType: type,
          })
          .expect(201);

        expect(response.body.data.documentType).toBe(type);
      }
    });

    it('should reject duplicate document type', async () => {
      // Submit first document
      await request(app)
        .post('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validDocumentData)
        .expect(201);

      // Try to submit same type again
      const response = await request(app)
        .post('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validDocumentData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already submitted');
    });

    it('should reject invalid document type', async () => {
      const response = await request(app)
        .post('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validDocumentData,
          documentType: 'INVALID_TYPE',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject expired document', async () => {
      const response = await request(app)
        .post('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validDocumentData,
          expiryDate: '2020-01-01', // Expired
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('expired');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentType: 'ID_CARD',
          // Missing other required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/v1/kyc/documents')
        .send(validDocumentData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // GET KYC DOCUMENTS
  // ==========================================================================

  describe('GET /api/v1/kyc/documents', () => {
    beforeEach(async () => {
      // Create multiple documents
      await KYCFactory.createKYCDocument({
        userId: testUser.id,
        documentType: 'ID_CARD',
        status: 'PENDING',
      });
      await KYCFactory.createApprovedKYC({
        userId: testUser.id,
        documentType: 'SELFIE',
      });
      await KYCFactory.createRejectedKYC({
        userId: testUser.id,
        documentType: 'PROOF_OF_ADDRESS',
      });
    });

    it('should list all user KYC documents', async () => {
      const response = await request(app)
        .get('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toHaveLength(3);
    });

    it('should filter documents by status', async () => {
      const response = await request(app)
        .get('/api/v1/kyc/documents?status=APPROVED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.documents).toHaveLength(1);
      expect(response.body.data.documents[0].status).toBe('APPROVED');
    });

    it('should include document details', async () => {
      const response = await request(app)
        .get('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const doc = response.body.data.documents[0];
      expect(doc).toHaveProperty('documentType');
      expect(doc).toHaveProperty('status');
      expect(doc).toHaveProperty('createdAt');
    });

    it('should not expose other users documents', async () => {
      const otherUser = await UserFactory.createUser();
      await KYCFactory.createKYCDocument({
        userId: otherUser.id,
        documentType: 'PASSPORT',
      });

      const response = await request(app)
        .get('/api/v1/kyc/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.documents).toHaveLength(3); // Still only 3 from beforeEach
    });
  });

  // ==========================================================================
  // GET SINGLE KYC DOCUMENT
  // ==========================================================================

  describe('GET /api/v1/kyc/documents/:id', () => {
    let document: any;

    beforeEach(async () => {
      document = await KYCFactory.createKYCDocument({
        userId: testUser.id,
        documentType: 'ID_CARD',
      });
    });

    it('should get document details', async () => {
      const response = await request(app)
        .get(`/api/v1/kyc/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(document.id);
      expect(response.body.data).toHaveProperty('frontImageUrl');
      expect(response.body.data).toHaveProperty('backImageUrl');
    });

    it('should reject access to other user document', async () => {
      const otherUser = await UserFactory.createUser();
      const otherDoc = await KYCFactory.createKYCDocument({
        userId: otherUser.id,
        documentType: 'PASSPORT',
      });

      const response = await request(app)
        .get(`/api/v1/kyc/documents/${otherDoc.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/v1/kyc/documents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // UPDATE KYC DOCUMENT
  // ==========================================================================

  describe('PUT /api/v1/kyc/documents/:id', () => {
    let document: any;

    beforeEach(async () => {
      document = await KYCFactory.createKYCDocument({
        userId: testUser.id,
        documentType: 'ID_CARD',
        status: 'PENDING',
      });
    });

    it('should update document details', async () => {
      const newDocumentNumber = 'CI987654321';

      const response = await request(app)
        .put(`/api/v1/kyc/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentNumber: newDocumentNumber,
          expiryDate: '2030-12-31',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.documentNumber).toBe(newDocumentNumber);
    });

    it('should not allow updating approved documents', async () => {
      await testDb.kYCDocument.update({
        where: { id: document.id },
        data: { status: 'APPROVED' },
      });

      const response = await request(app)
        .put(`/api/v1/kyc/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentNumber: 'NEW123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('cannot update approved');
    });

    it('should allow resubmitting rejected documents', async () => {
      await testDb.kYCDocument.update({
        where: { id: document.id },
        data: { status: 'REJECTED' },
      });

      const response = await request(app)
        .put(`/api/v1/kyc/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          frontImageUrl: 'https://storage.example.com/new-front.jpg',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PENDING'); // Status reset to pending
    });
  });

  // ==========================================================================
  // DELETE KYC DOCUMENT
  // ==========================================================================

  describe('DELETE /api/v1/kyc/documents/:id', () => {
    let document: any;

    beforeEach(async () => {
      document = await KYCFactory.createKYCDocument({
        userId: testUser.id,
        documentType: 'ID_CARD',
        status: 'PENDING',
      });
    });

    it('should delete pending document', async () => {
      const response = await request(app)
        .delete(`/api/v1/kyc/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deletedDoc = await testDb.kYCDocument.findUnique({
        where: { id: document.id },
      });
      expect(deletedDoc).toBeNull();
    });

    it('should not allow deleting approved documents', async () => {
      await testDb.kYCDocument.update({
        where: { id: document.id },
        data: { status: 'APPROVED' },
      });

      const response = await request(app)
        .delete(`/api/v1/kyc/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('cannot delete approved');
    });

    it('should allow deleting rejected documents', async () => {
      await testDb.kYCDocument.update({
        where: { id: document.id },
        data: { status: 'REJECTED' },
      });

      const response = await request(app)
        .delete(`/api/v1/kyc/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ==========================================================================
  // KYC STATUS
  // ==========================================================================

  describe('GET /api/v1/kyc/status', () => {
    it('should return KYC status for new user', async () => {
      const response = await request(app)
        .get('/api/v1/kyc/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.kycStatus).toBe('NOT_STARTED');
      expect(response.body.data.completionPercentage).toBe(0);
      expect(response.body.data.requiredDocuments).toHaveLength(4); // ID, License, Selfie, Address
    });

    it('should calculate completion percentage correctly', async () => {
      // Submit 2 out of 4 required documents
      await KYCFactory.createApprovedKYC({
        userId: testUser.id,
        documentType: 'ID_CARD',
      });
      await KYCFactory.createApprovedKYC({
        userId: testUser.id,
        documentType: 'SELFIE',
      });

      const response = await request(app)
        .get('/api/v1/kyc/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.completionPercentage).toBe(50); // 2/4 = 50%
    });

    it('should mark as VERIFIED when all documents approved', async () => {
      await KYCFactory.createCompleteKYCSet(testUser.id, 'APPROVED');

      // Update user status
      await testDb.user.update({
        where: { id: testUser.id },
        data: { kycStatus: 'VERIFIED' },
      });

      const response = await request(app)
        .get('/api/v1/kyc/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.kycStatus).toBe('VERIFIED');
      expect(response.body.data.completionPercentage).toBe(100);
    });

    it('should list pending documents', async () => {
      await KYCFactory.createKYCDocument({
        userId: testUser.id,
        documentType: 'ID_CARD',
        status: 'PENDING',
      });

      const response = await request(app)
        .get('/api/v1/kyc/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.pendingDocuments).toHaveLength(1);
      expect(response.body.data.pendingDocuments[0]).toBe('ID_CARD');
    });

    it('should list rejected documents with reasons', async () => {
      await KYCFactory.createRejectedKYC({
        userId: testUser.id,
        documentType: 'PROOF_OF_ADDRESS',
        rejectionReason: 'Document is unclear',
      });

      const response = await request(app)
        .get('/api/v1/kyc/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.rejectedDocuments).toHaveLength(1);
      expect(response.body.data.rejectedDocuments[0].documentType).toBe('PROOF_OF_ADDRESS');
      expect(response.body.data.rejectedDocuments[0].reason).toBe('Document is unclear');
    });
  });
});
