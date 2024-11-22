import { default as bcrypt } from 'bcrypt';
import { inject, injectable } from 'inversify';

import { InternalServerError } from '@/base/errors';
import { DATABASE, type IDatabase } from '@/database';
import { EXTRA_SETTINGS, type IExtraSettings } from '@/settings/extra';

import { Role, type IUser, type UserCreatingData } from './types';
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

  public async addUser({ email, username, password }: SignUpDTO): Promise<IUser> {
    const sql = this.database.connection;
    const hashedPassword = await bcrypt.hash(password, this.extraSettings.saltRounds);
    const userData: UserCreatingData = {
      email,
      username,
      hashedPassword,
      role: Role.USER,
    } as const;

    await sql`INSERT INTO posts.users ${sql(userData)}`;

    const user = await this.getUser('email', email);

    if (!user) {
      throw new InternalServerError('User is not created!');
    }

    return user;
  }

  public async getUser(fieldName: FieldName, fieldValue: string): Promise<IUser | null> {
    const sql = this.database.connection;

    const selectResult = await sql<IUser[]>`
      SELECT *
      FROM posts.users
      WHERE ${sql(fieldName)} = ${fieldValue}
      LIMIT 1;
    `;

    return selectResult[0] ?? null;
  }
}
