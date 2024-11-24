import { APPLICATION, type IApplication } from '@/app';
import { getContainer } from '@/container';
import { DATABASE, TestDatabase, type IDatabase } from '@/database';
import { DATABASE_SETTINGS, type IDatabaseSettings } from '@/settings/database';
import { TestDatabaseSettings } from '@/settings/testDatabase';
import { TestApplication } from './testApp';

import type { Container } from 'inversify';

export const getTestContainer = (): Container => {
  const container = getContainer();
  container.rebind<IDatabaseSettings>(DATABASE_SETTINGS).to(TestDatabaseSettings);
  container.rebind<IApplication>(APPLICATION).to(TestApplication);

  return container;
};

export const addTestDatabase = (container: Container): Container => {
  container.rebind<IDatabase>(DATABASE).to(TestDatabase);

  return container;
};
