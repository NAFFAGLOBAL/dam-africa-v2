import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { morganStream, logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import loanRoutes from './modules/loans/loan.routes';
import creditRoutes from './modules/credit/credit.routes';
import paymentRoutes from './modules/payments/payment.routes';
import vehicleRoutes from './modules/vehicles/vehicle.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import adminRoutes from './modules/admin/admin.routes';
import reportRoutes from './modules/reports/report.routes';
import settingsRoutes from './modules/settings/settings.routes';
import { waveWebhookController } from './integrations/wave/wave.webhook';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // =================================================================
  // SECURITY MIDDLEWARE
  // =================================================================
  
  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // =================================================================
  // REQUEST PARSING
  // =================================================================

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Response compression
  app.use(compression());

  // =================================================================
  // LOGGING
  // =================================================================

  // HTTP request logging
  if (config.isDevelopment) {
    app.use(morgan('dev', { stream: morganStream }));
  } else {
    app.use(morgan('combined', { stream: morganStream }));
  }

  // =================================================================
  // RATE LIMITING
  // =================================================================

  // Apply rate limiting to all routes
  app.use('/api', apiLimiter);

  // =================================================================
  // HEALTH CHECK
  // =================================================================

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      version: '1.0.0',
    });
  });

  // =================================================================
  // API ROUTES
  // =================================================================

  const API_PREFIX = '/api/v1';

  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/users`, userRoutes);
  app.use(`${API_PREFIX}/kyc`, kycRoutes);
  app.use(`${API_PREFIX}/loans`, loanRoutes);
  app.use(`${API_PREFIX}/credit`, creditRoutes);
  app.use(`${API_PREFIX}/payments`, paymentRoutes);
  app.use(`${API_PREFIX}/vehicles`, vehicleRoutes);
  app.use(`${API_PREFIX}/notifications`, notificationRoutes);
  app.use(`${API_PREFIX}/admin`, adminRoutes);
  app.use(`${API_PREFIX}/reports`, reportRoutes);
  app.use(`${API_PREFIX}/settings`, settingsRoutes);

  // Webhook endpoints
  app.post(`${API_PREFIX}/webhooks/wave`, waveWebhookController.handleWebhook);

  // =================================================================
  // ERROR HANDLING
  // =================================================================

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
