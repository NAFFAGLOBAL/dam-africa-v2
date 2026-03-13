import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import { reportsService } from './reports.service';

export class ReportsController {
  getRevenueReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, customerId } = req.query as unknown as {
      startDate?: string; endDate?: string; customerId?: string;
    };
    const report = await reportsService.getRevenueReport({ startDate, endDate, customerId });
    sendSuccess(res, report);
  });

  getPaymentReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as unknown as { startDate?: string; endDate?: string };
    const report = await reportsService.getPaymentReport({ startDate, endDate });
    sendSuccess(res, report);
  });

  getDriverReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, customerId } = req.query as unknown as {
      startDate?: string; endDate?: string; customerId?: string;
    };
    const report = await reportsService.getDriverReport({ startDate, endDate, customerId });
    sendSuccess(res, report);
  });

  getFleetReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as unknown as { startDate?: string; endDate?: string };
    const report = await reportsService.getFleetReport({ startDate, endDate });
    sendSuccess(res, report);
  });

  getLoanReport = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query as unknown as { startDate?: string; endDate?: string };
    const report = await reportsService.getLoanReport({ startDate, endDate });
    sendSuccess(res, report);
  });

  exportReport = asyncHandler(async (req: Request, res: Response) => {
    const { type, startDate, endDate, format } = req.query as unknown as {
      type: string; startDate?: string; endDate?: string; format?: string;
    };
    const report = await reportsService.exportReport(type, { startDate, endDate });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      res.send(JSON.stringify(report)); // Simplified CSV export
      return;
    }

    sendSuccess(res, report);
  });
}

export const reportsController = new ReportsController();
