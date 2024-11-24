import { Container } from 'inversify';

import { LOGGER } from './constants';
import { settingsModule } from './settings';
import { databaseModule } from './database';
import { logger, type ILogger } from './logger';
import { APPLICATION, Application, type IApplication } from './app';

export const getContainer = (): Container => {
  const container = new Container({ defaultScope: 'Singleton' });
  container.load(settingsModule, databaseModule);
  container.bind<ILogger>(LOGGER).toConstantValue(logger);
  container.bind<IApplication>(APPLICATION).to(Application);

  return container;
};
