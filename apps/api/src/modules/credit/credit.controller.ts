import { Request, Response } from 'express';
import { creditService } from './credit.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

export class CreditController {
  /**
   * Get current credit score
   * GET /api/v1/credit/score
   */
  getCreditScore = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await creditService.getCreditScore(userId);

    sendSuccess(res, result);
  });

  /**
   * Get credit score history
   * GET /api/v1/credit/history
   */
  getCreditHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    
    const history = await creditService.getCreditScoreHistory(userId, limit);

    sendSuccess(res, history);
  });

  /**
   * Recalculate credit score (Admin only)
   * POST /api/v1/credit/admin/:userId/recalculate
   */
  recalculateCreditScore = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { reason } = req.body;

    const result = await creditService.recalculateCreditScore(userId, reason);

    sendSuccess(res, result, 'Credit score recalculated successfully');
  });

  /**
   * Get credit score breakdown for specific user (Admin only)
   * GET /api/v1/credit/admin/:userId
   */
  getUserCreditScore = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await creditService.getCreditScore(userId);

    sendSuccess(res, result);
  });
}

export const creditController = new CreditController();
