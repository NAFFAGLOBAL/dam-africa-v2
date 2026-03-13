import { Router } from 'express';
import { accidentsController } from './accidents.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import {
  reportAccidentSchema,
  listAccidentReportsQuerySchema,
  reportIdParamSchema,
  addMediaSchema,
  addNoteSchema,
  updateStatusSchema,
} from './accidents.schemas';

const router = Router();

// User routes
router.post('/', authenticateUser, validateBody(reportAccidentSchema), accidentsController.reportAccident);
router.get('/my-reports', authenticateUser, accidentsController.getUserAccidentReports);

// Admin routes
router.get('/', authenticateAdmin, validateQuery(listAccidentReportsQuerySchema), accidentsController.listAccidentReports);
router.get('/:id', authenticateAdmin, validateParams(reportIdParamSchema), accidentsController.getAccidentReport);
router.post('/:id/media', authenticateAdmin, validateParams(reportIdParamSchema), validateBody(addMediaSchema), accidentsController.addAccidentMedia);
router.post('/:id/notes', authenticateAdmin, validateParams(reportIdParamSchema), validateBody(addNoteSchema), accidentsController.addAccidentNote);
router.patch('/:id/status', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'), validateParams(reportIdParamSchema), validateBody(updateStatusSchema), accidentsController.updateAccidentStatus);

export default router;
