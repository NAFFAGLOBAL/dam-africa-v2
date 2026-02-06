import { Request, Response } from 'express';
import { userService } from './user.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type { UpdateProfileInput, ListUsersQuery, SuspendUserInput } from './user.schemas';

export class UserController {
  /**
   * Get current user profile
   * GET /api/v1/users/me
   */
  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await userService.getUserById(userId);

    sendSuccess(res, user);
  });

  /**
   * Update current user profile
   * PUT /api/v1/users/me
   */
  updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body as UpdateProfileInput;
    
    const updatedUser = await userService.updateProfile(userId, data);

    sendSuccess(res, updatedUser, 'Profile updated successfully');
  });

  /**
   * Get user statistics
   * GET /api/v1/users/me/stats
   */
  getMyStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await userService.getUserStats(userId);

    sendSuccess(res, stats);
  });

  /**
   * List users (Admin)
   * GET /api/v1/users/admin/list
   */
  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListUsersQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    const result = await userService.listUsers(
      page,
      limit,
      query.search,
      query.kycStatus,
      query.status,
      query.creditRating
    );

    sendPaginated(
      res,
      result.users,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  });

  /**
   * Get user by ID (Admin)
   * GET /api/v1/users/admin/:userId
   */
  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);

    sendSuccess(res, user);
  });

  /**
   * Get user statistics (Admin)
   * GET /api/v1/users/admin/:userId/stats
   */
  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const stats = await userService.getUserStats(userId);

    sendSuccess(res, stats);
  });

  /**
   * Suspend user (Admin)
   * POST /api/v1/users/admin/:userId/suspend
   */
  suspendUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const data = req.body as SuspendUserInput;
    
    const user = await userService.suspendUser(userId, data);

    sendSuccess(res, user, 'User suspended successfully');
  });

  /**
   * Activate user (Admin)
   * POST /api/v1/users/admin/:userId/activate
   */
  activateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await userService.activateUser(userId);

    sendSuccess(res, user, 'User activated successfully');
  });

  /**
   * Delete user (Admin)
   * DELETE /api/v1/users/admin/:userId
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await userService.deleteUser(userId);

    sendSuccess(res, user, 'User deleted successfully');
  });
}

export const userController = new UserController();
