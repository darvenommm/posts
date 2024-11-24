import { authModule } from '@/domains/auth';
import { DATABASE, DATABASE_TABLES_OWNER, type IDatabase } from '@/database';
import { APPLICATION, type IApplication } from '@/app';
import { addTestDatabase, getTestContainer } from '../settings';

import type { TablesOwner } from '@/base/tablesOwner';
import type { Dependencies } from '../types';

export const getAuthDependencies = async (): Promise<Dependencies> => {
  const container = getTestContainer();
  container.load(authModule);

  await container.get<TablesOwner>(DATABASE_TABLES_OWNER).create();
  addTestDatabase(container);

  return {
    container,
    server: container.get<IApplication>(APPLICATION).server,
    database: container.get<IDatabase>(DATABASE),
  };
};
