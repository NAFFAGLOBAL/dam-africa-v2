import { Router } from 'express';
import { trackingController } from './tracking.controller';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import {
  vehicleIdParamSchema,
  createGeofenceSchema,
  updateGeofenceSchema,
  geofenceIdParamSchema,
  listGeofenceAlertsQuerySchema,
  syncTelemetrySchema,
} from './tracking.schemas';

const router = Router();

// All tracking routes require admin access
router.get('/live', authenticateAdmin, trackingController.getLivePositions);
router.get('/vehicles/:vehicleId', authenticateAdmin, validateParams(vehicleIdParamSchema), trackingController.getVehiclePosition);
router.post('/telemetry', authenticateAdmin, validateBody(syncTelemetrySchema), trackingController.syncTelemetry);
router.get('/vehicles/:vehicleId/behavior', authenticateAdmin, validateParams(vehicleIdParamSchema), trackingController.getDrivingBehavior);

// Geofencing
router.get('/geofences', authenticateAdmin, trackingController.listGeofenceZones);
router.post('/geofences', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateBody(createGeofenceSchema), trackingController.createGeofenceZone);
router.patch('/geofences/:id', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(geofenceIdParamSchema), validateBody(updateGeofenceSchema), trackingController.updateGeofenceZone);
router.delete('/geofences/:id', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateParams(geofenceIdParamSchema), trackingController.deleteGeofenceZone);
router.get('/geofences/alerts', authenticateAdmin, validateQuery(listGeofenceAlertsQuerySchema), trackingController.getGeofenceAlerts);

export default router;
