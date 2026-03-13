import { Router } from 'express';
import { kycController } from './kyc.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import {
  submitDocumentSchema,
  reviewDocumentSchema,
  listDocumentsQuerySchema,
  documentIdParamSchema,
  userIdParamSchema,
} from './kyc.schemas';

const router = Router();

// User routes
router.post('/documents', authenticateUser, validateBody(submitDocumentSchema), kycController.submitDocument);
router.get('/my-status', authenticateUser, kycController.getMyKycStatus);

// Admin routes
router.get('/documents', authenticateAdmin, validateQuery(listDocumentsQuerySchema), kycController.listDocuments);
router.get('/documents/:id', authenticateAdmin, validateParams(documentIdParamSchema), kycController.getDocument);
router.post('/documents/:id/approve', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'), validateParams(documentIdParamSchema), validateBody(reviewDocumentSchema), kycController.approveDocument);
router.post('/documents/:id/reject', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER'), validateParams(documentIdParamSchema), validateBody(reviewDocumentSchema), kycController.rejectDocument);
router.get('/users/:userId/status', authenticateAdmin, validateParams(userIdParamSchema), kycController.getUserKycStatus);

export default router;
