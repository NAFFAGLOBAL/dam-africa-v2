import { db } from '../../utils/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Prisma } from '@prisma/client';
import { v4 as uuid } from 'uuid';

export class ContractsService {
  async createContract(data: {
    userId: string;
    vehicleId: string;
    type?: string;
    totalValue: number;
    monthlyPayment: number;
    downPayment?: number;
    totalInstallments: number;
    ownershipThreshold?: number;
    startDate?: string;
    endDate?: string;
    terms?: string;
    notes?: string;
  }) {
    const user = await db.user.findUnique({ where: { id: data.userId }, select: { customerId: true } });
    if (!user) throw new NotFoundError('Utilisateur introuvable');

    const vehicle = await db.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError('Véhicule introuvable');

    return db.contract.create({
      data: {
        userId: data.userId,
        vehicleId: data.vehicleId,
        customerId: user.customerId,
        type: (data.type as Prisma.EnumContractTypeFilter['equals']) || 'RENT_TO_OWN',
        totalValue: data.totalValue,
        monthlyPayment: data.monthlyPayment,
        downPayment: data.downPayment ?? 0,
        totalInstallments: data.totalInstallments,
        ownershipThreshold: data.ownershipThreshold,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        terms: data.terms,
        notes: data.notes,
        status: 'DRAFT',
      },
    });
  }

  async getContract(id: string) {
    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vehicle: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        milestones: { orderBy: { percentage: 'asc' } },
      },
    });
    if (!contract) throw new NotFoundError('Contrat introuvable');
    return contract;
  }

  async listContracts(params: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    type?: string;
  }) {
    const where: Prisma.ContractWhereInput = {};
    if (params.status) where.status = params.status as Prisma.EnumContractStatusFilter['equals'];
    if (params.userId) where.userId = params.userId;
    if (params.type) where.type = params.type as Prisma.EnumContractTypeFilter['equals'];

    const [contracts, total] = await Promise.all([
      db.contract.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          vehicle: { select: { id: true, registrationNo: true, make: true, model: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.contract.count({ where }),
    ]);

    return { contracts, total };
  }

  async getUserContracts(userId: string) {
    return db.contract.findMany({
      where: { userId },
      include: {
        vehicle: { select: { id: true, registrationNo: true, make: true, model: true, imageUrl: true } },
        milestones: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recordContractPayment(contractId: string, userId: string, data: {
    amount: number;
    method: string;
    phone?: string;
  }) {
    const contract = await db.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundError('Contrat introuvable');
    if (contract.status !== 'ACTIVE') throw new BadRequestError('Le contrat n\'est pas actif');

    const reference = `CON-${Date.now()}-${uuid().substring(0, 8).toUpperCase()}`;

    const payment = await db.payment.create({
      data: {
        userId,
        contractId,
        amount: data.amount,
        currency: 'XOF',
        method: data.method as Prisma.EnumPaymentMethodFilter['equals'],
        reference,
        phone: data.phone,
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    const newPaidAmount = contract.paidAmount + data.amount;
    const newPaidInstallments = contract.paidInstallments + 1;

    await db.contract.update({
      where: { id: contractId },
      data: {
        paidAmount: newPaidAmount,
        paidInstallments: newPaidInstallments,
        ...(newPaidInstallments >= contract.totalInstallments
          ? { status: 'COMPLETED', completedAt: new Date() }
          : {}),
      },
    });

    return payment;
  }

  async updateMilestone(milestoneId: string, data: {
    title?: string;
    description?: string;
    targetDate?: string;
    isCompleted?: boolean;
  }) {
    const milestone = await db.contractMilestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundError('Jalon introuvable');

    return db.contractMilestone.update({
      where: { id: milestoneId },
      data: {
        title: data.title,
        description: data.description,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : undefined,
      },
    });
  }

  async terminateContract(id: string, reason: string) {
    const contract = await db.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundError('Contrat introuvable');
    if (!['DRAFT', 'ACTIVE'].includes(contract.status)) {
      throw new BadRequestError('Ce contrat ne peut pas être résilié');
    }

    return db.contract.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        terminatedAt: new Date(),
        terminationReason: reason,
      },
    });
  }

  async getContractProgress(id: string) {
    const contract = await db.contract.findUnique({
      where: { id },
      include: { milestones: { orderBy: { percentage: 'asc' } } },
    });
    if (!contract) throw new NotFoundError('Contrat introuvable');

    const percentage = contract.totalValue > 0
      ? Math.round((contract.paidAmount / contract.totalValue) * 100)
      : 0;

    return {
      contractId: contract.id,
      totalValue: contract.totalValue,
      paidAmount: contract.paidAmount,
      remainingAmount: contract.totalValue - contract.paidAmount,
      percentage,
      paidInstallments: contract.paidInstallments,
      totalInstallments: contract.totalInstallments,
      milestones: contract.milestones,
    };
  }
}

export const contractsService = new ContractsService();
