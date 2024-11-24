import '@abraham/reflection';

import { inject, injectable, multiInject, optional } from 'inversify';

import { TablesOwner } from '@/base/tablesOwner';

import { DATABASE, type IDatabase } from './database';
import { TABLES_OWNERS } from './constants';

export const DATABASE_TABLES_OWNER = Symbol('DatabaseTablesOwner');

@injectable()
export class DatabaseTablesOwner extends TablesOwner {
  public constructor(
    @inject(DATABASE) private readonly database: IDatabase,
    @multiInject(TABLES_OWNERS)
    @optional()
    private readonly tablesOwners: Iterable<TablesOwner> = [],
  ) {
    super();
  }

  public async create(): Promise<void> {
    await this.database.useConnection(async (connection) => {
      await connection.query('SET client_min_messages TO WARNING');
      await connection.query('CREATE SCHEMA IF NOT EXISTS posts');
    });

    for (const tablesOwner of this.tablesOwners) {
      await tablesOwner.create();
    }
  }
}
