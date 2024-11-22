import { inject, injectable } from 'inversify';

import { createSlug } from '@/helpers';
import { DATABASE, type IDatabase } from '@/database';

import type {
  IPost,
  CreatePostData,
  UpdatePostData,
  PageOptions,
  CreateResult,
  UpdateResult,
} from './types';

export const POSTS_REPOSITORY = Symbol('PostsRepository');

type FieldName = 'id' | 'title' | 'slug';

export interface IPostsRepository {
  getPostsByPages: (paginationSettings: PageOptions) => Promise<IPost[]>;
  getPostsCount: () => Promise<number>;

  getPost: (field: FieldName, fieldValue: string) => Promise<IPost | null>;
  createPost: (postData: CreatePostData) => Promise<CreateResult>;

  fullUpdatePost: (
    fieldName: FieldName,
    fieldValue: string,
    newPostData: UpdatePostData,
  ) => Promise<UpdateResult>;

  removePost: (fieldName: FieldName, fieldValue: string) => Promise<void>;
}

@injectable()
export class PostsRepository implements IPostsRepository {
  private readonly SLUG_WORDS_COUNT = 15;

  public constructor(@inject(DATABASE) private readonly database: IDatabase) {}

  public async getPost(field: FieldName, fieldValue: string): Promise<IPost | null> {
    const sql = this.database.connection;
    const posts = await sql<IPost[]>`
      SELECT * FROM posts.posts WHERE ${sql(field)} = ${fieldValue} LIMIT 1;
    `;

    return posts[0] ?? null;
  }

  public async getPostsCount(): Promise<number> {
    const postsCount = await this.database.connection<Array<{ postsCount: string }>>`
      SELECT count(*) as "postsCount" FROM posts.posts;
    `;

    return Number(postsCount[0].postsCount);
  }

  public async getPostsByPages({ page, limit }: PageOptions): Promise<IPost[]> {
    return this.database.connection<IPost[]>`
      SELECT *
      FROM posts.posts
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;
  }

  public async createPost(postData: CreatePostData): Promise<CreateResult> {
    const sql = this.database.connection;

    const slug = createSlug(postData.title, this.SLUG_WORDS_COUNT);
    const postDataForCreating: IPost = { ...postData, slug } as const;

    await sql`INSERT INTO posts.posts ${sql(postDataForCreating)};`;

    return { slug };
  }

  public async fullUpdatePost(
    fieldName: FieldName,
    fieldValue: string,
    newPostData: UpdatePostData,
  ): Promise<UpdateResult> {
    const sql = this.database.connection;
    const newSlug = createSlug(newPostData.title, this.SLUG_WORDS_COUNT);
    const updatePostData: Pick<IPost, 'title' | 'text' | 'slug'> = {
      ...newPostData,
      slug: newSlug,
    } as const;

    await sql`
      UPDATE posts.posts
      SET ${sql(updatePostData)}
      WHERE ${sql(fieldName)} = ${fieldValue};
    `;

    return { newSlug };
  }

  public async removePost(fieldName: string, fieldValue: string): Promise<void> {
    const sql = this.database.connection;

    await sql`DELETE FROM posts.posts WHERE ${sql(fieldName)} = ${fieldValue};`;
  }
}
