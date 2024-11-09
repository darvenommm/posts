export { addAuthDependencies } from './container';
export { IS_AUTHENTICATED_GUARD, type IsAuthenticatedGuard } from './guards/isAuthenticated';
export { AUTH_CONTROLLER } from './controller';
export { AUTH_REPOSITORY, type IAuthRepository } from './repository';
export { AUTH_MIDDLEWARE } from './middleware';
export { AUTH_TABLES_CREATOR } from './tablesCreator';

export { Role } from './types';
export type { IUser, IRole } from './types';
