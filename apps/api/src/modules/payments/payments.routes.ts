import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import { createPaymentSchema, listPaymentsQuerySchema, paymentIdParamSchema } from './payments.schemas';

const router = Router();

// User routes
router.post('/', authenticateUser, validateBody(createPaymentSchema), paymentsController.createPayment);
router.get('/history', authenticateUser, paymentsController.getPaymentHistory);
router.get('/:id', authenticateUser, validateParams(paymentIdParamSchema), paymentsController.getPaymentById);

// Admin routes
router.get('/', authenticateAdmin, validateQuery(listPaymentsQuerySchema), paymentsController.listPayments);
router.post('/:id/process', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'FINANCE'), validateParams(paymentIdParamSchema), paymentsController.processPayment);
router.post('/reconcile', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'FINANCE'), paymentsController.reconcilePayments);

export default router;
