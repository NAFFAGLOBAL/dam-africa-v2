import { db } from '../../utils/database';
import { NotFoundError } from '../../utils/errors';
import { Prisma } from '@prisma/client';

export class SupportService {
  async createTicket(userId: string, data: {
    subject: string;
    description: string;
    priority?: string;
    category?: string;
  }) {
    return db.supportTicket.create({
      data: {
        userId,
        subject: data.subject,
        description: data.description,
        priority: (data.priority as any) || 'MEDIUM',
        category: data.category,
        status: 'OPEN',
      },
    });
  }

  async getTicket(id: string) {
    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!ticket) throw new NotFoundError('Ticket introuvable');
    return ticket;
  }

  async listTickets(params: {
    page: number;
    limit: number;
    status?: string;
    priority?: string;
    userId?: string;
    assigneeId?: string;
  }) {
    const where: Prisma.SupportTicketWhereInput = {};
    if (params.status) where.status = params.status as any;
    if (params.priority) where.priority = params.priority as any;
    if (params.userId) where.userId = params.userId;
    if (params.assigneeId) where.assigneeId = params.assigneeId;

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { messages: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.supportTicket.count({ where }),
    ]);

    return { tickets, total };
  }

  async addMessage(ticketId: string, senderId: string, senderType: string, content: string) {
    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('Ticket introuvable');

    return db.ticketMessage.create({
      data: { ticketId, senderId, senderType, content },
    });
  }

  async assignTicket(ticketId: string, assigneeId: string) {
    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('Ticket introuvable');

    const admin = await db.admin.findUnique({ where: { id: assigneeId } });
    if (!admin) throw new NotFoundError('Administrateur introuvable');

    return db.supportTicket.update({
      where: { id: ticketId },
      data: { assigneeId, status: 'IN_PROGRESS' },
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('Ticket introuvable');

    const data: Prisma.SupportTicketUpdateInput = {
      status: status as any,
    };
    if (status === 'RESOLVED') data.resolvedAt = new Date();
    if (status === 'CLOSED') data.closedAt = new Date();

    return db.supportTicket.update({ where: { id: ticketId }, data });
  }

  async getUserTickets(userId: string) {
    return db.supportTicket.findMany({
      where: { userId },
      include: { _count: { select: { messages: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const supportService = new SupportService();
