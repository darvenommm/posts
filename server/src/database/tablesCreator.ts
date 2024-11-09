import { TablesCreator } from '@/base/tableCreator';

import { getUniqueId } from '@/helpers';

import { DATABASE, type IDatabase } from './database';
import { TABLES_CREATORS, type IContainer } from '@/container';

export const DATABASE_TABLES_CREATOR = getUniqueId();

export class DatabaseTablesCreator extends TablesCreator {
  private readonly database: IDatabase;
  private readonly tablesCreators: Iterable<TablesCreator>;

  public constructor(container: IContainer) {
    super();
    this.database = container[DATABASE] as IDatabase;
    this.tablesCreators = container[TABLES_CREATORS] as Iterable<TablesCreator>;
  }

  public async create(): Promise<void> {
    const sql = this.database.connection;

    await sql`CREATE SCHEMA IF NOT EXISTS posts;`;

    for (const tablesCreator of this.tablesCreators) {
      await tablesCreator.create();
    }
  }
}
