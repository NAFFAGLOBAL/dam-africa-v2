import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { paymentsService } from './payments.service';

export class PaymentsController {
  createPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentsService.createPayment(req.user!.id, req.body);
    sendCreated(res, payment, 'Paiement créé');
  });

  getPaymentById = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentsService.getPaymentById(req.params.id);
    sendSuccess(res, payment);
  });

  listPayments = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, userId, loanId, method, startDate, endDate } = req.query as unknown as {
      page: number; limit: number; status?: string; userId?: string; loanId?: string; method?: string; startDate?: string; endDate?: string;
    };
    const { payments, total } = await paymentsService.listPayments({ page, limit, status, userId, loanId, method, startDate, endDate });
    sendPaginated(res, payments, page, limit, total);
  });

  processPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentsService.processPayment(req.params.id);
    sendSuccess(res, payment, 'Paiement traité');
  });

  getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
    const payments = await paymentsService.getPaymentHistory(req.user!.id);
    sendSuccess(res, payments);
  });

  reconcilePayments = asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentsService.reconcilePayments(req.user!.id, req.body.paymentIds);
    sendSuccess(res, result, 'Paiements réconciliés');
  });
}

export const paymentsController = new PaymentsController();
