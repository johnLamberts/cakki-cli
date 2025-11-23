import express, { Application } from 'express';
import cors from 'cors';
import { config } from '@shared/config';
import { errorHandler } from '@shared/utils/error-handler';
import { Logger } from '@shared/utils/logger';
import { UserRoutes } from '@modules/user';
import { HealthRoutes } from '@modules/health';

const logger = new Logger('App');

export const createApp = (): Application => {
  const app = express();

  // Middlewares
  app.use(cors(config.cors));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging in development
  if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`);
      next();
    });
  }

  // Register module routes
  const userRoutes = new UserRoutes();
  const healthRoutes = new HealthRoutes();

  app.use('/api/health', healthRoutes.router);
  app.use('/api/users', userRoutes.router);

  // Error handling
  app.use(errorHandler);

  return app;
};
