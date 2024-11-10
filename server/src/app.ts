import { default as express } from 'express';
import { default as cors } from 'cors';
import { default as cookieParser } from 'cookie-parser';
import { default as helmet } from 'helmet';
import { HttpStatus } from 'http-enums';

import { InternalServerError, HttpError } from './base/errors';
import { Controller } from './base/controller';
import { getUniqueId } from './helpers';
import { SERVER_SETTINGS, type IServerSettings } from './settings/server';
import { EXTRA_SETTINGS, type IExtraSettings } from './settings/extra';
import { CONTROLLERS, LOGGER, MIDDLEWARES } from './container';
import { DATABASE_TABLES_OWNER } from './database';

import type { Express, Request, Response, NextFunction } from 'express';
import type { Errors } from './base/errors';
import type { Middleware } from './base/middleware';
import type { IContainer } from './container';
import type { TablesOwner } from './base/tablesOwner';
import type { ILogger } from './logger';

export const APPLICATION = getUniqueId();

export class Application {
  private readonly server: Express;

  private readonly controllers: Iterable<Controller>;
  private readonly serverSettings: IServerSettings;
  private readonly databaseTablesOwner: TablesOwner;
  private readonly logger: ILogger;
  private readonly extraSettings: IExtraSettings;
  private readonly middlewares: Iterable<Middleware>;

  public constructor(container: IContainer) {
    this.serverSettings = container[SERVER_SETTINGS] as IServerSettings;
    this.extraSettings = container[EXTRA_SETTINGS] as IExtraSettings;
    this.databaseTablesOwner = container[DATABASE_TABLES_OWNER] as TablesOwner;
    this.logger = container[LOGGER] as ILogger;

    this.middlewares = (container[MIDDLEWARES] ?? []) as Iterable<Middleware>;
    this.controllers = (container[CONTROLLERS] ?? []) as Iterable<Controller>;

    this.server = this.getSetServer();
  }

  public get express(): Express {
    return this.server;
  }

  public async start(): Promise<void> {
    try {
      const { port, host } = this.serverSettings;

      await this.databaseTablesOwner.create();

      this.server.listen(port, host, (): void => {
        this.logger.info(`The server was started on ${port} port`);
      });
    } catch (error) {
      this.logger.info(`The server was closed because of ${error}`);
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
      this.logger.error(error);
      response.status(error.status).json({ errors: InternalServerErrors });
      return;
    }

    if (error instanceof HttpError) {
      this.logger.info(error);
      response.status(error.status).json({ errors: error.errors });
      return;
    }

    if (error instanceof Error) {
      this.logger.error(error);
    } else {
      this.logger.error(error);
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ errors: InternalServerErrors });
  }
}
