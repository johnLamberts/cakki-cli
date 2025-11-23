import 'reflect-metadata';
import { createApp } from './app';
import { config } from '@shared/config';
import { Logger } from '@shared/utils/logger';

const logger = new Logger('Server');

const app = createApp();

if (config.nodeEnv !== 'test') {
  app.listen(config.port, () => {
    logger.success(`Server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`API: http://localhost:${config.port}/api`);
  });
}

export { app };
