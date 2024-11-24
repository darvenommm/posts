import { authModule } from '@/domains/auth';
import { postsModule } from '@/domains/posts';
import { DATABASE, DATABASE_TABLES_OWNER, type IDatabase } from '@/database';
import { APPLICATION, type IApplication } from '@/app';
import { addTestDatabase, getTestContainer } from '../settings';

import type { TablesOwner } from '@/base/tablesOwner';
import type { Dependencies } from '../types';

export const getPostsDependencies = async (): Promise<Dependencies> => {
  const container = getTestContainer();
  container.load(authModule, postsModule);

  await container.get<TablesOwner>(DATABASE_TABLES_OWNER).create();
  addTestDatabase(container);

  return {
    container,
    server: container.get<IApplication>(APPLICATION).server,
    database: container.get<IDatabase>(DATABASE),
  };
};
