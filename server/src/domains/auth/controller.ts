import { HttpMethod, HttpStatus } from 'http-enums';
import { default as ms } from 'ms';

import { Controller } from '@/base/controller';
import { AUTH_SERVICE, type IAuthService } from './service';
import { SIGN_UP_VALIDATOR } from './validators/signUp';
import { SIGN_IN_VALIDATOR } from './validators/signIn';
import { getUniqueId } from '@/helpers';

import type { Request, Response } from 'express';
import type { Validator } from '@/base/validator';
import type { SignInDTO, SignUpDTO } from './dtos';
import type { IContainer } from '@/container';

export const AUTH_CONTROLLER = getUniqueId();

interface CookiesData {
  session: string;
}

export class AuthController extends Controller {
  protected prefix = '/auth';

  private readonly authService: IAuthService;
  private readonly signUpValidator: Validator;
  private readonly signInValidator: Validator;

  public constructor(container: IContainer) {
    super();

    this.authService = container[AUTH_SERVICE] as IAuthService;
    this.signUpValidator = container[SIGN_UP_VALIDATOR] as Validator;
    this.signInValidator = container[SIGN_IN_VALIDATOR] as Validator;
  }

  protected setUpRouter(): void {
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

    this.addRoute({
      method: HttpMethod.GET,
      path: '/is-auth',
      handler: this.isAuthenticated,
      handlerThis: this,
    });
  }

  public async signUp(request: Request, response: Response<void>): Promise<void> {
    const signUpData = request.payload as SignUpDTO;
    const { session } = await this.authService.signUp(signUpData);

    this.setSessionIntoCookies(response, { session });
    response.status(HttpStatus.CREATED).end();
  }

  public async signIn(request: Request, response: Response<void>): Promise<void> {
    const signInData = request.payload as SignInDTO;
    const { session } = await this.authService.signIn(signInData);

    this.setSessionIntoCookies(response, { session });
    response.status(HttpStatus.NO_CONTENT).end();
  }

  public async signOut(_: Request, response: Response<void>): Promise<void> {
    this.clearCookies(response);

    response.status(HttpStatus.NO_CONTENT).end();
  }

  public async isAuthenticated(request: Request, response: Response<boolean>): Promise<void> {
    response.status(HttpStatus.OK).send(Boolean(request.user));
  }

  private setSessionIntoCookies(response: Response, { session }: CookiesData): void {
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
