import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { gamificationService } from './gamification.service';

export class GamificationController {
  getBadgeDefinitions = asyncHandler(async (_req: Request, res: Response) => {
    const badges = await gamificationService.getBadgeDefinitions();
    sendSuccess(res, badges);
  });

  getDriverBadges = asyncHandler(async (req: Request, res: Response) => {
    const driverId = req.params.driverId || req.user!.id;
    const badges = await gamificationService.getDriverBadges(driverId);
    sendSuccess(res, badges);
  });

  awardBadge = asyncHandler(async (req: Request, res: Response) => {
    const { userId, badgeId, metadata } = req.body;
    const awarded = await gamificationService.awardBadge(userId, badgeId, metadata);
    sendCreated(res, awarded, 'Badge attribué');
  });

  getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, period } = req.query as unknown as { page: number; limit: number; period: string };
    const { leaderboard, total } = await gamificationService.getLeaderboard({ page, limit, period });
    sendPaginated(res, leaderboard, page, limit, total);
  });

  getDriverRanking = asyncHandler(async (req: Request, res: Response) => {
    const driverId = req.params.driverId || req.user!.id;
    const ranking = await gamificationService.getDriverRanking(driverId);
    sendSuccess(res, ranking);
  });

  getMyBadges = asyncHandler(async (req: Request, res: Response) => {
    const badges = await gamificationService.getDriverBadges(req.user!.id);
    sendSuccess(res, badges);
  });

  getMyRanking = asyncHandler(async (req: Request, res: Response) => {
    const ranking = await gamificationService.getDriverRanking(req.user!.id);
    sendSuccess(res, ranking);
  });
}

export const gamificationController = new GamificationController();
