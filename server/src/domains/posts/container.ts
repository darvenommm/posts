import { asClass } from 'awilix';

import { POSTS_CONTROLLER, PostsController } from './controller';
import { POSTS_SERVICE, PostsService } from './service';
import { POSTS_REPOSITORY, PostsRepository } from './repository';
import { POSTS_TABLES_CREATOR, PostsTablesCreator } from './tablesCreator';
import { ADD_VALIDATOR, AddValidator } from './validators/add';
import { UPDATE_VALIDATOR, UpdateValidator } from './validators/update';
import { PAGES_PAGINATION_VALIDATOR, pagesPaginationValidator } from './validators/pagesPagination';
import { CREATOR_OR_ADMIN_GUARD, CreatorOrAdminGuard } from './guard/creatorOrAdmin';

import type { AwilixContainer } from 'awilix';

export const addPostsDependencies = (container: AwilixContainer): void => {
  container.register({
    [POSTS_CONTROLLER]: asClass(PostsController).singleton(),
    [POSTS_SERVICE]: asClass(PostsService).singleton(),
    [POSTS_REPOSITORY]: asClass(PostsRepository).singleton(),
    [POSTS_TABLES_CREATOR]: asClass(PostsTablesCreator).singleton(),
    [ADD_VALIDATOR]: asClass(AddValidator).singleton(),
    [UPDATE_VALIDATOR]: asClass(UpdateValidator).singleton(),
    [PAGES_PAGINATION_VALIDATOR]: asClass(pagesPaginationValidator).singleton(),
    [CREATOR_OR_ADMIN_GUARD]: asClass(CreatorOrAdminGuard).singleton(),
  });
};
