import { Router } from 'express';
import { customersController } from './customers.controller';
import { authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, listCustomersQuerySchema, customerIdParamSchema } from './customers.schemas';

const router = Router();

router.post('/', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateBody(createCustomerSchema), customersController.createCustomer);
router.get('/', authenticateAdmin, validateQuery(listCustomersQuerySchema), customersController.listCustomers);
router.get('/:id', authenticateAdmin, validateParams(customerIdParamSchema), customersController.getCustomer);
router.patch('/:id', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateParams(customerIdParamSchema), validateBody(updateCustomerSchema), customersController.updateCustomer);
router.post('/:id/suspend', authenticateAdmin, authorizeAdmin('SUPER_ADMIN'), validateParams(customerIdParamSchema), customersController.suspendCustomer);
router.get('/:id/stats', authenticateAdmin, validateParams(customerIdParamSchema), customersController.getCustomerStats);

export default router;
