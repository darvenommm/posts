import { HttpMethod, HttpStatus } from 'http-enums';

import { Controller } from '@/base/controller';
import { getUniqueId } from '@/helpers';

import { POSTS_SERVICE, type IPostsService } from './service';
import { IS_AUTHENTICATED_GUARD, Role, type IsAuthenticatedGuard, type IUser } from '../auth';
import { ADD_VALIDATOR } from './validators/add';
import { UPDATE_VALIDATOR } from './validators/update';
import { PAGES_PAGINATION_VALIDATOR } from './validators/pagesPagination';
import { CREATOR_OR_ADMIN_GUARD } from './guard/creatorOrAdmin';

import type { Request, Response } from 'express';
import type { IContainer } from '@/container';
import type { PostForRenderingWithPermission, PagesPaginationResult } from './types';
import type { PagesPaginationDTO } from './dtos';
import type { AddDTO, UpdateDTO } from './dtos';
import type { Validator } from '@/base/validator';
import type { Guard } from '@/base/guard';

export const POSTS_CONTROLLER = getUniqueId();

interface GetOneResult {
  readonly post: PostForRenderingWithPermission;
}

interface Params {
  readonly slug: string;
}

export class PostsController extends Controller {
  protected prefix = '/posts';

  private readonly postsService: IPostsService;
  private readonly addValidator: Validator;
  private readonly updateValidator: Validator;
  private readonly pagesPaginationValidator: Validator;
  private readonly creatorOrAdminGuard: Guard;
  private readonly isAuthenticatedGuard: Guard;

  public constructor(container: IContainer) {
    super();
    this.postsService = container[POSTS_SERVICE] as IPostsService;

    this.addValidator = container[ADD_VALIDATOR] as Validator;
    this.updateValidator = container[UPDATE_VALIDATOR] as Validator;
    this.pagesPaginationValidator = container[PAGES_PAGINATION_VALIDATOR] as Validator;

    this.creatorOrAdminGuard = container[CREATOR_OR_ADMIN_GUARD] as Guard;
    this.isAuthenticatedGuard = container[IS_AUTHENTICATED_GUARD] as IsAuthenticatedGuard;
  }

  protected setUpRouter(): void {
    this.addRoute({
      method: HttpMethod.GET,
      path: '',
      handler: this.getByPagination,
      handlerThis: this,
      middlewares: this.pagesPaginationValidator.getValidationChain(),
    });

    this.addRoute({
      method: HttpMethod.GET,
      path: '/:slug',
      handler: this.getOne,
      handlerThis: this,
    });

    this.addRoute({
      method: HttpMethod.POST,
      path: '',
      handler: this.add,
      handlerThis: this,
      middlewares: [
        this.isAuthenticatedGuard.getGuard(),
        ...this.addValidator.getValidationChain(),
      ],
    });

    this.addRoute({
      method: HttpMethod.PUT,
      path: '/:slug',
      handler: this.update,
      handlerThis: this,
      middlewares: [
        this.isAuthenticatedGuard.getGuard(),
        this.creatorOrAdminGuard.getGuard(),
        ...this.updateValidator.getValidationChain(),
      ],
    });

    this.addRoute({
      method: HttpMethod.DELETE,
      path: '/:slug',
      handler: this.remove,
      handlerThis: this,
      middlewares: [this.isAuthenticatedGuard.getGuard(), this.creatorOrAdminGuard.getGuard()],
    });
  }

  public async getOne(request: Request<Params>, response: Response<GetOneResult>): Promise<void> {
    const { slug } = request.params;
    const user = this.getCurrentUser(request);
    const postData = await this.postsService.getPostBySlugAndCheckExisting(slug);

    const canModify =
      user.username === postData.creator.username || [Role.ADMIN].includes(user.role);

    response.status(HttpStatus.OK).json({ post: { ...postData, canModify } });
  }

  public async getByPagination(
    request: Request,
    response: Response<PagesPaginationResult>,
  ): Promise<void> {
    const payload = request.payload as PagesPaginationDTO;
    const responseData = await this.postsService.getPostsByPagesPagination(payload);

    response.status(HttpStatus.OK).json(responseData);
  }

  public async add(request: Request, response: Response<void>): Promise<void> {
    const payload = request.payload as AddDTO;
    const { id: creatorId } = this.getCurrentUser(request);

    await this.postsService.addPost(payload, creatorId);

    response.status(HttpStatus.CREATED).end();
  }

  public async update(request: Request<Params>, response: Response<void>): Promise<void> {
    const { slug } = request.params;
    const payload = request.payload as UpdateDTO;
    await this.postsService.fullUpdatePostBySlug(slug, payload);

    response.status(HttpStatus.NO_CONTENT).end();
  }

  public async remove(request: Request<Params>, response: Response<void>): Promise<void> {
    const { slug } = request.params;
    await this.postsService.removePostBySlug(slug);

    response.status(HttpStatus.NO_CONTENT).end();
  }

  private getCurrentUser(request: Request<unknown>): IUser {
    return request.user!;
  }
}
