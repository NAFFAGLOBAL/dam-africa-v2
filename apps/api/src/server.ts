import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './utils/database';

const PORT = config.PORT;

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Connexion à la base de données établie');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`DAMFlotte CLD API démarré sur le port ${PORT}`);
      logger.info(`Environnement: ${config.NODE_ENV}`);
      logger.info(`Préfixe API: ${config.API_PREFIX}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Signal ${signal} reçu. Arrêt en cours...`);

      server.close(async () => {
        logger.info('Serveur HTTP fermé');
        await disconnectDatabase();
        logger.info('Connexion à la base de données fermée');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Arrêt forcé après timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled rejection:', { message: reason?.message, stack: reason?.stack });
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception:', { message: error.message, stack: error.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Échec du démarrage du serveur:', { error: (error as Error).message });
    process.exit(1);
  }
}

startServer();
