import { TablesOwner } from '@/base/tablesOwner';

import { getUniqueId } from '@/helpers';

import { DATABASE, type IDatabase } from './database';
import { TABLES_OWNERS, type IContainer } from '@/container';

export const DATABASE_TABLES_OWNER = getUniqueId();

export class DatabaseTablesOwner extends TablesOwner {
  private readonly database: IDatabase;
  private readonly tablesCreators: Iterable<TablesOwner>;

  public constructor(container: IContainer) {
    super();
    this.database = container[DATABASE] as IDatabase;
    this.tablesCreators = container[TABLES_OWNERS] as Iterable<TablesOwner>;
  }

  public async create(): Promise<void> {
    const sql = this.database.connection;

    await sql`SET client_min_messages TO WARNING;`;
    await sql`CREATE SCHEMA IF NOT EXISTS posts;`;

    for (const tablesCreator of this.tablesCreators) {
      await tablesCreator.create();
    }
  }

  public async clean(): Promise<void> {
    for (const tablesCreator of this.tablesCreators) {
      await tablesCreator.clean();
    }
  }
}
