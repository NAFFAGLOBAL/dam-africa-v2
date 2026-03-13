import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendPaginated, sendNoContent } from '../../utils/response';
import { usersService } from './users.service';

export class UsersController {
  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, search, customerId } = req.query as {
      page: number; limit: number; status?: string; search?: string; customerId?: string;
    };
    const { users, total } = await usersService.listUsers({ page, limit, status, search, customerId });
    sendPaginated(res, users, page, limit, total);
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.getUserById(req.params.id);
    sendSuccess(res, user);
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.getUserById(req.user!.id);
    sendSuccess(res, user);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user, 'Profil mis à jour');
  });

  suspendUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.suspendUser(req.params.id);
    sendSuccess(res, user, 'Utilisateur suspendu');
  });

  activateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.activateUser(req.params.id);
    sendSuccess(res, user, 'Utilisateur activé');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await usersService.deleteUser(req.params.id);
    sendNoContent(res);
  });
}

export const usersController = new UsersController();
