import { createContainer } from 'awilix';

import { addBaseDependencies, addCompositeDependencies, LOGGER } from './container';
import { addPostsDependencies } from './domains/posts';
import { addAuthDependencies } from './domains/auth';
import { APPLICATION } from './app';

import type { Application } from './app';
import type { Logger } from 'winston';

const container = createContainer({ strict: true });
addBaseDependencies(container);
addAuthDependencies(container);
addPostsDependencies(container);
addCompositeDependencies(container);

const logger = container.resolve<Logger>(LOGGER);

try {
  await container.resolve<Application>(APPLICATION).start();
} catch (error) {
  logger.error(error);
} finally {
  await container.dispose();
}
