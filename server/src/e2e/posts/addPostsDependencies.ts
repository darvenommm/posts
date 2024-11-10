import { asValue } from 'awilix';

import { CONTROLLERS, MIDDLEWARES, TABLES_OWNERS } from '@/container';
import {
  addAuthDependencies,
  AUTH_CONTROLLER,
  AUTH_MIDDLEWARE,
  AUTH_TABLES_OWNER,
} from '@/domains/auth';
import { addPostsDependencies, POSTS_CONTROLLER, POSTS_TABLES_OWNER } from '@/domains/posts';

import type { AwilixContainer } from 'awilix';

export const addPostsDependenciesForTesting = (container: AwilixContainer): void => {
  addAuthDependencies(container);
  addPostsDependencies(container);
  container.register({
    [CONTROLLERS]: asValue([
      container.resolve(AUTH_CONTROLLER),
      container.resolve(POSTS_CONTROLLER),
    ]),
    [TABLES_OWNERS]: asValue([
      container.resolve(AUTH_TABLES_OWNER),
      container.resolve(POSTS_TABLES_OWNER),
    ]),
    [MIDDLEWARES]: asValue([container.resolve(AUTH_MIDDLEWARE)]),
  });
};
