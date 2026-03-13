import { Router } from 'express';
import { rentalsController } from './rentals.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import { requestRentalSchema, listRentalsQuerySchema, rentalIdParamSchema, terminateRentalSchema } from './rentals.schemas';

const router = Router();

// User routes
router.post('/request', authenticateUser, validateBody(requestRentalSchema), rentalsController.requestRental);
router.get('/my-rentals', authenticateUser, rentalsController.getUserRentals);

// Admin routes
router.get('/', authenticateAdmin, validateQuery(listRentalsQuerySchema), rentalsController.listRentals);
router.get('/:id', authenticateAdmin, validateParams(rentalIdParamSchema), rentalsController.getRental);
router.post('/:id/approve', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(rentalIdParamSchema), rentalsController.approveRental);
router.post('/:id/complete', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(rentalIdParamSchema), rentalsController.completeRental);
router.post('/:id/terminate', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(rentalIdParamSchema), validateBody(terminateRentalSchema), rentalsController.terminateRental);

export default router;
