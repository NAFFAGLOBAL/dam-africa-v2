import { Router } from 'express';
import { kycController } from './kyc.controller';
import { validate } from '../../middleware/validate';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import {
  submitKYCDocumentSchema,
  reviewKYCDocumentSchema,
  listKYCDocumentsQuerySchema,
  documentIdParamSchema,
} from './kyc.schemas';

const router = Router();

router.post('/documents', authenticateUser, validate(submitKYCDocumentSchema), kycController.submitDocument);
router.get('/documents', authenticateUser, kycController.getMyDocuments);
router.get('/status', authenticateUser, kycController.getMyKYCStatus);
router.get('/documents/:documentId', authenticateUser, validate(documentIdParamSchema), kycController.getDocumentById);
router.put('/documents/:documentId/resubmit', authenticateUser, validate(documentIdParamSchema), validate(submitKYCDocumentSchema), kycController.resubmitDocument);

router.get('/admin/documents', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'), validate(listKYCDocumentsQuerySchema), kycController.listDocuments);
router.post('/admin/documents/:documentId/review', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN'), validate(documentIdParamSchema), validate(reviewKYCDocumentSchema), kycController.reviewDocument);

export default router;
