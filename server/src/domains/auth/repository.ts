import { default as bcrypt } from 'bcrypt';

import { InternalServerError } from '@/base/errors';
import { getUniqueId } from '@/helpers';
import { DATABASE, type IDatabase } from '@/database';
import { EXTRA_SETTINGS, type IExtraSettings } from '@/settings/extra';

import type { IUser, UserCreatingData } from './types';
import type { SignUpDTO } from './dtos';
import type { IContainer } from '@/container';

type FieldName = 'id' | 'email' | 'username' | 'session';

export interface IAuthRepository {
  addUser: (userData: SignUpDTO) => Promise<IUser>;
  getUserByField: (fieldName: FieldName, fieldValue: string) => Promise<IUser | null>;
}

export const AUTH_REPOSITORY = getUniqueId();

export class AuthRepository implements IAuthRepository {
  private readonly database: IDatabase;
  private readonly extraSettings: IExtraSettings;

  public constructor(container: IContainer) {
    this.database = container[DATABASE] as IDatabase;
    this.extraSettings = container[EXTRA_SETTINGS] as IExtraSettings;
  }

  public async addUser({ email, username, password }: SignUpDTO): Promise<IUser> {
    const sql = this.database.connection;
    const hashedPassword = await bcrypt.hash(password, this.extraSettings.saltRounds);
    const userData: UserCreatingData & { role: null } = {
      email,
      username,
      hashedPassword,
      role: null,
    } as const;

    await sql`INSERT INTO posts.users ${sql(userData)}`;

    const user = await this.getUserByField('email', email);

    if (!user) {
      throw new InternalServerError('User is not created!');
    }

    return user;
  }

  public async getUserByField(fieldName: FieldName, fieldValue: string): Promise<IUser | null> {
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
