/**
 * Authentication Integration Tests - DAM Africa V2
 * Comprehensive tests for all authentication endpoints
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { UserFactory, resetAllFactories } from '../factories';
import { testDb } from '../setup';

const app = createApp();

describe('Authentication API', () => {
  beforeEach(() => {
    resetAllFactories();
  });

  // ==========================================================================
  // USER REGISTRATION
  // ==========================================================================

  describe('POST /api/auth/register', () => {
    const validRegistration = {
      name: 'John Doe',
      email: UserFactory.uniqueEmail(),
      phone: UserFactory.uniquePhone(),
      password: 'SecurePassword123!',
      dateOfBirth: '1990-01-15',
      address: '123 Test Street',
      city: 'Abidjan',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistration)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      
      const { user } = response.body.data;
      expect(user.email).toBe(validRegistration.email);
      expect(user.name).toBe(validRegistration.name);
      expect(user.kycStatus).toBe('NOT_STARTED');
      expect(user.creditScore).toBe(500);
      expect(user.creditRating).toBe('C');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('should create initial credit score history entry', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistration)
        .expect(201);

      const userId = response.body.data.user.id;
      const history = await testDb.creditScoreHistory.findMany({
        where: { userId },
      });

      expect(history.length).toBe(1);
      expect(history[0].score).toBe(500);
      expect(history[0].rating).toBe('C');
      expect(history[0].changeReason).toBe('Initial registration');
    });

    it('should reject registration with duplicate email', async () => {
      const email = UserFactory.uniqueEmail();
      await UserFactory.createUser({ email });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validRegistration, email })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Email already registered');
    });

    it('should reject registration with duplicate phone', async () => {
      const phone = UserFactory.uniquePhone();
      await UserFactory.createUser({ phone });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validRegistration, phone })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Phone number already registered');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validRegistration, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validRegistration, password: '123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: validRegistration.email })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should hash password (not store plain text)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistration)
        .expect(201);

      const user = await testDb.user.findUnique({
        where: { id: response.body.data.user.id },
      });

      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(validRegistration.password);
      expect(user?.passwordHash?.length).toBeGreaterThan(50); // Bcrypt hash
    });

    it('should format phone number consistently', async () => {
      const phones = ['+225 07 12 34 56 78', '0712345678', '+2250712345678'];

      for (const phone of phones) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ ...validRegistration, email: UserFactory.uniqueEmail(), phone })
          .expect(201);

        expect(response.body.data.user.phone).toMatch(/^\+225/); // Normalized format
      }
    });
  });

  // ==========================================================================
  // USER LOGIN
  // ==========================================================================

  describe('POST /api/auth/login', () => {
    let testUser: any;
    const password = 'TestPassword123!';

    beforeEach(async () => {
      testUser = await UserFactory.createUser({ password });
    });

    it('should login with valid email and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should login with valid phone and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: testUser.phone,
          password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.phone).toBe(testUser.phone);
    });

    it('should update lastLogin timestamp', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password })
        .expect(200);

      const updatedUser = await testDb.user.findUnique({
        where: { id: testUser.id },
      });

      expect(updatedUser?.lastLogin).toBeDefined();
      expect(updatedUser?.lastLogin).toBeInstanceOf(Date);
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent phone', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '+2250700000000',
          password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject login for suspended user', async () => {
      await testDb.user.update({
        where: { id: testUser.id },
        data: { status: 'SUSPENDED' },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('suspended');
    });

    it('should reject login for deleted user', async () => {
      await testDb.user.update({
        where: { id: testUser.id },
        data: { status: 'DELETED' },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // TOKEN REFRESH
  // ==========================================================================

  describe('POST /api/auth/refresh', () => {
    let testUser: any;
    let refreshToken: string;

    beforeEach(async () => {
      testUser = await UserFactory.createUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      refreshToken = response.body.data.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.refreshToken).not.toBe(refreshToken); // New token
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject refresh with expired token', async () => {
      // This would require mocking time or using a pre-expired token
      // For now, just test with malformed token
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired.token.here' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // PASSWORD CHANGE
  // ==========================================================================

  describe('POST /api/auth/change-password', () => {
    let testUser: any;
    let accessToken: string;
    const oldPassword = 'OldPassword123!';
    const newPassword = 'NewPassword456!';

    beforeEach(async () => {
      testUser = await UserFactory.createUser({ password: oldPassword });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: oldPassword,
        });

      accessToken = response.body.data.accessToken;
    });

    it('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: oldPassword,
          newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should reject password change with wrong current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Current password is incorrect');
    });

    it('should reject password change without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: oldPassword,
          newPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: oldPassword,
          newPassword: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // GET CURRENT USER
  // ==========================================================================

  describe('GET /api/auth/me', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      testUser = await UserFactory.createVerifiedUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      accessToken = response.body.data.accessToken;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
