import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { vehiclesService } from './vehicles.service';

export class VehiclesController {
  listVehicles = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, customerId, search } = req.query as unknown as {
      page: number; limit: number; status?: string; customerId?: string; search?: string;
    };
    const { vehicles, total } = await vehiclesService.listVehicles({ page, limit, status, customerId, search });
    sendPaginated(res, vehicles, page, limit, total);
  });

  getVehicle = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehiclesService.getVehicle(req.params.id);
    sendSuccess(res, vehicle);
  });

  createVehicle = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehiclesService.createVehicle(req.body);
    sendCreated(res, vehicle, 'Véhicule créé');
  });

  updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehiclesService.updateVehicle(req.params.id, req.body);
    sendSuccess(res, vehicle, 'Véhicule mis à jour');
  });

  retireVehicle = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehiclesService.retireVehicle(req.params.id);
    sendSuccess(res, vehicle, 'Véhicule retiré de la flotte');
  });

  getMaintenanceHistory = asyncHandler(async (req: Request, res: Response) => {
    const records = await vehiclesService.getMaintenanceHistory(req.params.id);
    sendSuccess(res, records);
  });

  addMaintenance = asyncHandler(async (req: Request, res: Response) => {
    const record = await vehiclesService.addMaintenance(req.params.id, req.body);
    sendCreated(res, record, 'Maintenance ajoutée');
  });

  toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
    const result = await vehiclesService.toggleFavorite(req.user!.id, req.params.id);
    sendSuccess(res, result);
  });

  getUserFavorites = asyncHandler(async (req: Request, res: Response) => {
    const vehicles = await vehiclesService.getUserFavorites(req.user!.id);
    sendSuccess(res, vehicles);
  });
}

export const vehiclesController = new VehiclesController();
