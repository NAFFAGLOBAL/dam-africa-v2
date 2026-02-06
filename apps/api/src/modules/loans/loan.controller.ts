import { Request, Response } from 'express';
import { loanService } from './loan.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type {
  ApplyForLoanInput,
  ApproveLoanInput,
  RejectLoanInput,
  ListLoansQuery,
} from './loan.schemas';

export class LoanController {
  /**
   * Check loan eligibility
   * GET /api/v1/loans/eligibility
   */
  checkEligibility = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await loanService.checkEligibility(userId);

    sendSuccess(res, result);
  });

  /**
   * Apply for a loan
   * POST /api/v1/loans/apply
   */
  applyForLoan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body as ApplyForLoanInput;
    
    const result = await loanService.applyForLoan(userId, data);

    sendCreated(res, result, 'Loan application submitted successfully');
  });

  /**
   * Get user's loans
   * GET /api/v1/loans/my-loans
   */
  getMyLoans = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const loans = await loanService.getUserLoans(userId);

    sendSuccess(res, loans);
  });

  /**
   * Get loan by ID
   * GET /api/v1/loans/:loanId
   */
  getLoanById = asyncHandler(async (req: Request, res: Response) => {
    const { loanId } = req.params;
    const loan = await loanService.getLoanById(loanId, true);

    // Check if user owns this loan or is admin
    if (req.user!.type === 'user' && loan.userId !== req.user!.id) {
      throw new Error('Forbidden');
    }

    sendSuccess(res, loan);
  });

  /**
   * Get loan payment schedule
   * GET /api/v1/loans/:loanId/schedule
   */
  getLoanSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { loanId } = req.params;
    const schedule = await loanService.getLoanSchedule(loanId);

    sendSuccess(res, schedule);
  });

  /**
   * List all loans (Admin)
   * GET /api/v1/loans/admin/list
   */
  listLoans = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListLoansQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    const result = await loanService.listLoans(page, limit, query.status, query.userId);

    sendPaginated(
      res,
      result.loans,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  });

  /**
   * Approve loan (Admin)
   * POST /api/v1/loans/admin/:loanId/approve
   */
  approveLoan = asyncHandler(async (req: Request, res: Response) => {
    const { loanId } = req.params;
    const adminId = req.user!.id;
    const data = req.body as ApproveLoanInput;

    const loan = await loanService.approveLoan(loanId, adminId, data);

    sendSuccess(res, loan, 'Loan approved successfully');
  });

  /**
   * Reject loan (Admin)
   * POST /api/v1/loans/admin/:loanId/reject
   */
  rejectLoan = asyncHandler(async (req: Request, res: Response) => {
    const { loanId } = req.params;
    const data = req.body as RejectLoanInput;

    const loan = await loanService.rejectLoan(loanId, data);

    sendSuccess(res, loan, 'Loan rejected');
  });

  /**
   * Disburse loan (Admin)
   * POST /api/v1/loans/admin/:loanId/disburse
   */
  disburseLoan = asyncHandler(async (req: Request, res: Response) => {
    const { loanId } = req.params;
    const loan = await loanService.disburseLoan(loanId);

    sendSuccess(res, loan, 'Loan disbursed successfully');
  });
}

export const loanController = new LoanController();
