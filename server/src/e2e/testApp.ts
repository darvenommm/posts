import '@abraham/reflection';

import { inject, injectable, multiInject, optional } from 'inversify';
import {
  default as express,
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { default as cookieParser } from 'cookie-parser';

import { type IApplication } from '@/app';
import { CONTROLLERS, MIDDLEWARES } from '@/constants';
import type { Controller } from '@/base/controller';
import type { Middleware } from '@/base/middleware';
import { EXTRA_SETTINGS, type IExtraSettings } from '@/settings/extra';

@injectable()
export class TestApplication implements IApplication {
  private readonly _server: Express;

  public constructor(
    @multiInject(CONTROLLERS) @optional() private readonly controllers: Iterable<Controller> = [],
    @multiInject(MIDDLEWARES) @optional() private readonly middlewares: Iterable<Middleware> = [],
    @inject(EXTRA_SETTINGS) private readonly extraSettings: IExtraSettings,
  ) {
    this._server = this.getSetServer();
  }

  public get server(): Express {
    return this._server;
  }

  public async start(): Promise<void> {}

  private getSetServer(): Express {
    const server = express();

    server.use(express.json());
    server.use(cookieParser(this.extraSettings.secret));

    for (const middleware of this.middlewares) {
      server.use(middleware.middleware);
    }

    for (const controller of this.controllers) {
      server.use(controller.router);
    }

    server.use((error: Error, _: Request, __: Response, ___: NextFunction) => {
      console.error(error);
    });

    return server;
  }
}
