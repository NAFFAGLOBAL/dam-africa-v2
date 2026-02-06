import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type {
  RegisterInput,
  LoginInput,
  AdminLoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from './auth.schemas';

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as RegisterInput;
    const result = await authService.register(data);

    sendCreated(res, result, 'Registration successful');
  });

  /**
   * User login
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as LoginInput;
    const result = await authService.login(data);

    sendSuccess(res, result, 'Login successful');
  });

  /**
   * Admin login
   * POST /api/v1/auth/admin/login
   */
  adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as AdminLoginInput;
    const result = await authService.adminLogin(data);

    sendSuccess(res, result, 'Admin login successful');
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body as RefreshTokenInput;
    const tokens = await authService.refreshToken(refreshToken);

    sendSuccess(res, tokens, 'Token refreshed successfully');
  });

  /**
   * Logout (client-side token invalidation)
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    // In a stateless JWT setup, logout is handled client-side
    // Token is removed from client storage
    // If using Redis for token blacklisting, implement here

    sendSuccess(res, null, 'Logout successful');
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body as ChangePasswordInput;
    
    const result = await authService.changePassword(userId, data);

    sendSuccess(res, result, 'Password changed successfully');
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await authService.getCurrentUser(userId);

    sendSuccess(res, user);
  });

  /**
   * Get current admin profile
   * GET /api/v1/auth/admin/me
   */
  getCurrentAdmin = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.user!.id;
    const admin = await authService.getCurrentAdmin(adminId);

    sendSuccess(res, admin);
  });
}

export const authController = new AuthController();
