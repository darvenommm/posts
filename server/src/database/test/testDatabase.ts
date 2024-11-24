import { inject } from 'inversify';
import { Pool, type PoolClient } from 'pg';

import { DATABASE_SETTINGS, type IDatabaseSettings } from '@/settings/database';

import type { UseConnectionCallback, IDatabase } from '../database';

export class TestDatabase implements IDatabase {
  private readonly pool: Pool;
  private connection: PoolClient | null;

  public constructor(@inject(DATABASE_SETTINGS) databaseSettings: IDatabaseSettings) {
    const { host, port, username: user, password, name: database } = databaseSettings;
    this.pool = new Pool({ host, port, user, password, database, max: 1 });
    this.connection = null;
  }

  public async getConnection(): Promise<PoolClient> {
    if (!this.connection) {
      this.connection = await this.pool.connect();

      await this.connection.query('BEGIN');
    }

    return this.connection;
  }

  public releaseConnection(): void {
    if (!this.connection) {
      return;
    }

    this.connection.query('ROLLBACK');
    this.connection.release();
    this.connection = null;
  }

  public async useConnection<T = void>(callback: UseConnectionCallback<T>): Promise<T> {
    const connection = await this.getConnection();

    return callback(connection);
  }
}
