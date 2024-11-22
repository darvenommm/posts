import { ContainerModule } from 'inversify';

import { Database, DATABASE, type IDatabase } from './database';
import { DATABASE_TABLES_OWNER, DatabaseTablesOwner } from './tablesOwner';

import type { TablesOwner } from '@/base/tablesOwner';

export const databaseModule = new ContainerModule((bind): void => {
  bind<IDatabase>(DATABASE).to(Database);
  bind<TablesOwner>(DATABASE_TABLES_OWNER).to(DatabaseTablesOwner);
});
