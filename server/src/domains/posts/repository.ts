import '@abraham/reflection';

import { default as format } from 'pg-format';
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
import type { QueryResult } from 'pg';

export const POSTS_REPOSITORY = Symbol('PostsRepository');

type FieldName = 'id' | 'title' | 'slug';

export interface IPostsRepository {
  getPostsByPages: (paginationSettings: PageOptions) => Promise<IPost[]>;
  getPostsCount: () => Promise<number>;

  getPost: (fieldName: FieldName, fieldValue: string) => Promise<IPost | null>;
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

  public async getPost(fieldName: FieldName, fieldValue: string): Promise<IPost | null> {
    const posts = await this.database.useConnection<QueryResult<IPost>>(async (connection) => {
      return await connection.query(`SELECT * FROM posts.posts WHERE ${fieldName} = $1 LIMIT 1`, [
        fieldValue,
      ]);
    });

    return posts.rows[0] ?? null;
  }

  public async getPostsCount(): Promise<number> {
    const postsInfo = await this.database.useConnection<QueryResult<{ postsCount: string }>>(
      async (connection) => {
        return await connection.query('SELECT count(*) as "postsCount" FROM posts.posts');
      },
    );

    return Number(postsInfo.rows[0].postsCount);
  }

  public async getPostsByPages({ page, limit }: PageOptions): Promise<IPost[]> {
    const posts = await this.database.useConnection<QueryResult<IPost>>(async (connection) => {
      return await connection.query(
        `
          SELECT *
          FROM posts.posts
          ORDER BY "createdAt" DESC
          LIMIT $1 OFFSET $2
        `,
        [limit, (page - 1) * limit],
      );
    });

    return posts.rows;
  }

  public async createPost(postData: CreatePostData): Promise<CreateResult> {
    const slug = createSlug(postData.title, this.SLUG_WORDS_COUNT);
    const creatingData: IPost = { ...postData, slug } as const;
    const parameters = [
      [
        creatingData.id,
        creatingData.title,
        creatingData.slug,
        creatingData.text,
        creatingData.creatorId,
      ],
    ];

    await this.database.useConnection(async (connection) => {
      await connection.query(
        format(
          'INSERT INTO posts.posts (id, title, slug, text, "creatorId") VALUES %L',
          parameters,
        ),
      );
    });

    return { slug };
  }

  public async fullUpdatePost(
    fieldName: FieldName,
    fieldValue: string,
    newPostData: UpdatePostData,
  ): Promise<UpdateResult> {
    const newSlug = createSlug(newPostData.title, this.SLUG_WORDS_COUNT);
    const updatePostData: Pick<IPost, 'title' | 'text' | 'slug'> = {
      ...newPostData,
      slug: newSlug,
    } as const;

    await this.database.useConnection(async (connection) => {
      await connection.query(
        `UPDATE posts.posts SET title = $1, slug = $2, text = $3 WHERE ${fieldName} = $4`,
        [updatePostData.title, updatePostData.slug, updatePostData.text, fieldValue],
      );
    });

    return { newSlug };
  }

  public async removePost(fieldName: string, fieldValue: string): Promise<void> {
    return this.database.useConnection(async (connection) => {
      await connection.query(`DELETE FROM posts.posts WHERE ${fieldName} = $1`, [fieldValue]);
    });
  }
}
