import { asClass, asValue, createContainer } from 'awilix';

import { addBaseDependencies, CONTROLLERS, LOGGER, MIDDLEWARES, TABLES_OWNERS } from '@/container';

import { DATABASE_SETTINGS } from '@/settings/database';
import { TestDatabaseSettings } from '@/settings/testDatabase';
import { APPLICATION, type Application } from '@/app';
import { DATABASE_TABLES_OWNER } from '@/database';

import type { AwilixContainer } from 'awilix';
import type { Express } from 'express';
import type { TablesOwner } from '@/base/tablesOwner';
import { createLogger } from 'winston';

interface DataForTesting {
  readonly server: Express;
  readonly container: AwilixContainer;
  readonly tablesOwner: TablesOwner;
}

type RegisterCallback = (container: AwilixContainer) => void | Promise<void>;

export const startTesting = async (register: RegisterCallback): Promise<DataForTesting> => {
  const baseContainer = createContainer();
  addBaseDependencies(baseContainer);
  baseContainer.register({
    [CONTROLLERS]: asValue([]),
    [MIDDLEWARES]: asValue([]),
    [TABLES_OWNERS]: asValue([]),
  });

  const container = baseContainer.createScope();
  container.register({
    [DATABASE_SETTINGS]: asClass(TestDatabaseSettings).singleton(),
  });
  await register(container);

  const tablesOwner = container.resolve<TablesOwner>(DATABASE_TABLES_OWNER);
  await tablesOwner.create();

  return {
    container,
    tablesOwner,
    server: container.resolve<Application>(APPLICATION).express,
  };
};
