import '@abraham/reflection';

import { default as bcrypt } from 'bcrypt';
import { default as format } from 'pg-format';
import { v4 as createUUID } from 'uuid';
import { inject, injectable } from 'inversify';

import { TablesOwner } from '@/base/tablesOwner';
import { USERNAME_CONSTRAINTS } from './constraints';
import { Role } from './types';
import { DATABASE, type IDatabase } from '@/database';
import { ADMIN_SETTINGS, type IAdminSettings } from '@/settings/admin';
import { EXTRA_SETTINGS, type IExtraSettings } from '@/settings/extra';

import type { UserCreatingData } from './types';
import type { PoolClient } from 'pg';

@injectable()
export class AuthTablesOwner extends TablesOwner {
  private readonly MAX_ROLE_LENGTH = 32;
  private readonly MAX_EMAIL_LENGTH = 320;
  private readonly MAX_BCRYPT_LENGTH = 72;

  public constructor(
    @inject(DATABASE) private readonly database: IDatabase,
    @inject(ADMIN_SETTINGS) private readonly adminSettings: IAdminSettings,
    @inject(EXTRA_SETTINGS) private readonly extraSettings: IExtraSettings,
  ) {
    super();
  }

  public async create(): Promise<void> {
    return this.database.useConnection(async (connection) => {
      await this.createTables(connection);
      await this.addRolesIfNeed(connection);
      await this.addAdminUserIfNeed(connection);
    });
  }

  private async createTables(connection: PoolClient): Promise<void> {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts.roles (
        name VARCHAR(${this.MAX_ROLE_LENGTH}) PRIMARY KEY
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts.users (
        id UUID PRIMARY KEY,
        username VARCHAR(${USERNAME_CONSTRAINTS.maxLength}) NOT NULL UNIQUE,
        email VARCHAR(${this.MAX_EMAIL_LENGTH}) NOT NULL UNIQUE,
        "hashedPassword" VARCHAR(${this.MAX_BCRYPT_LENGTH}) NOT NULL,
        session UUID DEFAULT gen_random_uuid(),
        role VARCHAR(${this.MAX_ROLE_LENGTH}) REFERENCES posts.roles (name)
        ON UPDATE CASCADE
        ON DELETE SET NULL
        DEFAULT ${Role.USER}
      )
    `);

    await connection.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS users_email_and_username_unique on posts.users (email, username)',
    );
  }

  private async addRolesIfNeed(connection: PoolClient): Promise<void> {
    const roles = Object.values(Role);

    for (const role of roles) {
      await connection.query(
        `
          INSERT INTO posts.roles (name)
          VALUES ($1) ON CONFLICT (name) DO NOTHING
        `,
        [role],
      );
    }
  }

  private async addAdminUserIfNeed(connection: PoolClient): Promise<void> {
    const hashedPassword = await bcrypt.hash(
      this.adminSettings.password,
      this.extraSettings.saltRounds,
    );
    const adminData: UserCreatingData = {
      id: createUUID(),
      hashedPassword,
      email: this.adminSettings.email,
      username: this.adminSettings.username,
      role: Role.ADMIN,
    } as const;
    const parameters = [
      [adminData.id, adminData.username, adminData.email, adminData.hashedPassword, adminData.role],
    ];

    await connection.query(
      format(
        `
          INSERT INTO posts.users (id, username, email, "hashedPassword", role)
          VALUES %L ON CONFLICT (username, email) DO NOTHING
        `,
        parameters,
      ),
    );
  }
}
