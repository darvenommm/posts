import { ContainerModule } from 'inversify';

import { CONTROLLERS } from '@/container';
import { TABLES_OWNERS } from '@/database';
import { PostsController, type IPostsController } from './controller';
import { PostsTablesOwner } from './tablesOwner';
import { POSTS_SERVICE, PostsService, type IPostsService } from './service';
import { POSTS_REPOSITORY, PostsRepository, type IPostsRepository } from './repository';
import { CREATE_VALIDATOR, CreateValidator } from './validators/create';
import { UPDATE_VALIDATOR, UpdateValidator } from './validators/update';
import { PAGE_VALIDATOR, PageValidator } from './validators/page';
import { CREATOR_OR_ADMIN_GUARD, CreatorOrAdminGuard } from './guard/creatorOrAdmin';

import type { TablesOwner } from '@/base/tablesOwner';
import type { Validator } from '@/base/validator';
import type { Guard } from '@/base/guard';

export const postsModule = new ContainerModule((bind): void => {
  bind<IPostsController>(CONTROLLERS).to(PostsController);
  bind<TablesOwner>(TABLES_OWNERS).to(PostsTablesOwner);
  bind<IPostsService>(POSTS_SERVICE).to(PostsService);
  bind<IPostsRepository>(POSTS_REPOSITORY).to(PostsRepository);
  bind<Validator>(CREATE_VALIDATOR).to(CreateValidator);
  bind<Validator>(UPDATE_VALIDATOR).to(UpdateValidator);
  bind<Validator>(PAGE_VALIDATOR).to(PageValidator);
  bind<Guard>(CREATOR_OR_ADMIN_GUARD).to(CreatorOrAdminGuard);
});
