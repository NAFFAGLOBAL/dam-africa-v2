import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { customersService } from './customers.service';

export class CustomersController {
  createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.createCustomer(req.body);
    sendCreated(res, customer, 'Client créé');
  });

  listCustomers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, isActive, search } = req.query as unknown as {
      page: number; limit: number; isActive?: boolean; search?: string;
    };
    const { customers, total } = await customersService.listCustomers({ page, limit, isActive, search });
    sendPaginated(res, customers, page, limit, total);
  });

  getCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.getCustomer(req.params.id);
    sendSuccess(res, customer);
  });

  updateCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.updateCustomer(req.params.id, req.body);
    sendSuccess(res, customer, 'Client mis à jour');
  });

  suspendCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.suspendCustomer(req.params.id);
    sendSuccess(res, customer, 'Client suspendu');
  });

  getCustomerStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await customersService.getCustomerStats(req.params.id);
    sendSuccess(res, stats);
  });
}

export const customersController = new CustomersController();
