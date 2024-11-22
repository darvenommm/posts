import { default as postgres } from 'postgres';
import { inject, injectable } from 'inversify';

import { DATABASE_SETTINGS } from '@/settings/database';

import type { Sql } from 'postgres';
import type { IDatabaseSettings } from '@/settings/database';

export interface IDatabase {
  readonly connection: Sql;
}

export const DATABASE = Symbol('Database');

@injectable()
export class Database implements IDatabase {
  private readonly _connection: Sql;

  public constructor(@inject(DATABASE_SETTINGS) databaseSettings: IDatabaseSettings) {
    const { host, port, username, password, name: database } = databaseSettings;
    this._connection = postgres({ host, port, username, password, database });
  }

  public get connection(): Sql {
    return this._connection;
  }
}
