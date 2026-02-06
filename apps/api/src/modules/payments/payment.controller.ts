import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type { InitiatePaymentInput, ManualPaymentInput, ListPaymentsQuery } from './payment.schemas';

export class PaymentController {
  initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body as InitiatePaymentInput;
    const payment = await paymentService.initiatePayment(userId, data);
    sendCreated(res, payment, 'Payment initiated successfully');
  });

  getMyPayments = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const payments = await paymentService.getUserPayments(userId);
    sendSuccess(res, payments);
  });

  getPaymentById = asyncHandler(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const payment = await paymentService.getPaymentById(paymentId);
    sendSuccess(res, payment);
  });

  listPayments = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListPaymentsQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const result = await paymentService.listPayments(page, limit, query.status, query.userId, query.loanId, query.method);
    sendPaginated(res, result.payments, result.pagination.page, result.pagination.limit, result.pagination.total);
  });

  createManualPayment = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as ManualPaymentInput;
    const payment = await paymentService.createManualPayment(data);
    sendCreated(res, payment, 'Manual payment created successfully');
  });
}

export const paymentController = new PaymentController();
