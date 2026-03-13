import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { accidentsService } from './accidents.service';

export class AccidentsController {
  reportAccident = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.reportAccident(req.user!.id, req.body);
    sendCreated(res, report, 'Accident signalé');
  });

  getAccidentReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.getAccidentReport(req.params.id);
    sendSuccess(res, report);
  });

  listAccidentReports = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, severity, userId, vehicleId } = req.query as unknown as {
      page: number; limit: number; status?: string; severity?: string; userId?: string; vehicleId?: string;
    };
    const { reports, total } = await accidentsService.listAccidentReports({ page, limit, status, severity, userId, vehicleId });
    sendPaginated(res, reports, page, limit, total);
  });

  addAccidentMedia = asyncHandler(async (req: Request, res: Response) => {
    const media = await accidentsService.addAccidentMedia(req.params.id, req.body);
    sendCreated(res, media, 'Média ajouté');
  });

  addAccidentNote = asyncHandler(async (req: Request, res: Response) => {
    const note = await accidentsService.addAccidentNote(req.params.id, req.user!.id, req.body.content);
    sendCreated(res, note, 'Note ajoutée');
  });

  updateAccidentStatus = asyncHandler(async (req: Request, res: Response) => {
    const report = await accidentsService.updateAccidentStatus(req.params.id, req.user!.id, req.body);
    sendSuccess(res, report, 'Statut mis à jour');
  });

  getUserAccidentReports = asyncHandler(async (req: Request, res: Response) => {
    const reports = await accidentsService.getUserAccidentReports(req.user!.id);
    sendSuccess(res, reports);
  });
}

export const accidentsController = new AccidentsController();
