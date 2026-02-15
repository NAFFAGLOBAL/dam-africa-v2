import { Request, Response } from 'express';
import { reportService } from './report.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

export class ReportController {
  getFinancialSummary = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const summary = await reportService.getFinancialSummary(start, end);
    sendSuccess(res, summary);
  });

  getLoanAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const analytics = await reportService.getLoanAnalytics(start, end);
    sendSuccess(res, analytics);
  });

  getDriverAnalytics = asyncHandler(async (_req: Request, res: Response) => {
    const analytics = await reportService.getDriverAnalytics();
    sendSuccess(res, analytics);
  });

  getPaymentAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const analytics = await reportService.getPaymentAnalytics(start, end);
    sendSuccess(res, analytics);
  });

  getRevenueByPeriod = asyncHandler(async (req: Request, res: Response) => {
    const { period, startDate, endDate } = req.query;
    const validPeriod = (period as string) || 'monthly';
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const revenue = await reportService.getRevenueByPeriod(
      validPeriod as 'daily' | 'weekly' | 'monthly',
      start,
      end
    );
    sendSuccess(res, revenue);
  });

  getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await reportService.getDashboardStats();
    sendSuccess(res, stats);
  });
}

export const reportController = new ReportController();
