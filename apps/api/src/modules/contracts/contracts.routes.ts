import { Router } from 'express';
import { contractsController } from './contracts.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import {
  createContractSchema,
  listContractsQuerySchema,
  contractIdParamSchema,
  recordPaymentSchema,
  updateMilestoneSchema,
  terminateContractSchema,
} from './contracts.schemas';

const router = Router();

// User routes
router.get('/my-contracts', authenticateUser, contractsController.getUserContracts);
router.post('/:id/payments', authenticateUser, validateParams(contractIdParamSchema), validateBody(recordPaymentSchema), contractsController.recordContractPayment);
router.get('/:id/progress', authenticateUser, validateParams(contractIdParamSchema), contractsController.getContractProgress);

// Admin routes
router.post('/', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FINANCE'), validateBody(createContractSchema), contractsController.createContract);
router.get('/', authenticateAdmin, validateQuery(listContractsQuerySchema), contractsController.listContracts);
router.get('/:id', authenticateAdmin, validateParams(contractIdParamSchema), contractsController.getContract);
router.patch('/milestones/:milestoneId', authenticateAdmin, validateBody(updateMilestoneSchema), contractsController.updateMilestone);
router.post('/:id/terminate', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validateParams(contractIdParamSchema), validateBody(terminateContractSchema), contractsController.terminateContract);

export default router;
