import { default as express } from 'express';
import { default as cors } from 'cors';
import { default as cookieParser } from 'cookie-parser';
import { default as helmet } from 'helmet';
import { HttpStatus } from 'http-enums';

import { InternalServerError, HttpError } from './base/errors';
import { Controller } from './base/controller';
import { getUniqueId } from './helpers';
import { CONTROLLERS, MIDDLEWARES } from './container';
import { SERVER_SETTINGS, type IServerSettings } from './settings/server';
import { EXTRA_SETTINGS, type IExtraSettings } from './settings/extra';

import type { Express, Request, Response, NextFunction } from 'express';
import type { Errors } from './base/errors';
import type { Middleware } from './base/middleware';
import type { IContainer } from './container';

export const APPLICATION = getUniqueId();

export class Application {
  private readonly server: Express;

  private readonly controllers: Iterable<Controller>;
  private readonly serverSettings: IServerSettings;
  private readonly extraSettings: IExtraSettings;
  private readonly middlewares: Iterable<Middleware>;

  public constructor(container: IContainer) {
    this.serverSettings = container[SERVER_SETTINGS] as IServerSettings;
    this.extraSettings = container[EXTRA_SETTINGS] as IExtraSettings;

    this.middlewares = container[MIDDLEWARES] as Iterable<Middleware>;
    this.controllers = container[CONTROLLERS] as Iterable<Controller>;

    this.server = this.getSetServer();
  }

  public start(): void {
    try {
      const { port, host } = this.serverSettings;

      this.server.listen(port, host, (): void => {
        console.log(`The server was started on ${port} port`);
      });
    } catch (error) {
      console.error(`The server was closed because of ${error}`);
    }
  }

  private getSetServer(): Express {
    const server = express();

    server.use(helmet());
    server.use(cors());
    server.use(express.json());
    server.use(cookieParser(this.extraSettings.secret));

    for (const middleware of this.middlewares) {
      server.use(middleware.middleware);
    }

    for (const controller of this.controllers) {
      server.use(controller.router);
    }

    server.use(this.errorsHandler.bind(this));

    return server;
  }

  private errorsHandler(
    error: unknown,
    _request: Request,
    response: Response<{ errors: Errors }>,
    _next: NextFunction,
  ): void {
    const InternalServerErrors = ['Some internal server error'];

    if (error instanceof InternalServerError) {
      console.error(error.message, error.stack);
      response.status(error.status).json({ errors: InternalServerErrors });
      return;
    }

    if (error instanceof HttpError) {
      console.error(error.message, error.stack);
      response.status(error.status).json({ errors: error.errors });
      return;
    }

    if (error instanceof Error) {
      console.error(error.message, error.stack);
    } else {
      console.error(error);
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ errors: InternalServerErrors });
  }
}
