import '@abraham/reflection';

import { inject, injectable } from 'inversify';
import { HttpStatus } from 'http-enums';

import { HttpError, InternalServerError } from '@/base/errors';
import { POSTS_REPOSITORY, type IPostsRepository } from './repository';
import { AUTH_REPOSITORY, Role, type IAuthRepository, type IUser } from '../auth';

import type {
  PostData,
  PageOptions,
  PageResult,
  CreatePostData,
  UpdatePostData,
  CreateResult,
  UpdateResult,
} from './types';

export const POSTS_SERVICE = Symbol('PostsService');

export interface IPostsService {
  getPostBySlug: (slug: string, currentUser?: IUser | null) => Promise<PostData>;
  getPostsPages: (
    paginationOptions: PageOptions,
    currentUserId?: IUser | null,
  ) => Promise<PageResult>;

  createPost: (postData: CreatePostData) => Promise<CreateResult>;
  fullUpdatePostBySlug: (slug: string, updateData: UpdatePostData) => Promise<UpdateResult>;
  removePostBySlug: (slug: string) => Promise<void>;
}

@injectable()
export class PostsService implements IPostsService {
  public constructor(
    @inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @inject(POSTS_REPOSITORY) private readonly postsRepository: IPostsRepository,
  ) {}

  public async getPostBySlug(slug: string, currentUser: IUser | null = null): Promise<PostData> {
    const post = await this.postsRepository.getPost('slug', slug);
    if (!post) {
      throw new HttpError('Incorrect slug', HttpStatus.UNPROCESSABLE_ENTITY, [
        'A post with this slug is not existed',
      ]);
    }

    const { creatorId: _, ...otherPostsParameters } = post;

    return {
      ...otherPostsParameters,
      creator: await this.getCreatorInfo(post.creatorId),
      canModify: this.canUserModify(post.creatorId, currentUser),
    };
  }

  public async getPostsPages(
    paginationOptions: PageOptions,
    currentUser: IUser | null = null,
  ): Promise<PageResult> {
    const { limit } = paginationOptions;

    const [postsCount, rawPosts] = await Promise.all([
      this.postsRepository.getPostsCount(),
      this.postsRepository.getPostsByPages(paginationOptions),
    ]);

    const posts = await Promise.all(
      rawPosts.map(async (rawPost): Promise<PostData> => {
        const { creatorId, ...otherPostsParameters } = rawPost;

        return {
          ...otherPostsParameters,
          creator: await this.getCreatorInfo(rawPost.creatorId),
          canModify: this.canUserModify(rawPost.creatorId, currentUser),
        };
      }),
    );
    const pagesCount = Math.ceil(postsCount / Math.max(limit, 1));

    return { posts, pagesCount };
  }

  public async createPost(postData: CreatePostData): Promise<CreateResult> {
    const postById = await this.postsRepository.getPost('id', postData.id);
    if (postById) {
      return { slug: postById.slug };
    }

    const postWithThisTitle = await this.postsRepository.getPost('title', postData.title);
    if (postWithThisTitle) {
      throw new HttpError('Repeated title', HttpStatus.UNPROCESSABLE_ENTITY, [
        'There is a post with this title already',
      ]);
    }

    return this.postsRepository.createPost(postData);
  }

  public async fullUpdatePostBySlug(
    slug: string,
    updateData: UpdatePostData,
  ): Promise<UpdateResult> {
    const { id: postId } = await this.getPostBySlug(slug);

    const postWithThisTitle = await this.postsRepository.getPost('title', updateData.title);
    if (postWithThisTitle && postId !== postWithThisTitle.id) {
      throw new HttpError('Repeated title', HttpStatus.UNPROCESSABLE_ENTITY, [
        'There is a post with this title already',
      ]);
    }

    return this.postsRepository.fullUpdatePost('id', postId, updateData);
  }

  public async removePostBySlug(slug: string): Promise<void> {
    const { id: postId } = await this.getPostBySlug(slug);

    return this.postsRepository.removePost('id', postId);
  }

  private async getCreatorInfo(creatorId: string): Promise<PostData['creator']> {
    const creator = await this.authRepository.getUser('id', creatorId);

    if (!creator) {
      throw new InternalServerError('Incorrect creator id');
    }

    return { username: creator.username };
  }

  private canUserModify(creatorId: string, currentUser: IUser | null): boolean {
    if (!currentUser) {
      return false;
    }

    return currentUser.id === creatorId || [Role.ADMIN].includes(currentUser.role);
  }
}
