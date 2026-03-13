import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { contractsService } from './contracts.service';

export class ContractsController {
  createContract = asyncHandler(async (req: Request, res: Response) => {
    const contract = await contractsService.createContract(req.body);
    sendCreated(res, contract, 'Contrat créé');
  });

  getContract = asyncHandler(async (req: Request, res: Response) => {
    const contract = await contractsService.getContract(req.params.id);
    sendSuccess(res, contract);
  });

  listContracts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, userId, type } = req.query as {
      page: number; limit: number; status?: string; userId?: string; type?: string;
    };
    const { contracts, total } = await contractsService.listContracts({ page, limit, status, userId, type });
    sendPaginated(res, contracts, page, limit, total);
  });

  getUserContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await contractsService.getUserContracts(req.user!.id);
    sendSuccess(res, contracts);
  });

  recordContractPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await contractsService.recordContractPayment(req.params.id, req.user!.id, req.body);
    sendCreated(res, payment, 'Paiement enregistré');
  });

  updateMilestone = asyncHandler(async (req: Request, res: Response) => {
    const milestone = await contractsService.updateMilestone(req.params.milestoneId, req.body);
    sendSuccess(res, milestone, 'Jalon mis à jour');
  });

  terminateContract = asyncHandler(async (req: Request, res: Response) => {
    const contract = await contractsService.terminateContract(req.params.id, req.body.reason);
    sendSuccess(res, contract, 'Contrat résilié');
  });

  getContractProgress = asyncHandler(async (req: Request, res: Response) => {
    const progress = await contractsService.getContractProgress(req.params.id);
    sendSuccess(res, progress);
  });
}

export const contractsController = new ContractsController();
