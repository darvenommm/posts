import '@abraham/reflection';

import { inject, injectable } from 'inversify';
import { HttpStatus } from 'http-enums';

import { Guard } from '@/base/guard';
import { HttpError } from '@/base/errors';
import { AUTH_REPOSITORY, type IAuthRepository } from '../repository';

import type { Request, Response } from 'express';

export const IS_AUTHENTICATED_GUARD = Symbol('IsAuthenticatedGuard');

@injectable()
export class IsAuthenticatedGuard extends Guard<never> {
  public constructor(@inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository) {
    super();
  }

  protected async check(request: Request, _: Response): Promise<boolean> {
    const session: string | null = request.signedCookies.session ?? null;

    if (!session || !(await this.authRepository.getUser('session', session))) {
      throw new HttpError('User is not authenticated', HttpStatus.UNAUTHORIZED, [
        'You are not authenticated',
      ]);
    }

    return true;
  }
}
