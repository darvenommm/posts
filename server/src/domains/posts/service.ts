import { HttpStatus } from 'http-enums';

import { getUniqueId } from '@/helpers';
import { HttpError, InternalServerError } from '@/base/errors';
import { POSTS_REPOSITORY, type IPostsRepository } from './repository';
import { AUTH_REPOSITORY, type IAuthRepository } from '../auth';

import type { AddDTO, UpdateDTO } from './dtos';
import type { PostForRendering, PagesPaginationResult } from './types';
import type { PagesPaginationDTO } from './dtos';
import type { IContainer } from '@/container';

export const POSTS_SERVICE = getUniqueId();

export interface IPostsService {
  getPostBySlugAndCheckExisting: (slug: string) => Promise<PostForRendering>;

  getPostsByPagesPagination: (
    paginationSettings: PagesPaginationDTO,
  ) => Promise<PagesPaginationResult>;

  addPost: (postData: AddDTO, creatorId: string) => Promise<void>;
  fullUpdatePostBySlug: (slug: string, updateData: UpdateDTO) => Promise<void>;
  removePostBySlug: (slug: string) => Promise<void>;
}

export class PostsService implements IPostsService {
  private readonly authRepository: IAuthRepository;
  private readonly postsRepository: IPostsRepository;

  public constructor(container: IContainer) {
    this.authRepository = container[AUTH_REPOSITORY] as IAuthRepository;
    this.postsRepository = container[POSTS_REPOSITORY] as IPostsRepository;
  }

  public async getPostBySlugAndCheckExisting(slug: string): Promise<PostForRendering> {
    const post = await this.postsRepository.getPostByField('slug', slug);
    if (!post) {
      throw new HttpError('Incorrect slug', HttpStatus.UNPROCESSABLE_ENTITY, [
        'A post with this slug is not existed',
      ]);
    }

    const user = await this.authRepository.getUserByField('id', post.creatorId);
    if (!user) throw new InternalServerError('Incorrect creator id');

    return { ...post, creator: { username: user.username } };
  }

  public async getPostsByPagesPagination(
    paginationSettings: PagesPaginationDTO,
  ): Promise<PagesPaginationResult> {
    const { limit } = paginationSettings;

    const [postsCount, posts] = await Promise.all([
      this.postsRepository.getPostsCount(),
      this.postsRepository.getPostsByPages(paginationSettings),
    ]);

    const postsForRendering = await Promise.all(
      posts.map(async (post): Promise<PostForRendering> => {
        const user = await this.authRepository.getUserByField('id', post.creatorId);
        if (!user) throw new InternalServerError('Incorrect creator id');

        return { ...post, creator: { username: user.username } };
      }),
    );

    const pagesCount = Math.ceil(postsCount / Math.max(limit, 1));

    return { posts: postsForRendering, pagesCount };
  }

  public async addPost(postData: AddDTO, creatorId: string): Promise<void> {
    // Do post method idempotent (id received from frontend)
    if (await this.postsRepository.getPostByField('id', postData.id)) {
      return;
    }

    await this.checkNotExistingPostWithThisTitle(postData.title);

    return this.postsRepository.addPost(postData, creatorId);
  }

  public async fullUpdatePostBySlug(slug: string, updateData: UpdateDTO): Promise<void> {
    const { id } = await this.getPostBySlugAndCheckExisting(slug);
    await this.checkNotExistingPostWithThisTitle(updateData.title);

    return this.postsRepository.fullUpdatePostById(id, updateData);
  }

  public async removePostBySlug(slug: string): Promise<void> {
    const { id } = await this.getPostBySlugAndCheckExisting(slug);

    return this.postsRepository.removePostById(id);
  }

  private async checkNotExistingPostWithThisTitle(title: string): Promise<never | void> {
    if (await this.postsRepository.getPostByField('title', title)) {
      throw new HttpError('Repeated title', HttpStatus.UNPROCESSABLE_ENTITY, [
        'There is a post with this title already',
      ]);
    }
  }
}
