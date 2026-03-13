import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { ForbiddenError } from '../../utils/errors';
import { accidentsService } from './accidents.service';

export class AccidentsController {
  // Driver: report a new accident
  reportAccident = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.reportAccident(req.user!.id, req.body);
    sendCreated(res, report, 'Accident signalé avec succès');
  });

  // Driver: get own accident reports
  getUserAccidentReports = asyncHandler(async (req: Request, res: Response) => {
    const reports = await accidentsService.getUserAccidentReports(req.user!.id);
    sendSuccess(res, reports);
  });

  // Driver: get own accident count
  getUserAccidentCount = asyncHandler(async (req: Request, res: Response) => {
    const result = await accidentsService.getUserAccidentCount(req.user!.id);
    sendSuccess(res, result);
  });

  // Driver: get own accident report by ID (with ownership check)
  getUserAccidentReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.getAccidentReport(req.params.id);

    if (report.userId !== req.user!.id) {
      throw new ForbiddenError("Vous n'avez pas accès à ce rapport");
    }

    sendSuccess(res, report);
  });

  // Driver: add media to own report (with ownership check)
  addUserMedia = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.getAccidentReport(req.params.id);

    if (report.userId !== req.user!.id) {
      throw new ForbiddenError("Vous n'avez pas accès à ce rapport");
    }

    const media = await accidentsService.addMedia(req.params.id, req.body);
    sendCreated(res, media, 'Média ajouté avec succès');
  });

  // Admin: list all accident reports (paginated with filters)
  listAccidentReports = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, severity, driverFault, userId, vehicleId } =
      req.query as unknown as {
        page: number;
        limit: number;
        status?: string;
        severity?: string;
        driverFault?: string;
        userId?: string;
        vehicleId?: string;
      };
    const { reports, total } = await accidentsService.listAccidentReports({
      page,
      limit,
      status,
      severity,
      driverFault,
      userId,
      vehicleId,
    });
    sendPaginated(res, reports, page, limit, total);
  });

  // Admin: get risk zones analysis
  getRiskZones = asyncHandler(async (req: Request, res: Response) => {
    const { radiusKm, minIncidents } = req.query as unknown as {
      radiusKm: number;
      minIncidents: number;
    };
    const result = await accidentsService.getRiskZones({ radiusKm, minIncidents });
    sendSuccess(res, result);
  });

  // Admin: get a single accident report by ID
  getAccidentReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.getAccidentReport(req.params.id);
    sendSuccess(res, report);
  });

  // Admin: add media to a report
  addMedia = asyncHandler(async (req: Request, res: Response) => {
    const media = await accidentsService.addMedia(req.params.id, req.body);
    sendCreated(res, media, 'Média ajouté avec succès');
  });

  // Admin: add internal note to a report
  addNote = asyncHandler(async (req: Request, res: Response) => {
    const note = await accidentsService.addNote(req.params.id, req.user!.id, req.body.content);
    sendCreated(res, note, 'Note ajoutée avec succès');
  });

  // Admin: classify severity
  updateSeverity = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.updateSeverity(
      req.params.id,
      req.user!.id,
      req.body.severity,
    );
    sendSuccess(res, report, 'Gravité mise à jour avec succès');
  });

  // Admin: attach police report
  attachPoliceReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.attachPoliceReport(req.params.id, req.user!.id, req.body);
    sendSuccess(res, report, 'Rapport de police attaché avec succès');
  });

  // Admin: determine driver responsibility
  determineResponsibility = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.determineResponsibility(
      req.params.id,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, report, 'Responsabilité déterminée avec succès');
  });

  // Admin: update status
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.updateStatus(req.params.id, req.user!.id, req.body.status);
    sendSuccess(res, report, 'Statut mis à jour avec succès');
  });
}

export const accidentsController = new AccidentsController();
