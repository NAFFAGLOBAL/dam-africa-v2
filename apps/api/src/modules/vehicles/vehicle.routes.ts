import { Router } from 'express';
import { vehicleController } from './vehicle.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import {
  createVehicleSchema,
  updateVehicleSchema,
  assignVehicleSchema,
  returnVehicleSchema,
  vehicleIdParamSchema,
  listVehiclesQuerySchema,
} from './vehicle.schemas';

const router = Router();

// All vehicle routes require admin authentication
router.get(
  '/',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(listVehiclesQuerySchema),
  vehicleController.listVehicles
);

router.get(
  '/stats',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  vehicleController.getFleetStats
);

router.get(
  '/:id',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(vehicleIdParamSchema),
  vehicleController.getVehicleById
);

router.post(
  '/',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);

router.put(
  '/:id',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);

router.delete(
  '/:id',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN'),
  validate(vehicleIdParamSchema),
  vehicleController.deleteVehicle
);

router.post(
  '/:id/assign',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(assignVehicleSchema),
  vehicleController.assignVehicle
);

router.post(
  '/rentals/:id/return',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(returnVehicleSchema),
  vehicleController.returnVehicle
);

router.get(
  '/:id/rentals',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'),
  validate(vehicleIdParamSchema),
  vehicleController.getVehicleRentals
);

export default router;
