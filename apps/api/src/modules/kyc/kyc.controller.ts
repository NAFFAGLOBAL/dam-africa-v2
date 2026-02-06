import { Request, Response } from 'express';
import { kycService } from './kyc.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import type {
  SubmitKYCDocumentInput,
  ReviewKYCDocumentInput,
  ListKYCDocumentsQuery,
} from './kyc.schemas';

export class KYCController {
  submitDocument = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = req.body as SubmitKYCDocumentInput;
    const document = await kycService.submitDocument(userId, data);
    sendCreated(res, document, 'Document submitted successfully');
  });

  getMyDocuments = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const documents = await kycService.getUserDocuments(userId);
    sendSuccess(res, documents);
  });

  getMyKYCStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const status = await kycService.getKYCStatus(userId);
    sendSuccess(res, status);
  });

  getDocumentById = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const document = await kycService.getDocumentById(documentId);
    sendSuccess(res, document);
  });

  resubmitDocument = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { documentId } = req.params;
    const data = req.body as SubmitKYCDocumentInput;
    const document = await kycService.resubmitDocument(userId, documentId, data);
    sendSuccess(res, document, 'Document resubmitted successfully');
  });

  listDocuments = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListKYCDocumentsQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const result = await kycService.listDocuments(
      page,
      limit,
      query.status,
      query.userId,
      query.documentType
    );
    sendPaginated(
      res,
      result.documents,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  });

  reviewDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const adminId = req.user!.id;
    const data = req.body as ReviewKYCDocumentInput;
    const document = await kycService.reviewDocument(documentId, adminId, data);
    sendSuccess(res, document, 'Document reviewed successfully');
  });
}

export const kycController = new KYCController();
