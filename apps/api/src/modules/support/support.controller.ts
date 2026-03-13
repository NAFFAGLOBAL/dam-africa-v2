import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { supportService } from './support.service';

export class SupportController {
  createTicket = asyncHandler(async (req: Request, res: Response) => {
    const ticket = await supportService.createTicket(req.user!.id, req.body);
    sendCreated(res, ticket, 'Ticket créé');
  });

  getTicket = asyncHandler(async (req: Request, res: Response) => {
    const ticket = await supportService.getTicket(req.params.id);
    sendSuccess(res, ticket);
  });

  listTickets = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, status, priority, userId, assigneeId } = req.query as {
      page: number; limit: number; status?: string; priority?: string; userId?: string; assigneeId?: string;
    };
    const { tickets, total } = await supportService.listTickets({ page, limit, status, priority, userId, assigneeId });
    sendPaginated(res, tickets, page, limit, total);
  });

  addMessage = asyncHandler(async (req: Request, res: Response) => {
    const senderType = req.user!.type;
    const message = await supportService.addMessage(req.params.id, req.user!.id, senderType, req.body.content);
    sendCreated(res, message, 'Message ajouté');
  });

  assignTicket = asyncHandler(async (req: Request, res: Response) => {
    const ticket = await supportService.assignTicket(req.params.id, req.body.assigneeId);
    sendSuccess(res, ticket, 'Ticket assigné');
  });

  updateTicketStatus = asyncHandler(async (req: Request, res: Response) => {
    const ticket = await supportService.updateTicketStatus(req.params.id, req.body.status);
    sendSuccess(res, ticket, 'Statut du ticket mis à jour');
  });

  getUserTickets = asyncHandler(async (req: Request, res: Response) => {
    const tickets = await supportService.getUserTickets(req.user!.id);
    sendSuccess(res, tickets);
  });
}

export const supportController = new SupportController();
