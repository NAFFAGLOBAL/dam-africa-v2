import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { incomeService } from './income.service';

export class IncomeController {
  recordIncome = asyncHandler(async (req: Request, res: Response) => {
    const record = await incomeService.recordIncome(req.user!.id, req.body);
    sendCreated(res, record, 'Revenu enregistré');
  });

  getIncomeHistory = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, source, startDate, endDate, userId, isVerified } = req.query as {
      page: number; limit: number; source?: string; startDate?: string; endDate?: string; userId?: string; isVerified?: boolean;
    };
    const targetUserId = userId || req.user!.id;
    const { records, total } = await incomeService.getIncomeHistory({ page, limit, userId: targetUserId, source, startDate, endDate, isVerified });
    sendPaginated(res, records, page, limit, total);
  });

  verifyIncome = asyncHandler(async (req: Request, res: Response) => {
    const record = await incomeService.verifyIncome(req.params.id, req.user!.id);
    sendSuccess(res, record, 'Revenu vérifié');
  });

  getIncomeStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId || req.user!.id;
    const stats = await incomeService.getIncomeStats(userId);
    sendSuccess(res, stats);
  });

  bulkImportIncome = asyncHandler(async (req: Request, res: Response) => {
    const result = await incomeService.bulkImportIncome(req.body.records);
    sendSuccess(res, result, 'Import terminé');
  });
}

export const incomeController = new IncomeController();
