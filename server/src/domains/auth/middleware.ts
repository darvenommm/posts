import { inject, injectable } from 'inversify';

import { Middleware } from '@/base/middleware';
import { AUTH_REPOSITORY } from './repository';

import type { Request, Response, NextFunction } from 'express';
import type { Middleware as MiddlewareType } from '@/types';
import type { IAuthRepository } from './repository';

@injectable()
export class AuthMiddleware extends Middleware {
  public constructor(@inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository) {
    super();
  }

  public get middleware(): MiddlewareType {
    return async (request: Request, _: Response, next: NextFunction): Promise<void> => {
      const session = request.signedCookies.session;

      if (session) {
        request.user = await this.authRepository.getUser('session', session);
      }

      next();
    };
  }
}
