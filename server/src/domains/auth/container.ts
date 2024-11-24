import { ContainerModule } from 'inversify';

import { CONTROLLERS, MIDDLEWARES } from '@/constants';
import { TABLES_OWNERS } from '@/database';
import { AuthMiddleware } from './middleware';
import { AuthTablesOwner } from './tablesOwner';
import { AuthController, type IAuthController } from './controller';
import { AUTH_REPOSITORY, AuthRepository, type IAuthRepository } from './repository';
import { AUTH_SERVICE, AuthService, type IAuthService } from './service';
import { IS_AUTHENTICATED_GUARD, IsAuthenticatedGuard } from './guards/isAuthenticated';
import { SIGN_IN_VALIDATOR, SignInValidator } from './validators/signIn';
import { SIGN_UP_VALIDATOR, SignUpValidator } from './validators/signUp';

import type { Middleware } from '@/base/middleware';
import type { TablesOwner } from '@/base/tablesOwner';
import type { Guard } from '@/base/guard';
import type { Validator } from '@/base/validator';

export const authModule = new ContainerModule((bind): void => {
  bind<IAuthController>(CONTROLLERS).to(AuthController);
  bind<Middleware>(MIDDLEWARES).to(AuthMiddleware);
  bind<TablesOwner>(TABLES_OWNERS).to(AuthTablesOwner);
  bind<IAuthRepository>(AUTH_REPOSITORY).to(AuthRepository);
  bind<IAuthService>(AUTH_SERVICE).to(AuthService);
  bind<Guard>(IS_AUTHENTICATED_GUARD).to(IsAuthenticatedGuard);
  bind<Validator>(SIGN_IN_VALIDATOR).to(SignInValidator);
  bind<Validator>(SIGN_UP_VALIDATOR).to(SignUpValidator);
});
