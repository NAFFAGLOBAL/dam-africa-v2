import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { creditService } from './credit.service';

export class CreditController {
  calculateScore = asyncHandler(async (req: Request, res: Response) => {
    const score = await creditService.calculateScore(req.params.userId);
    sendSuccess(res, score);
  });

  getScoreHistory = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query as { page?: number; limit?: number };
    const userId = req.params.userId || req.user!.id;
    const { records, total } = await creditService.getScoreHistory(userId, Number(page), Number(limit));
    sendPaginated(res, records, Number(page), Number(limit), total);
  });

  getScoreBreakdown = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId || req.user!.id;
    const breakdown = await creditService.getScoreBreakdown(userId);
    sendSuccess(res, breakdown);
  });

  recalculateScore = asyncHandler(async (req: Request, res: Response) => {
    const score = await creditService.recalculateScore(req.params.userId);
    sendSuccess(res, score, 'Score recalculé');
  });

  getMaxLoanAmount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId || req.user!.id;
    const result = await creditService.getMaxLoanAmount(userId);
    sendSuccess(res, result);
  });

  getInterestRate = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId || req.user!.id;
    const result = await creditService.getInterestRate(userId);
    sendSuccess(res, result);
  });

  getMyScore = asyncHandler(async (req: Request, res: Response) => {
    const breakdown = await creditService.getScoreBreakdown(req.user!.id);
    sendSuccess(res, breakdown);
  });
}

export const creditController = new CreditController();
