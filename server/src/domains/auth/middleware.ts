import { Middleware } from '@/base/middleware';

import { getUniqueId } from '@/helpers';
import { AUTH_REPOSITORY } from './repository';

import type { Request, Response, NextFunction } from 'express';
import type { IContainer } from '@/container';
import type { Middleware as MiddlewareType } from '@/types';
import type { IAuthRepository } from './repository';

export const AUTH_MIDDLEWARE = getUniqueId();

export class AuthMiddleware extends Middleware {
  private readonly authRepository: IAuthRepository;

  public constructor(container: IContainer) {
    super();
    this.authRepository = container[AUTH_REPOSITORY] as IAuthRepository;
  }

  public get middleware(): MiddlewareType {
    return async (request: Request, _: Response, next: NextFunction): Promise<void> => {
      console.log(request.headers, request.cookies, request.signedCookies);
      const session = request.signedCookies.session;

      if (session) {
        request.user = await this.authRepository.getUserByField('session', session);
      }

      next();
    };
  }
}
