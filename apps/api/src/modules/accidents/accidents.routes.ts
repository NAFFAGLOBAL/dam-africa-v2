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
  updateSeveritySchema,
  attachPoliceReportSchema,
  determineResponsibilitySchema,
  updateStatusSchema,
  riskZonesQuerySchema,
} from './accidents.schemas';

const router = Router();

// ─── Driver routes ───────────────────────────────────────────────────────────

// Report a new accident
router.post(
  '/',
  authenticateUser,
  validateBody(reportAccidentSchema),
  accidentsController.reportAccident,
);

// Get driver's own accident reports
router.get('/my-reports', authenticateUser, accidentsController.getUserAccidentReports);

// Get driver's accident count
router.get('/my-count', authenticateUser, accidentsController.getUserAccidentCount);

// Get driver's own accident report by ID (ownership verified in controller)
router.get(
  '/my-reports/:id',
  authenticateUser,
  validateParams(reportIdParamSchema),
  accidentsController.getUserAccidentReport,
);

// Driver uploads media to their own report (ownership verified in controller)
router.post(
  '/my-reports/:id/media',
  authenticateUser,
  validateParams(reportIdParamSchema),
  validateBody(addMediaSchema),
  accidentsController.addUserMedia,
);

// ─── Admin routes ────────────────────────────────────────────────────────────

// List all accident reports (paginated with filters)
router.get(
  '/',
  authenticateAdmin,
  validateQuery(listAccidentReportsQuerySchema),
  accidentsController.listAccidentReports,
);

// Risk zone analysis
router.get(
  '/risk-zones',
  authenticateAdmin,
  validateQuery(riskZonesQuerySchema),
  accidentsController.getRiskZones,
);

// Get a single accident report
router.get(
  '/:id',
  authenticateAdmin,
  validateParams(reportIdParamSchema),
  accidentsController.getAccidentReport,
);

// Add media to a report
router.post(
  '/:id/media',
  authenticateAdmin,
  validateParams(reportIdParamSchema),
  validateBody(addMediaSchema),
  accidentsController.addMedia,
);

// Add internal note to a report
router.post(
  '/:id/notes',
  authenticateAdmin,
  validateParams(reportIdParamSchema),
  validateBody(addNoteSchema),
  accidentsController.addNote,
);

// Classify severity
router.patch(
  '/:id/severity',
  authenticateAdmin,
  validateParams(reportIdParamSchema),
  validateBody(updateSeveritySchema),
  accidentsController.updateSeverity,
);

// Attach police report
router.patch(
  '/:id/police-report',
  authenticateAdmin,
  validateParams(reportIdParamSchema),
  validateBody(attachPoliceReportSchema),
  accidentsController.attachPoliceReport,
);

// Determine driver responsibility (restricted roles)
router.patch(
  '/:id/responsibility',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'),
  validateParams(reportIdParamSchema),
  validateBody(determineResponsibilitySchema),
  accidentsController.determineResponsibility,
);

// Update status (restricted roles)
router.patch(
  '/:id/status',
  authenticateAdmin,
  authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'FLEET_MANAGER'),
  validateParams(reportIdParamSchema),
  validateBody(updateStatusSchema),
  accidentsController.updateStatus,
);

export default router;
