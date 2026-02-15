import { Request, Response } from 'express';
import { vehicleService } from './vehicle.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  AssignVehicleInput,
  ReturnVehicleInput,
  ListVehiclesQuery,
} from './vehicle.schemas';

export class VehicleController {
  listVehicles = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListVehiclesQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const result = await vehicleService.listVehicles(page, limit, query.status);
    sendPaginated(res, result.vehicles, result.pagination.page, result.pagination.limit, result.pagination.total);
  });

  getVehicleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id);
    sendSuccess(res, vehicle);
  });

  createVehicle = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body as CreateVehicleInput;
    const vehicle = await vehicleService.createVehicle(data);
    sendCreated(res, vehicle, 'Véhicule créé avec succès');
  });

  updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateVehicleInput;
    const vehicle = await vehicleService.updateVehicle(id, data);
    sendSuccess(res, vehicle, 'Véhicule mis à jour avec succès');
  });

  deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const vehicle = await vehicleService.deleteVehicle(id);
    sendSuccess(res, vehicle, 'Véhicule retiré avec succès');
  });

  assignVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as AssignVehicleInput;
    const rental = await vehicleService.assignVehicle(id, data.userId, data);
    sendCreated(res, rental, 'Véhicule assigné avec succès');
  });

  returnVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as ReturnVehicleInput;
    const rental = await vehicleService.returnVehicle(id, data.returnNotes);
    sendSuccess(res, rental, 'Véhicule retourné avec succès');
  });

  getVehicleRentals = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const rentals = await vehicleService.getVehicleRentals(id);
    sendSuccess(res, rentals);
  });

  getFleetStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await vehicleService.getFleetStats();
    sendSuccess(res, stats);
  });
}

export const vehicleController = new VehicleController();
