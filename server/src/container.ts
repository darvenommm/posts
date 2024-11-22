import { Container } from 'inversify';

import { settingsModule } from './settings';
import { databaseModule } from './database';
import { authModule } from './domains/auth';
import { postsModule } from './domains/posts';
import { logger, type ILogger } from './logger';

export const CONTROLLERS = Symbol('Controllers');
export const MIDDLEWARES = Symbol('Middlewares');
export const LOGGER = Symbol('Logger');

export const container = new Container({ defaultScope: 'Singleton' });
container.bind<ILogger>(LOGGER).toConstantValue(logger);

container.load(settingsModule, databaseModule, authModule, postsModule);
