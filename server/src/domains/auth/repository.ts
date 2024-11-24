import '@abraham/reflection';

import { default as bcrypt } from 'bcrypt';
import { default as format } from 'pg-format';
import { inject, injectable } from 'inversify';

import { InternalServerError } from '@/base/errors';
import { DATABASE, type IDatabase } from '@/database';
import { EXTRA_SETTINGS, type IExtraSettings } from '@/settings/extra';
import { Role, type IUser, type UserCreatingData } from './types';

import type { QueryResult } from 'pg';
import type { SignUpDTO } from './dtos';

type FieldName = 'id' | 'email' | 'username' | 'session';

export interface IAuthRepository {
  addUser: (userData: SignUpDTO) => Promise<IUser>;
  getUser: (fieldName: FieldName, fieldValue: string) => Promise<IUser | null>;
}

export const AUTH_REPOSITORY = Symbol('AuthRepository');

@injectable()
export class AuthRepository implements IAuthRepository {
  public constructor(
    @inject(DATABASE) private readonly database: IDatabase,
    @inject(EXTRA_SETTINGS) private readonly extraSettings: IExtraSettings,
  ) {}

  public async addUser({ id, email, username, password }: SignUpDTO): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(password, this.extraSettings.saltRounds);
    const userData: UserCreatingData = {
      id,
      email,
      username,
      hashedPassword,
      role: Role.USER,
    } as const;
    const parameters = [
      [userData.id, userData.email, userData.username, userData.hashedPassword, userData.role],
    ];

    await this.database.useConnection(async (connection) => {
      await connection.query(
        format(
          'INSERT INTO posts.users (id, email, username, "hashedPassword", role) VALUES %L',
          parameters,
        ),
      );
    });

    const user = await this.getUser('email', email);
    if (!user) {
      throw new InternalServerError('User is not created!');
    }

    return user;
  }

  public async getUser(fieldName: FieldName, fieldValue: string): Promise<IUser | null> {
    const users = await this.database.useConnection<QueryResult<IUser>>(async (connection) => {
      return connection.query<IUser>(`SELECT * FROM posts.users WHERE ${fieldName} = $1 LIMIT 1`, [
        fieldValue,
      ]);
    });

    return users.rows[0] ?? null;
  }
}
