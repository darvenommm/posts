import { default as bcrypt } from 'bcrypt';
import { HttpStatus } from 'http-enums';
import { isEmail } from 'validator';

import { HttpError } from '@/base/errors';
import { getUniqueId } from '@/helpers';
import { AUTH_REPOSITORY } from './repository';

import type { IContainer } from '@/container';
import type { IAuthRepository } from './repository';
import type { SignInDTO, SignUpDTO } from './dtos';

export interface UserDataForEntry {
  readonly session: string;
}

export interface IAuthService {
  signUp: (addUserData: SignUpDTO) => Promise<UserDataForEntry>;
  signIn: (entryData: SignInDTO) => Promise<UserDataForEntry>;
}

export const AUTH_SERVICE = getUniqueId();

export class AuthService implements IAuthService {
  private readonly authRepository: IAuthRepository;

  public constructor(container: IContainer) {
    this.authRepository = container[AUTH_REPOSITORY] as IAuthRepository;
  }

  public async signUp(addUserData: SignUpDTO): Promise<UserDataForEntry> {
    const [isExistedByEmail, isExistedByUsername] = await Promise.all([
      this.authRepository.getUserByField('email', addUserData.email),
      this.authRepository.getUserByField('username', addUserData.username),
    ]);

    const isExistedUserWithThisEmailOrUsername = !!isExistedByEmail || !!isExistedByUsername;
    if (isExistedUserWithThisEmailOrUsername) {
      throw new HttpError(
        'User is existed in the system with this email or username',
        HttpStatus.UNPROCESSABLE_ENTITY,
        ['THe email or username is busy with some user :('],
      );
    }

    const createdUser = await this.authRepository.addUser(addUserData);

    return { session: createdUser.session };
  }

  public async signIn(entryData: SignInDTO): Promise<UserDataForEntry> {
    const { emailOrUsername, password } = entryData;

    const user = await (isEmail(emailOrUsername)
      ? this.authRepository.getUserByField('email', emailOrUsername)
      : this.authRepository.getUserByField('username', emailOrUsername));

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
