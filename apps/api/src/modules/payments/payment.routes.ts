import { Router } from 'express';
import { paymentController } from './payment.controller';
import { validate } from '../../middleware/validate';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import {
  initiatePaymentSchema,
  manualPaymentSchema,
  listPaymentsQuerySchema,
  paymentIdParamSchema,
} from './payment.schemas';

const router = Router();

router.post('/', authenticateUser, validate(initiatePaymentSchema), paymentController.initiatePayment);
router.get('/my-payments', authenticateUser, paymentController.getMyPayments);
router.get('/:paymentId', authenticateUser, validate(paymentIdParamSchema), paymentController.getPaymentById);

router.get('/admin/list', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'), validate(listPaymentsQuerySchema), paymentController.listPayments);
router.post('/admin/manual', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'), validate(manualPaymentSchema), paymentController.createManualPayment);

export default router;
