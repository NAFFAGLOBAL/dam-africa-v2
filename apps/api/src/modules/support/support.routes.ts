import { Router } from 'express';
import { supportController } from './support.controller';
import { authenticateUser, authenticateAdmin, authorizeAdmin } from '../../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../../middleware/validate';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  addMessageSchema,
  assignTicketSchema,
  updateTicketStatusSchema,
} from './support.schemas';

const router = Router();

// User routes
router.post('/', authenticateUser, validateBody(createTicketSchema), supportController.createTicket);
router.get('/my-tickets', authenticateUser, supportController.getUserTickets);
router.get('/:id', authenticateUser, validateParams(ticketIdParamSchema), supportController.getTicket);
router.post('/:id/messages', authenticateUser, validateParams(ticketIdParamSchema), validateBody(addMessageSchema), supportController.addMessage);

// Admin routes
router.get('/', authenticateAdmin, validateQuery(listTicketsQuerySchema), supportController.listTickets);
router.post('/:id/assign', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'), validateParams(ticketIdParamSchema), validateBody(assignTicketSchema), supportController.assignTicket);
router.patch('/:id/status', authenticateAdmin, authorizeAdmin('SUPER_ADMIN', 'ADMIN', 'SUPPORT'), validateParams(ticketIdParamSchema), validateBody(updateTicketStatusSchema), supportController.updateTicketStatus);

export default router;
