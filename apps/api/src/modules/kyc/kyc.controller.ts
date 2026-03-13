import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { kycService } from './kyc.service';

export class KycController {
  submitDocument = asyncHandler(async (req: Request, res: Response) => {
    const doc = await kycService.submitDocument(req.user!.id, req.body);
    sendCreated(res, doc, 'Document soumis avec succès');
  });

  listDocuments = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, userId, type } = req.query as unknown as {
      page: number; limit: number; status?: string; userId?: string; type?: string;
    };
    const { documents, total } = await kycService.listDocuments({ page, limit, status, userId, type });
    sendPaginated(res, documents, page, limit, total);
  });

  getDocument = asyncHandler(async (req: Request, res: Response) => {
    const doc = await kycService.getDocument(req.params.id);
    sendSuccess(res, doc);
  });

  approveDocument = asyncHandler(async (req: Request, res: Response) => {
    const doc = await kycService.approveDocument(req.params.id, req.user!.id, req.body.reviewNote);
    sendSuccess(res, doc, 'Document approuvé');
  });

  rejectDocument = asyncHandler(async (req: Request, res: Response) => {
    const doc = await kycService.rejectDocument(req.params.id, req.user!.id, req.body.reviewNote);
    sendSuccess(res, doc, 'Document rejeté');
  });

  getUserKycStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await kycService.getUserKycStatus(req.params.userId);
    sendSuccess(res, status);
  });

  getMyKycStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await kycService.getUserKycStatus(req.user!.id);
    sendSuccess(res, status);
  });
}

export const kycController = new KycController();
