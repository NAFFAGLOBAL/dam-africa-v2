import { z } from 'zod';

/**
 * Register schema
 */
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .regex(/^\+225\d{10}$/, 'Phone must be in format +225XXXXXXXXXX'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number'),
    dateOfBirth: z.string().datetime().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
});

/**
 * Login schema (email or phone)
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  }).refine(
    (data) => data.email || data.phone,
    {
      message: 'Either email or phone is required',
      path: ['email'],
    }
  ),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

/**
 * Verify OTP schema
 */
export const verifyOTPSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+225\d{10}$/, 'Invalid phone format'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

/**
 * Request OTP schema
 */
export const requestOTPSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+225\d{10}$/, 'Invalid phone format'),
  }),
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number'),
  }),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/\d/, 'Password must contain at least one number'),
  }),
});

/**
 * Admin login schema
 */
export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>['body'];
export type RequestOTPInput = z.infer<typeof requestOTPSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type AdminLoginInput = z.infer<typeof adminLoginSchema>['body'];
