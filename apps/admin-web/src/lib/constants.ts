export const APP_NAME = 'DAMFlotte CLD';
export const APP_DESCRIPTION = 'Plateforme de gestion de flotte';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  LOAN_OFFICER: 'LOAN_OFFICER',
  FINANCE: 'FINANCE',
  SUPPORT: 'SUPPORT',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  LOAN_OFFICER: 'Agent de crédit',
  FINANCE: 'Finance',
  SUPPORT: 'Support',
};

export const KYC_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export const KYC_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  EXPIRED: 'Expiré',
};

export const LOAN_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DEFAULTED: 'DEFAULTED',
} as const;

export const LOAN_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  ACTIVE: 'Actif',
  COMPLETED: 'Terminé',
  DEFAULTED: 'En défaut',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  COMPLETED: 'Effectué',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
};

export const PAYMENT_METHODS = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  MTN_MOMO: 'MTN MoMo',
  CASH: 'Espèces',
  BANK_TRANSFER: 'Virement',
} as const;

export const DRIVER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export const DRIVER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  INACTIVE: 'Inactif',
  PENDING: 'En attente',
};

export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
} as const;

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  RENTED: 'Loué',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retiré',
};

export const CONTRACT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  TERMINATED: 'TERMINATED',
  PENDING: 'PENDING',
} as const;

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  COMPLETED: 'Terminé',
  TERMINATED: 'Résilié',
  PENDING: 'En attente',
};

export const INCIDENT_STATUS = {
  REPORTED: 'REPORTED',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  REPORTED: 'Signalé',
  INVESTIGATING: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Clôturé',
};

export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export const TICKET_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
};
