import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimit } from './middleware/rateLimit';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import loansRoutes from './modules/loans/loans.routes';
import creditRoutes from './modules/credit/credit.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import rentalsRoutes from './modules/rentals/rentals.routes';
import contractsRoutes from './modules/contracts/contracts.routes';
import accidentsRoutes from './modules/accidents/accidents.routes';
import trackingRoutes from './modules/tracking/tracking.routes';
import incomeRoutes from './modules/income/income.routes';
import supportRoutes from './modules/support/support.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import gamificationRoutes from './modules/gamification/gamification.routes';
import adminRoutes from './modules/admin/admin.routes';
import customersRoutes from './modules/customers/customers.routes';
import settingsRoutes from './modules/settings/settings.routes';
import reportsRoutes from './modules/reports/reports.routes';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};
app.use(morgan('short', { stream: morganStream }));

// Rate limiting
app.use(globalRateLimit);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'damflotte-api', timestamp: new Date().toISOString() });
});

// API routes
const prefix = config.API_PREFIX;

app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/users`, usersRoutes);
app.use(`${prefix}/kyc`, kycRoutes);
app.use(`${prefix}/loans`, loansRoutes);
app.use(`${prefix}/credit`, creditRoutes);
app.use(`${prefix}/payments`, paymentsRoutes);
app.use(`${prefix}/vehicles`, vehiclesRoutes);
app.use(`${prefix}/rentals`, rentalsRoutes);
app.use(`${prefix}/contracts`, contractsRoutes);
app.use(`${prefix}/accidents`, accidentsRoutes);
app.use(`${prefix}/tracking`, trackingRoutes);
app.use(`${prefix}/income`, incomeRoutes);
app.use(`${prefix}/support`, supportRoutes);
app.use(`${prefix}/notifications`, notificationsRoutes);
app.use(`${prefix}/gamification`, gamificationRoutes);
app.use(`${prefix}/admin`, adminRoutes);
app.use(`${prefix}/customers`, customersRoutes);
app.use(`${prefix}/settings`, settingsRoutes);
app.use(`${prefix}/reports`, reportsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route introuvable' },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
