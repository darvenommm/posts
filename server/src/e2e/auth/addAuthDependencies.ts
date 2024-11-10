import { asValue } from 'awilix';

import { CONTROLLERS, MIDDLEWARES, TABLES_OWNERS } from '@/container';
import {
  addAuthDependencies,
  AUTH_CONTROLLER,
  AUTH_MIDDLEWARE,
  AUTH_TABLES_OWNER,
} from '@/domains/auth';

import type { AwilixContainer } from 'awilix';

export const addAuthDependenciesForTesting = (container: AwilixContainer): void => {
  addAuthDependencies(container);
  container.register({
    [CONTROLLERS]: asValue([container.resolve(AUTH_CONTROLLER)]),
    [MIDDLEWARES]: asValue([container.resolve(AUTH_MIDDLEWARE)]),
    [TABLES_OWNERS]: asValue([container.resolve(AUTH_TABLES_OWNER)]),
  });
};
