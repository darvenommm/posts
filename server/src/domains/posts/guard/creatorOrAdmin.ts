import { inject, injectable } from 'inversify';

import { Guard } from '@/base/guard';
import { InternalServerError } from '@/base/errors';
import { Role } from '@/domains/auth';
import { POSTS_SERVICE, type IPostsService } from '../service';

import type { Request } from 'express';

export const CREATOR_OR_ADMIN_GUARD = Symbol('CreatorOrAdminGuard');

@injectable()
export class CreatorOrAdminGuard extends Guard {
  public constructor(@inject(POSTS_SERVICE) private readonly postsService: IPostsService) {
    super();
  }

  protected async check(request: Request): Promise<boolean> {
    const currentUser = request.user;

    if (!currentUser) {
      throw new InternalServerError('Not found user in request');
    }

    const postSlug = request.path.split('/').at(-1) as string;
    const post = await this.postsService.getPostBySlug(postSlug);

    if (post.creator.username !== currentUser.username && currentUser.role !== Role.ADMIN) {
      return false;
    }

    return true;
  }
}
