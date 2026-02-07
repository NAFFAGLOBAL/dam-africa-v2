/**
 * Loan Management Integration Tests - DAM Africa V2
 * Comprehensive tests for loan lifecycle
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { UserFactory, LoanFactory, VehicleFactory, KYCFactory, resetAllFactories } from '../factories';
import { testDb } from '../setup';

const app = createApp();

describe('Loan Management API', () => {
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    resetAllFactories();

    // Create verified user with good credit score
    testUser = await UserFactory.createVerifiedUser({
      creditScore: 700,
      creditRating: 'B',
    });

    // Set account age to 60 days (meets minimum requirement)
    await testDb.user.update({
      where: { id: testUser.id },
      data: { createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
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
  // LOAN ELIGIBILITY
  // ==========================================================================

  describe('GET /api/v1/loans/eligibility', () => {
    it('should return eligible for qualified user', async () => {
      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eligible).toBe(true);
      expect(response.body.data.reasons).toHaveLength(0);
      expect(response.body.data.maxLoanAmount).toBeGreaterThan(0);
      expect(response.body.data.interestRate).toBeGreaterThan(0);
    });

    it('should reject user without KYC verification', async () => {
      await testDb.user.update({
        where: { id: testUser.id },
        data: { kycStatus: 'NOT_STARTED' },
      });

      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.eligible).toBe(false);
      expect(response.body.data.reasons).toContain('KYC verification required');
    });

    it('should reject user with low credit score', async () => {
      await testDb.user.update({
        where: { id: testUser.id },
        data: { creditScore: 300, creditRating: 'E' },
      });

      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.eligible).toBe(false);
      expect(response.body.data.reasons).toContain('Credit score too low (minimum 350 required)');
    });

    it('should reject new user (account less than 30 days old)', async () => {
      await testDb.user.update({
        where: { id: testUser.id },
        data: { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // 10 days old
      });

      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.eligible).toBe(false);
      expect(response.body.data.reasons.some((r: string) => r.includes('30 days old'))).toBe(true);
    });

    it('should reject user with active loan', async () => {
      await LoanFactory.createActiveLoan({ userId: testUser.id });

      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.eligible).toBe(false);
      expect(response.body.data.reasons).toContain('Maximum active loans limit reached');
    });

    it('should reject user with defaulted loan', async () => {
      await LoanFactory.createLoan({
        userId: testUser.id,
        status: 'DEFAULTED',
      });

      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.eligible).toBe(false);
      expect(response.body.data.reasons).toContain('Cannot apply with defaulted loans');
    });

    it('should reject suspended user', async () => {
      await testDb.user.update({
        where: { id: testUser.id },
        data: { status: 'SUSPENDED' },
      });

      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.eligible).toBe(false);
      expect(response.body.data.reasons).toContain('Account is suspended or deleted');
    });

    it('should return max loan amount based on credit rating', async () => {
      // Rating B should have max loan amount of 1.5M
      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.creditRating).toBe('B');
      expect(response.body.data.maxLoanAmount).toBe(1500000); // 1.5M for rating B
    });

    it('should return interest rate based on credit rating', async () => {
      // Rating B should have 15% interest rate
      const response = await request(app)
        .get('/api/v1/loans/eligibility')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.creditRating).toBe('B');
      expect(response.body.data.interestRate).toBe(15);
    });
  });

  // ==========================================================================
  // LOAN APPLICATION
  // ==========================================================================

  describe('POST /api/v1/loans', () => {
    const validLoanApplication = {
      amount: 500000,
      termWeeks: 12,
      purpose: 'VEHICLE_PURCHASE',
      vehicleId: null as string | null,
    };

    it('should create loan application successfully', async () => {
      const response = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validLoanApplication)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.amount).toBe(validLoanApplication.amount);
      expect(response.body.data.termWeeks).toBe(validLoanApplication.termWeeks);
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data).toHaveProperty('weeklyPayment');
      expect(response.body.data).toHaveProperty('totalAmount');
    });

    it('should calculate weekly payment correctly', async () => {
      const response = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validLoanApplication)
        .expect(201);

      const { amount, termWeeks, weeklyPayment, totalAmount } = response.body.data;
      
      expect(weeklyPayment).toBeGreaterThan(amount / termWeeks); // Should be more due to interest
      expect(totalAmount).toBe(weeklyPayment * termWeeks);
    });

    it('should reject loan application exceeding max amount', async () => {
      // User has rating B (max 1.5M), try to apply for 2M
      const response = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validLoanApplication,
          amount: 2000000,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('exceeds maximum');
    });

    it('should reject loan with invalid term', async () => {
      const response = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validLoanApplication,
          termWeeks: 60, // Too long
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject loan with invalid amount', async () => {
      const response = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validLoanApplication,
          amount: 50000, // Too low (min should be 100K)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject loan for ineligible user', async () => {
      // Make user ineligible
      await testDb.user.update({
        where: { id: testUser.id },
        data: { kycStatus: 'NOT_STARTED' },
      });

      const response = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validLoanApplication)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not eligible');
    });

    it('should link vehicle if provided', async () => {
      const vehicle = await VehicleFactory.createVehicle();

      const response = await request(app)
        .post('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validLoanApplication,
          vehicleId: vehicle.id,
        })
        .expect(201);

      expect(response.body.data.vehicleId).toBe(vehicle.id);
    });
  });

  // ==========================================================================
  // LOAN LISTING
  // ==========================================================================

  describe('GET /api/v1/loans', () => {
    beforeEach(async () => {
      // Create multiple loans for testing
      await LoanFactory.createLoan({ userId: testUser.id, status: 'PENDING' });
      await LoanFactory.createActiveLoan({ userId: testUser.id });
      await LoanFactory.createCompletedLoan({ userId: testUser.id });
    });

    it('should list all user loans', async () => {
      const response = await request(app)
        .get('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.loans).toHaveLength(3);
    });

    it('should filter loans by status', async () => {
      const response = await request(app)
        .get('/api/v1/loans?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.loans).toHaveLength(1);
      expect(response.body.data.loans[0].status).toBe('ACTIVE');
    });

    it('should paginate loan results', async () => {
      const response = await request(app)
        .get('/api/v1/loans?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.loans.length).toBeLessThanOrEqual(2);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should include loan details', async () => {
      const response = await request(app)
        .get('/api/v1/loans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const loan = response.body.data.loans[0];
      expect(loan).toHaveProperty('amount');
      expect(loan).toHaveProperty('weeklyPayment');
      expect(loan).toHaveProperty('totalAmount');
      expect(loan).toHaveProperty('status');
      expect(loan).toHaveProperty('createdAt');
    });
  });

  // ==========================================================================
  // LOAN DETAILS
  // ==========================================================================

  describe('GET /api/v1/loans/:id', () => {
    let loan: any;

    beforeEach(async () => {
      loan = await LoanFactory.createActiveLoan({ userId: testUser.id });
    });

    it('should get loan details', async () => {
      const response = await request(app)
        .get(`/api/v1/loans/${loan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(loan.id);
      expect(response.body.data).toHaveProperty('paymentSchedule');
    });

    it('should include payment schedule', async () => {
      const response = await request(app)
        .get(`/api/v1/loans/${loan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const schedule = response.body.data.paymentSchedule;
      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBe(loan.termWeeks);
    });

    it('should reject access to other user loan', async () => {
      const otherUser = await UserFactory.createUser();
      const otherLoan = await LoanFactory.createLoan({ userId: otherUser.id });

      const response = await request(app)
        .get(`/api/v1/loans/${otherLoan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent loan', async () => {
      const response = await request(app)
        .get('/api/v1/loans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // LOAN APPROVAL (Admin only - mock for now)
  // ==========================================================================

  describe('POST /api/v1/loans/:id/approve', () => {
    let loan: any;

    beforeEach(async () => {
      loan = await LoanFactory.createLoan({ userId: testUser.id, status: 'PENDING' });
    });

    it('should approve loan (admin)', async () => {
      // Note: This would require admin authentication in real scenario
      const response = await request(app)
        .post(`/api/v1/loans/${loan.id}/approve`)
        .set('Authorization', `Bearer ${authToken}`) // Mock as admin
        .send({
          notes: 'Approved based on credit history',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should reject approval of already approved loan', async () => {
      await testDb.loan.update({
        where: { id: loan.id },
        data: { status: 'APPROVED' },
      });

      const response = await request(app)
        .post(`/api/v1/loans/${loan.id}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // LOAN REJECTION (Admin only - mock for now)
  // ==========================================================================

  describe('POST /api/v1/loans/:id/reject', () => {
    let loan: any;

    beforeEach(async () => {
      loan = await LoanFactory.createLoan({ userId: testUser.id, status: 'PENDING' });
    });

    it('should reject loan with reason', async () => {
      const response = await request(app)
        .post(`/api/v1/loans/${loan.id}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Insufficient credit history',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');
      expect(response.body.data.rejectionReason).toBe('Insufficient credit history');
    });

    it('should require rejection reason', async () => {
      const response = await request(app)
        .post(`/api/v1/loans/${loan.id}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // LOAN DISBURSEMENT
  // ==========================================================================

  describe('POST /api/v1/loans/:id/disburse', () => {
    let loan: any;

    beforeEach(async () => {
      loan = await LoanFactory.createApprovedLoan({ userId: testUser.id });
    });

    it('should disburse approved loan', async () => {
      const response = await request(app)
        .post(`/api/v1/loans/${loan.id}/disburse`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          disbursementMethod: 'MOBILE_MONEY',
          phoneNumber: testUser.phone,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ACTIVE');
      expect(response.body.data.disbursedAt).toBeDefined();
    });

    it('should reject disbursement of non-approved loan', async () => {
      await testDb.loan.update({
        where: { id: loan.id },
        data: { status: 'PENDING' },
      });

      const response = await request(app)
        .post(`/api/v1/loans/${loan.id}/disburse`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          disbursementMethod: 'MOBILE_MONEY',
          phoneNumber: testUser.phone,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create payment schedule on disbursement', async () => {
      await request(app)
        .post(`/api/v1/loans/${loan.id}/disburse`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          disbursementMethod: 'MOBILE_MONEY',
          phoneNumber: testUser.phone,
        })
        .expect(200);

      const schedules = await testDb.paymentSchedule.findMany({
        where: { loanId: loan.id },
      });

      expect(schedules.length).toBe(loan.termWeeks);
    });
  });
});
