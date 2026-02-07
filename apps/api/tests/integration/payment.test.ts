/**
 * Payment Management Integration Tests - DAM Africa V2
 * Tests for payment processing and loan repayment
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { UserFactory, LoanFactory, PaymentFactory, resetAllFactories } from '../factories';
import { testDb } from '../setup';

const app = createApp();

describe('Payment Management API', () => {
  let authToken: string;
  let testUser: any;
  let activeLoan: any;

  beforeEach(async () => {
    resetAllFactories();

    testUser = await UserFactory.createVerifiedUser({
      creditScore: 700,
      creditRating: 'B',
    });

    activeLoan = await LoanFactory.createActiveLoan({
      userId: testUser.id,
      amount: 500000,
      termWeeks: 12,
    });

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
  // PAYMENT INITIATION
  // ==========================================================================

  describe('POST /api/v1/payments', () => {
    const validPayment = {
      loanId: '',
      amount: 50000,
      method: 'MOBILE_MONEY',
      phoneNumber: '+2250700000000',
    };

    beforeEach(() => {
      validPayment.loanId = activeLoan.id;
    });

    it('should initiate payment successfully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('transactionReference');
      expect(response.body.data.amount).toBe(validPayment.amount);
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.method).toBe(validPayment.method);
    });

    it('should generate unique transaction reference', async () => {
      const response1 = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayment)
        .expect(201);

      const response2 = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayment)
        .expect(201);

      expect(response1.body.data.transactionReference).not.toBe(
        response2.body.data.transactionReference
      );
    });

    it('should accept all payment methods', async () => {
      const methods = ['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'CARD'];

      for (const method of methods) {
        const response = await request(app)
          .post('/api/v1/payments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...validPayment,
            method,
          })
          .expect(201);

        expect(response.body.data.method).toBe(method);
      }
    });

    it('should reject payment for non-existent loan', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validPayment,
          loanId: 'non-existent-id',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment for other user loan', async () => {
      const otherUser = await UserFactory.createUser();
      const otherLoan = await LoanFactory.createActiveLoan({ userId: otherUser.id });

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validPayment,
          loanId: otherLoan.id,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment with invalid amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validPayment,
          amount: -1000, // Negative amount
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject payment exceeding remaining balance', async () => {
      await testDb.loan.update({
        where: { id: activeLoan.id },
        data: { remainingBalance: 10000 },
      });

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validPayment,
          amount: 50000, // More than remaining balance
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('exceeds remaining balance');
    });

    it('should reject payment for completed loan', async () => {
      await testDb.loan.update({
        where: { id: activeLoan.id },
        data: { status: 'COMPLETED', remainingBalance: 0 },
      });

      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already completed');
    });

    it('should require phone number for mobile money', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          loanId: activeLoan.id,
          amount: 50000,
          method: 'MOBILE_MONEY',
          // Missing phoneNumber
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // GET PAYMENTS
  // ==========================================================================

  describe('GET /api/v1/payments', () => {
    beforeEach(async () => {
      // Create multiple payments
      await PaymentFactory.createCompletedPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
      });
      await PaymentFactory.createPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
        status: 'PENDING',
      });
      await PaymentFactory.createFailedPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
      });
    });

    it('should list all user payments', async () => {
      const response = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments).toHaveLength(3);
    });

    it('should filter payments by status', async () => {
      const response = await request(app)
        .get('/api/v1/payments?status=COMPLETED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.payments).toHaveLength(1);
      expect(response.body.data.payments[0].status).toBe('COMPLETED');
    });

    it('should filter payments by loan', async () => {
      const response = await request(app)
        .get(`/api/v1/payments?loanId=${activeLoan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.payments.length).toBeGreaterThan(0);
      response.body.data.payments.forEach((payment: any) => {
        expect(payment.loanId).toBe(activeLoan.id);
      });
    });

    it('should paginate payment results', async () => {
      const response = await request(app)
        .get('/api/v1/payments?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.payments.length).toBeLessThanOrEqual(2);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should include payment details', async () => {
      const response = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const payment = response.body.data.payments[0];
      expect(payment).toHaveProperty('amount');
      expect(payment).toHaveProperty('method');
      expect(payment).toHaveProperty('status');
      expect(payment).toHaveProperty('transactionReference');
      expect(payment).toHaveProperty('createdAt');
    });

    it('should include related loan information', async () => {
      const response = await request(app)
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const payment = response.body.data.payments[0];
      expect(payment).toHaveProperty('loan');
      expect(payment.loan).toHaveProperty('amount');
      expect(payment.loan).toHaveProperty('status');
    });
  });

  // ==========================================================================
  // GET PAYMENT DETAILS
  // ==========================================================================

  describe('GET /api/v1/payments/:id', () => {
    let payment: any;

    beforeEach(async () => {
      payment = await PaymentFactory.createCompletedPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
      });
    });

    it('should get payment details', async () => {
      const response = await request(app)
        .get(`/api/v1/payments/${payment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(payment.id);
      expect(response.body.data).toHaveProperty('loan');
    });

    it('should reject access to other user payment', async () => {
      const otherUser = await UserFactory.createUser();
      const otherLoan = await LoanFactory.createActiveLoan({ userId: otherUser.id });
      const otherPayment = await PaymentFactory.createPayment({
        loanId: otherLoan.id,
        userId: otherUser.id,
      });

      const response = await request(app)
        .get(`/api/v1/payments/${otherPayment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/v1/payments/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // PAYMENT PROCESSING (Webhook simulation)
  // ==========================================================================

  describe('POST /api/v1/payments/:id/process', () => {
    let pendingPayment: any;

    beforeEach(async () => {
      pendingPayment = await PaymentFactory.createPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
        status: 'PENDING',
      });
    });

    it('should process successful payment', async () => {
      const response = await request(app)
        .post(`/api/v1/payments/${pendingPayment.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SUCCESS',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.processedAt).toBeDefined();
    });

    it('should reduce loan balance on successful payment', async () => {
      const initialBalance = activeLoan.remainingBalance;

      await request(app)
        .post(`/api/v1/payments/${pendingPayment.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SUCCESS',
        })
        .expect(200);

      const updatedLoan = await testDb.loan.findUnique({
        where: { id: activeLoan.id },
      });

      expect(updatedLoan?.remainingBalance).toBe(initialBalance - pendingPayment.amount);
    });

    it('should mark loan as completed when fully paid', async () => {
      // Set remaining balance to equal payment amount
      await testDb.loan.update({
        where: { id: activeLoan.id },
        data: { remainingBalance: pendingPayment.amount },
      });

      await request(app)
        .post(`/api/v1/payments/${pendingPayment.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SUCCESS',
        })
        .expect(200);

      const updatedLoan = await testDb.loan.findUnique({
        where: { id: activeLoan.id },
      });

      expect(updatedLoan?.status).toBe('COMPLETED');
      expect(updatedLoan?.remainingBalance).toBe(0);
    });

    it('should handle failed payment', async () => {
      const response = await request(app)
        .post(`/api/v1/payments/${pendingPayment.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'FAILED',
          failureReason: 'Insufficient funds',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('FAILED');
    });

    it('should not reduce balance on failed payment', async () => {
      const initialBalance = activeLoan.remainingBalance;

      await request(app)
        .post(`/api/v1/payments/${pendingPayment.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'FAILED',
        })
        .expect(200);

      const updatedLoan = await testDb.loan.findUnique({
        where: { id: activeLoan.id },
      });

      expect(updatedLoan?.remainingBalance).toBe(initialBalance);
    });

    it('should reject processing already completed payment', async () => {
      await testDb.payment.update({
        where: { id: pendingPayment.id },
        data: { status: 'COMPLETED' },
      });

      const response = await request(app)
        .post(`/api/v1/payments/${pendingPayment.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SUCCESS',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already processed');
    });
  });

  // ==========================================================================
  // PAYMENT STATISTICS
  // ==========================================================================

  describe('GET /api/v1/payments/stats', () => {
    beforeEach(async () => {
      // Create various payments
      await PaymentFactory.createCompletedPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
      });
      await PaymentFactory.createCompletedPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
      });
      await PaymentFactory.createFailedPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
      });
    });

    it('should return payment statistics', async () => {
      const response = await request(app)
        .get('/api/v1/payments/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPayments');
      expect(response.body.data).toHaveProperty('successfulPayments');
      expect(response.body.data).toHaveProperty('failedPayments');
      expect(response.body.data).toHaveProperty('totalAmountPaid');
    });

    it('should calculate totals correctly', async () => {
      const response = await request(app)
        .get('/api/v1/payments/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.totalPayments).toBe(3);
      expect(response.body.data.successfulPayments).toBe(2);
      expect(response.body.data.failedPayments).toBe(1);
      expect(response.body.data.totalAmountPaid).toBe(100000); // 2 × 50000
    });

    it('should filter stats by date range', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/payments/stats?startDate=${today}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPayments).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // PAYMENT REFUND
  // ==========================================================================

  describe('POST /api/v1/payments/:id/refund', () => {
    let completedPayment: any;

    beforeEach(async () => {
      completedPayment = await PaymentFactory.createCompletedPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        amount: 50000,
      });
    });

    it('should process refund for completed payment', async () => {
      const response = await request(app)
        .post(`/api/v1/payments/${completedPayment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Overpayment',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REFUNDED');
    });

    it('should restore loan balance on refund', async () => {
      const initialBalance = (await testDb.loan.findUnique({
        where: { id: activeLoan.id },
      }))?.remainingBalance || 0;

      await request(app)
        .post(`/api/v1/payments/${completedPayment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Overpayment',
        })
        .expect(200);

      const updatedLoan = await testDb.loan.findUnique({
        where: { id: activeLoan.id },
      });

      expect(updatedLoan?.remainingBalance).toBe(initialBalance + completedPayment.amount);
    });

    it('should require refund reason', async () => {
      const response = await request(app)
        .post(`/api/v1/payments/${completedPayment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject refund for pending payment', async () => {
      const pendingPayment = await PaymentFactory.createPayment({
        loanId: activeLoan.id,
        userId: testUser.id,
        status: 'PENDING',
      });

      const response = await request(app)
        .post(`/api/v1/payments/${pendingPayment.id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Test',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('cannot refund pending');
    });
  });
});
