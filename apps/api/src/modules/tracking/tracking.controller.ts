import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../utils/response';
import { trackingService } from './tracking.service';

export class TrackingController {
  getLivePositions = asyncHandler(async (_req: Request, res: Response) => {
    const positions = await trackingService.getLivePositions();
    sendSuccess(res, positions);
  });

  getVehiclePosition = asyncHandler(async (req: Request, res: Response) => {
    const data = await trackingService.getVehiclePosition(req.params.vehicleId);
    sendSuccess(res, data);
  });

  syncTelemetry = asyncHandler(async (req: Request, res: Response) => {
    const tracking = await trackingService.syncTelemetry(req.body);
    sendCreated(res, tracking, 'Télémétrie synchronisée');
  });

  getDrivingBehavior = asyncHandler(async (req: Request, res: Response) => {
    const behaviors = await trackingService.getDrivingBehavior(req.params.vehicleId);
    sendSuccess(res, behaviors);
  });

  listGeofenceZones = asyncHandler(async (_req: Request, res: Response) => {
    const zones = await trackingService.listGeofenceZones();
    sendSuccess(res, zones);
  });

  createGeofenceZone = asyncHandler(async (req: Request, res: Response) => {
    const zone = await trackingService.createGeofenceZone(req.body);
    sendCreated(res, zone, 'Zone créée');
  });

  updateGeofenceZone = asyncHandler(async (req: Request, res: Response) => {
    const zone = await trackingService.updateGeofenceZone(req.params.id, req.body);
    sendSuccess(res, zone, 'Zone mise à jour');
  });

  deleteGeofenceZone = asyncHandler(async (req: Request, res: Response) => {
    await trackingService.deleteGeofenceZone(req.params.id);
    sendNoContent(res);
  });

  getGeofenceAlerts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, vehicleId, zoneId, acknowledged } = req.query as {
      page: number; limit: number; vehicleId?: string; zoneId?: string; acknowledged?: boolean;
    };
    const { alerts, total } = await trackingService.getGeofenceAlerts({ page, limit, vehicleId, zoneId, acknowledged });
    sendPaginated(res, alerts, page, limit, total);
  });
}

export const trackingController = new TrackingController();
