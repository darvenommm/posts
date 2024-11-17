import { HttpStatus } from 'http-enums';

import { Guard } from '@/base/guard';
import { HttpError } from '@/base/errors';
import { getUniqueId } from '@/helpers';
import { AUTH_REPOSITORY, type IAuthRepository } from '../repository';

import type { Request, Response } from 'express';
import type { IContainer } from '@/container';

export const IS_AUTHENTICATED_GUARD = getUniqueId();

export class IsAuthenticatedGuard extends Guard<never> {
  private readonly authRepository: IAuthRepository;

  public constructor(container: IContainer) {
    super();
    this.authRepository = container[AUTH_REPOSITORY] as IAuthRepository;
  }

  protected async check(request: Request, response: Response): Promise<boolean> {
    const session: string | null = request.signedCookies.session ?? null;

    if (!session || !(await this.authRepository.getUserByField('session', session))) {
      response.clearCookie('session');

      throw new HttpError('User is not authenticated', HttpStatus.UNAUTHORIZED, [
        'You are not authenticated',
      ]);
    }

    return true;
  }
}
