import { getUniqueId } from '@/helpers';
import { Guard } from '@/base/guard';
import { InternalServerError } from '@/base/errors';
import { Role } from '@/domains/auth';
import { POSTS_SERVICE, type IPostsService } from '../service';

import type { IContainer } from '@/container';
import type { Request } from 'express';

export const CREATOR_OR_ADMIN_GUARD = getUniqueId();

export class CreatorOrAdminGuard extends Guard {
  private readonly postsService: IPostsService;

  public constructor(container: IContainer) {
    super();
    this.postsService = container[POSTS_SERVICE] as IPostsService;
  }

  protected async check(request: Request): Promise<boolean> {
    const user = request.user;

    if (!user) throw new InternalServerError('Not found user in request');

    const postSlug = request.path.split('/').at(-1) as string;
    const post = await this.postsService.getPostBySlugAndCheckExisting(postSlug);

    if (post.creator.username !== user.username && user.role !== Role.ADMIN) {
      return false;
    }

    return true;
  }
}
