import { Router } from 'express';
import { vehiclesController } from './vehicles.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import {
  createVehicleSchema,
  updateVehicleSchema,
  listVehiclesQuerySchema,
  vehicleIdParamSchema,
  addMaintenanceSchema,
} from './vehicles.schemas';

const router = Router();

// User routes
router.get('/favorites', authenticateUser, vehiclesController.getUserFavorites);
router.post('/:id/favorite', authenticateUser, validateParams(vehicleIdParamSchema), vehiclesController.toggleFavorite);

// Admin + user shared
router.get('/', authenticateAdmin, validateQuery(listVehiclesQuerySchema), vehiclesController.listVehicles);
router.get('/:id', authenticateAdmin, validateParams(vehicleIdParamSchema), vehiclesController.getVehicle);
router.post('/', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateBody(createVehicleSchema), vehiclesController.createVehicle);
router.patch('/:id', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(vehicleIdParamSchema), validateBody(updateVehicleSchema), vehiclesController.updateVehicle);
router.post('/:id/retire', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(vehicleIdParamSchema), vehiclesController.retireVehicle);
router.get('/:id/maintenance', authenticateAdmin, validateParams(vehicleIdParamSchema), vehiclesController.getMaintenanceHistory);
router.post('/:id/maintenance', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(vehicleIdParamSchema), validateBody(addMaintenanceSchema), vehiclesController.addMaintenance);

export default router;
