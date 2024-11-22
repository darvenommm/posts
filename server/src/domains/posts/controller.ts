import { inject, injectable } from 'inversify';
import { HttpMethod, HttpStatus } from 'http-enums';

import { Controller } from '@/base/controller';
import { POSTS_SERVICE, type IPostsService } from './service';
import { IS_AUTHENTICATED_GUARD, type IUser } from '../auth';
import { CREATE_VALIDATOR } from './validators/create';
import { UPDATE_VALIDATOR } from './validators/update';
import { PAGE_VALIDATOR } from './validators/page';
import { CREATOR_OR_ADMIN_GUARD } from './guard/creatorOrAdmin';

import type { Request, Response } from 'express';
import type { PostData, PageResult, CreateResult, UpdateResult } from './types';
import type { PagesPaginationDTO } from './dtos';
import type { AddDTO, UpdateDTO } from './dtos';
import type { Validator } from '@/base/validator';
import type { Guard } from '@/base/guard';
import type { Handler } from '@/types';

export const POSTS_CONTROLLER = Symbol('PostsController');

interface Params {
  readonly slug: string;
}

export interface IPostsController {
  getOne: Handler<PostData>;
  getPage: Handler<PageResult>;
  create: Handler<CreateResult>;
  update: Handler<UpdateResult>;
  remove: Handler<void>;
}

@injectable()
export class PostsController extends Controller implements IPostsController {
  protected prefix = '/posts';

  public constructor(
    @inject(POSTS_SERVICE) private readonly postsService: IPostsService,
    @inject(CREATE_VALIDATOR) private readonly createValidator: Validator,
    @inject(UPDATE_VALIDATOR) private readonly updateValidator: Validator,
    @inject(PAGE_VALIDATOR) private readonly pageValidator: Validator,
    @inject(CREATOR_OR_ADMIN_GUARD) private readonly creatorOrAdminGuard: Guard,
    @inject(IS_AUTHENTICATED_GUARD) private readonly isAuthenticatedGuard: Guard,
  ) {
    super();
  }

  protected setUpRouter(): void {
    this.addRoute({
      method: HttpMethod.GET,
      path: '',
      handler: this.getPage,
      handlerThis: this,
      middlewares: this.pageValidator.getValidationChain(),
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
      handler: this.create,
      handlerThis: this,
      middlewares: [
        this.isAuthenticatedGuard.getGuard(),
        ...this.createValidator.getValidationChain(),
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

  public async getOne(request: Request<Params>, response: Response<PostData>): Promise<void> {
    const { slug } = request.params;
    const currentUser = this.getCurrentUser(request);
    const postData = await this.postsService.getPostBySlug(slug, currentUser);

    response.status(HttpStatus.OK).json(postData);
  }

  public async getPage(request: Request, response: Response<PageResult>): Promise<void> {
    const paginationOptions = request.payload as PagesPaginationDTO;
    const currentUser = this.getCurrentUser(request);
    const postsPage = await this.postsService.getPostsPages(paginationOptions, currentUser);

    response.status(HttpStatus.OK).json(postsPage);
  }

  public async create(request: Request, response: Response<CreateResult>): Promise<void> {
    const payload = request.payload as AddDTO;
    const creator = this.getCurrentUser(request);
    const createResult = await this.postsService.createPost({ ...payload, creatorId: creator.id });

    response.status(HttpStatus.CREATED).json(createResult);
  }

  public async update(request: Request<Params>, response: Response<UpdateResult>): Promise<void> {
    const { slug } = request.params;
    const payload = request.payload as UpdateDTO;
    const updateResult = await this.postsService.fullUpdatePostBySlug(slug, payload);

    response.status(HttpStatus.NO_CONTENT).json(updateResult);
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
