import '@abraham/reflection';

import { Pool } from 'pg';
import { inject, injectable } from 'inversify';

import { DATABASE_SETTINGS } from '@/settings/database';

import type { PoolClient } from 'pg';
import type { IDatabaseSettings } from '@/settings/database';

export type UseConnectionCallback<T> = (client: PoolClient) => Promise<T>;

export interface IDatabase {
  getConnection: () => Promise<PoolClient>;
  releaseConnection: (connection: PoolClient) => void;
  useConnection: <T = void>(callback: UseConnectionCallback<T>) => Promise<T>;
}

export const DATABASE = Symbol('Database');

@injectable()
export class Database implements IDatabase {
  private readonly pool: Pool;

  public constructor(@inject(DATABASE_SETTINGS) databaseSettings: IDatabaseSettings) {
    const { host, port, username: user, password, name: database } = databaseSettings;
    this.pool = new Pool({ host, port, user, password, database });
  }

  public async getConnection(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public releaseConnection(connection: PoolClient): void {
    connection.release();
  }

  public async useConnection<T = void>(callback: UseConnectionCallback<T>): Promise<T> {
    const connection = await this.getConnection();
    const result = await callback(connection);
    this.releaseConnection(connection);

    return result;
  }
}
