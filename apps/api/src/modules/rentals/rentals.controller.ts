import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { rentalsService } from './rentals.service';

export class RentalsController {
  requestRental = asyncHandler(async (req: Request, res: Response) => {
    const rental = await rentalsService.requestRental(req.user!.id, req.body);
    sendCreated(res, rental, 'Demande de location soumise');
  });

  listRentals = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, userId, vehicleId } = req.query as unknown as {
      page: number; limit: number; status?: string; userId?: string; vehicleId?: string;
    };
    const { rentals, total } = await rentalsService.listRentals({ page, limit, status, userId, vehicleId });
    sendPaginated(res, rentals, page, limit, total);
  });

  getRental = asyncHandler(async (req: Request, res: Response) => {
    const rental = await rentalsService.getRental(req.params.id);
    sendSuccess(res, rental);
  });

  approveRental = asyncHandler(async (req: Request, res: Response) => {
    const rental = await rentalsService.approveRental(req.params.id, req.user!.id);
    sendSuccess(res, rental, 'Location approuvée');
  });

  completeRental = asyncHandler(async (req: Request, res: Response) => {
    const rental = await rentalsService.completeRental(req.params.id);
    sendSuccess(res, rental, 'Location complétée');
  });

  terminateRental = asyncHandler(async (req: Request, res: Response) => {
    const rental = await rentalsService.terminateRental(req.params.id, req.user!.id, req.body.reason);
    sendSuccess(res, rental, 'Location résiliée');
  });

  getUserRentals = asyncHandler(async (req: Request, res: Response) => {
    const rentals = await rentalsService.getUserRentals(req.user!.id);
    sendSuccess(res, rentals);
  });
}

export const rentalsController = new RentalsController();
