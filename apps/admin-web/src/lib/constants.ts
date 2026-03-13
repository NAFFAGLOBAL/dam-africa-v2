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
  LOAN_OFFICER: 'Agent de cr\u00e9dit',
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
  APPROVED: 'Approuv\u00e9',
  REJECTED: 'Rejet\u00e9',
  EXPIRED: 'Expir\u00e9',
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
  APPROVED: 'Approuv\u00e9',
  REJECTED: 'Rejet\u00e9',
  ACTIVE: 'Actif',
  COMPLETED: 'Termin\u00e9',
  DEFAULTED: 'En d\u00e9faut',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  COMPLETED: 'Effectu\u00e9',
  FAILED: '\u00c9chou\u00e9',
  REFUNDED: 'Rembours\u00e9',
};

export const PAYMENT_METHODS = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  MTN_MOMO: 'MTN MoMo',
  CASH: 'Esp\u00e8ces',
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
  RENTED: 'Lou\u00e9',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retir\u00e9',
};

export const CONTRACT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  TERMINATED: 'TERMINATED',
  PENDING: 'PENDING',
} as const;

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  COMPLETED: 'Termin\u00e9',
  TERMINATED: 'R\u00e9sili\u00e9',
  PENDING: 'En attente',
};

export const INCIDENT_STATUS = {
  REPORTED: 'REPORTED',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  REPORTED: 'Signal\u00e9',
  INVESTIGATING: 'En cours',
  RESOLVED: 'R\u00e9solu',
  CLOSED: 'Cl\u00f4tur\u00e9',
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
  RESOLVED: 'R\u00e9solu',
  CLOSED: 'Ferm\u00e9',
};
