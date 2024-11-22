import { inject, injectable, multiInject } from 'inversify';

import { TablesOwner } from '@/base/tablesOwner';

import { DATABASE, type IDatabase } from './database';
import { TABLES_OWNERS } from './constants';

export const DATABASE_TABLES_OWNER = Symbol('DatabaseTablesOwner');

@injectable()
export class DatabaseTablesOwner extends TablesOwner {
  public constructor(
    @inject(DATABASE) private readonly database: IDatabase,
    @multiInject(TABLES_OWNERS) private readonly tablesOwners: Iterable<TablesOwner>,
  ) {
    super();
  }

  public async create(): Promise<void> {
    const sql = this.database.connection;

    await sql`SET client_min_messages TO WARNING;`;
    await sql`CREATE SCHEMA IF NOT EXISTS posts;`;

    for (const tablesCreator of this.tablesOwners) {
      await tablesCreator.create();
    }
  }
}
