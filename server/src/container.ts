import { asClass, asValue } from 'awilix';

import { getUniqueId } from './helpers';
import { ADMIN_SETTINGS, AdminSettings } from './settings/admin';
import { DATABASE_SETTINGS, DatabaseSettings } from './settings/database';
import { EXTRA_SETTINGS, ExtraSettings } from './settings/extra';
import { SERVER_SETTINGS, ServerSettings } from './settings/server';
import { DATABASE, Database, DATABASE_TABLES_OWNER, DatabaseTablesOwner } from './database';

import { Application, APPLICATION } from './app';
import { AUTH_CONTROLLER, AUTH_MIDDLEWARE, AUTH_TABLES_OWNER } from './domains/auth';
import { POSTS_CONTROLLER, POSTS_TABLES_OWNER } from './domains/posts';
import { logger } from './logger';

import type { AwilixContainer } from 'awilix';

export interface IContainer {
  [key: string]: unknown;
}

export const MIDDLEWARES = getUniqueId();
export const CONTROLLERS = getUniqueId();
export const TABLES_OWNERS = getUniqueId();
export const LOGGER = getUniqueId();

export const addBaseDependencies = (container: AwilixContainer): void => {
  container.register({
    [ADMIN_SETTINGS]: asClass(AdminSettings).singleton(),
    [DATABASE_SETTINGS]: asClass(DatabaseSettings).singleton(),
    [EXTRA_SETTINGS]: asClass(ExtraSettings).singleton(),
    [SERVER_SETTINGS]: asClass(ServerSettings).singleton(),
    [DATABASE]: asClass(Database).singleton(),
    [DATABASE_TABLES_OWNER]: asClass(DatabaseTablesOwner).singleton(),
    [APPLICATION]: asClass(Application).singleton(),
    [LOGGER]: asValue(logger),
  });
};

export const addCompositeDependencies = (container: AwilixContainer): void => {
  container.register({
    [MIDDLEWARES]: asValue([container.resolve(AUTH_MIDDLEWARE)]),
    [CONTROLLERS]: asValue([
      container.resolve(AUTH_CONTROLLER),
      container.resolve(POSTS_CONTROLLER),
    ]),
    [TABLES_OWNERS]: asValue([
      container.resolve(AUTH_TABLES_OWNER),
      container.resolve(POSTS_TABLES_OWNER),
    ]),
  });
};
