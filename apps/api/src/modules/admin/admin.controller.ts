import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { adminService } from './admin.service';

export class AdminController {
  getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats);
  });

  getAdminUsers = asyncHandler(async (_req: Request, res: Response) => {
    const admins = await adminService.getAdminUsers();
    sendSuccess(res, admins);
  });

  createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.createAdmin(req.body);
    sendCreated(res, admin, 'Administrateur créé');
  });

  updateAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.updateAdmin(req.params.id, req.body);
    sendSuccess(res, admin, 'Administrateur mis à jour');
  });

  getAuditLog = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, action, resource, adminId, startDate, endDate } = req.query as unknown as {
      page: number; limit: number; action?: string; resource?: string; adminId?: string; startDate?: string; endDate?: string;
    };
    const { logs, total } = await adminService.getAuditLog({ page, limit, action, resource, adminId, startDate, endDate });
    sendPaginated(res, logs, page, limit, total);
  });

  getAdminPreferences = asyncHandler(async (req: Request, res: Response) => {
    const preferences = await adminService.getAdminPreferences(req.user!.id);
    sendSuccess(res, preferences);
  });

  updateAdminPreferences = asyncHandler(async (req: Request, res: Response) => {
    const preferences = await adminService.updateAdminPreferences(req.user!.id, req.body.preferences);
    sendSuccess(res, preferences, 'Préférences mises à jour');
  });
}

export const adminController = new AdminController();
