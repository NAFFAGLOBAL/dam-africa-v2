import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import { authService } from './auth.service';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Inscription réussie');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Connexion réussie');
  });

  adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.adminLogin(email, password);
    sendSuccess(res, result, 'Connexion administrateur réussie');
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendSuccess(res, result);
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    sendSuccess(res, null, 'Mot de passe modifié avec succès');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.id, req.body.refreshToken);
    sendNoContent(res);
  });
}

export const authController = new AuthController();
