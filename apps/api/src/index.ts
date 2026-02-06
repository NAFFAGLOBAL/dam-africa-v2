import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { disconnectDatabase } from './utils/database';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    const app = createApp();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📡 API URL: ${config.apiUrl}`);
      logger.info(`🌍 Environment: ${config.env}`);
      logger.info(`🔧 Mock Mode: ${config.integrations.mockMode ? 'ON' : 'OFF'}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      // Close server
      server.close(async () => {
        logger.info('HTTP server closed');

        // Disconnect from database
        await disconnectDatabase();

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
