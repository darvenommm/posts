import '@abraham/reflection';

import { default as bcrypt } from 'bcrypt';
import { inject, injectable } from 'inversify';
import { HttpStatus } from 'http-enums';
import { isEmail } from 'validator';

import { HttpError } from '@/base/errors';
import { AUTH_REPOSITORY } from './repository';

import type { IAuthRepository } from './repository';
import type { SignInDTO, SignUpDTO } from './dtos';

export interface UserDataForEntry {
  readonly session: string;
}

export interface IAuthService {
  signUp: (addUserData: SignUpDTO) => Promise<UserDataForEntry>;
  signIn: (entryData: SignInDTO) => Promise<UserDataForEntry>;
}

export const AUTH_SERVICE = Symbol('AuthService');

@injectable()
export class AuthService implements IAuthService {
  public constructor(@inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository) {}

  public async signUp(addUserData: SignUpDTO): Promise<UserDataForEntry> {
    const userById = await this.authRepository.getUser('id', addUserData.id);
    if (userById) {
      return { session: userById.session };
    }

    const [isExistedByEmail, isExistedByUsername] = await Promise.all([
      this.authRepository.getUser('email', addUserData.email),
      this.authRepository.getUser('username', addUserData.username),
    ]);

    const isUserExistedWithEmailOrUsername = !!isExistedByEmail || !!isExistedByUsername;
    if (isUserExistedWithEmailOrUsername) {
      throw new HttpError(
        'User is existed in the system with this email or username',
        HttpStatus.UNPROCESSABLE_ENTITY,
        ['The email or username is busy with some user :('],
      );
    }

    const createdUser = await this.authRepository.addUser(addUserData);

    return { session: createdUser.session };
  }

  public async signIn(entryData: SignInDTO): Promise<UserDataForEntry> {
    const { emailOrUsername, password } = entryData;

    const user = await (isEmail(emailOrUsername)
      ? this.authRepository.getUser('email', emailOrUsername)
      : this.authRepository.getUser('username', emailOrUsername));

    if (!user) {
      throw new HttpError('User is not existed in the database', HttpStatus.UNPROCESSABLE_ENTITY, [
        'The email or username is not busy with some user',
      ]);
    }

    const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isCorrectPassword) {
      throw new HttpError('Incorrect password from user', HttpStatus.UNPROCESSABLE_ENTITY, [
        'Incorrect password',
      ]);
    }

    return { session: user.session };
  }
}
