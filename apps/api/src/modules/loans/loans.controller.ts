import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { loansService } from './loans.service';

export class LoansController {
  checkEligibility = asyncHandler(async (req: Request, res: Response) => {
    const result = await loansService.checkEligibility(req.user!.id);
    sendSuccess(res, result);
  });

  applyForLoan = asyncHandler(async (req: Request, res: Response) => {
    const loan = await loansService.applyForLoan(req.user!.id, req.body);
    sendCreated(res, loan, 'Demande de prêt soumise');
  });

  getMyLoans = asyncHandler(async (req: Request, res: Response) => {
    const loans = await loansService.getMyLoans(req.user!.id);
    sendSuccess(res, loans);
  });

  getLoanById = asyncHandler(async (req: Request, res: Response) => {
    const loan = await loansService.getLoanById(req.params.id);
    sendSuccess(res, loan);
  });

  getLoanSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await loansService.getLoanSchedule(req.params.id);
    sendSuccess(res, schedule);
  });

  listLoans = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, userId, customerId } = req.query as unknown as {
      page: number; limit: number; status?: string; userId?: string; customerId?: string;
    };
    const { loans, total } = await loansService.listLoans({ page, limit, status, userId, customerId });
    sendPaginated(res, loans, page, limit, total);
  });

  approveLoan = asyncHandler(async (req: Request, res: Response) => {
    const loan = await loansService.approveLoan(req.params.id, req.user!.id);
    sendSuccess(res, loan, 'Prêt approuvé');
  });

  rejectLoan = asyncHandler(async (req: Request, res: Response) => {
    const loan = await loansService.rejectLoan(req.params.id, req.body.reason);
    sendSuccess(res, loan, 'Prêt rejeté');
  });

  disburseLoan = asyncHandler(async (req: Request, res: Response) => {
    const loan = await loansService.disburseLoan(req.params.id);
    sendSuccess(res, loan, 'Prêt décaissé');
  });
}

export const loansController = new LoansController();
