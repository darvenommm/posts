import '@abraham/reflection';

import { default as ms } from 'ms';
import { inject, injectable } from 'inversify';
import { HttpMethod, HttpStatus } from 'http-enums';

import { Controller } from '@/base/controller';
import { AUTH_SERVICE, type IAuthService } from './service';
import { SIGN_UP_VALIDATOR } from './validators/signUp';
import { SIGN_IN_VALIDATOR } from './validators/signIn';

import type { Request, Response } from 'express';
import type { Handler } from '@/types';
import type { Validator } from '@/base/validator';
import type { SignInDTO, SignUpDTO } from './dtos';

export const AUTH_CONTROLLER = Symbol('AuthController');

export interface IAuthController {
  signUp: Handler<void>;
  signIn: Handler<void>;
  signOut: Handler<void>;
  isAuth: Handler<boolean>;
}

@injectable()
export class AuthController extends Controller implements IAuthController {
  protected prefix = '/auth';

  public constructor(
    @inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @inject(SIGN_UP_VALIDATOR) private readonly signUpValidator: Validator,
    @inject(SIGN_IN_VALIDATOR) private readonly signInValidator: Validator,
  ) {
    super();
  }

  protected setUpRouter(): void {
    this.addRoute({
      method: HttpMethod.GET,
      path: '/is-auth',
      handler: this.isAuth,
      handlerThis: this,
    });

    this.addRoute({
      method: HttpMethod.POST,
      path: '/sign-up',
      handler: this.signUp,
      handlerThis: this,
      middlewares: this.signUpValidator.getValidationChain(),
    });

    this.addRoute({
      method: HttpMethod.POST,
      path: '/sign-in',
      handler: this.signIn,
      handlerThis: this,
      middlewares: this.signInValidator.getValidationChain(),
    });

    this.addRoute({
      method: HttpMethod.POST,
      path: '/sign-out',
      handler: this.signOut,
      handlerThis: this,
    });
  }

  public async signUp(request: Request, response: Response<void>): Promise<void> {
    const signUpData = request.payload as SignUpDTO;
    const { session } = await this.authService.signUp(signUpData);

    this.setSessionIntoCookies(response, session);
    response.status(HttpStatus.CREATED).end();
  }

  public async signIn(request: Request, response: Response<void>): Promise<void> {
    const signInData = request.payload as SignInDTO;
    const { session } = await this.authService.signIn(signInData);

    this.setSessionIntoCookies(response, session);
    response.status(HttpStatus.NO_CONTENT).end();
  }

  public async signOut(_: Request, response: Response<void>): Promise<void> {
    this.clearCookies(response);

    response.status(HttpStatus.NO_CONTENT).end();
  }

  public async isAuth(request: Request, response: Response<boolean>): Promise<void> {
    response.status(HttpStatus.OK).send(Boolean(request.user));
  }

  private setSessionIntoCookies(response: Response, session: string): void {
    response.cookie('session', session, {
      maxAge: ms('2 weeks'),
      httpOnly: true,
      signed: true,
      priority: 'high',
    });
  }

  private clearCookies(response: Response): void {
    response.clearCookie('session');
  }
}
