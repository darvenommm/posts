import { getUniqueId, createSlug } from '@/helpers';
import { DATABASE, type IDatabase } from '@/database';

import type { IPost } from './types';
import type { AddDTO, UpdateDTO } from './dtos';
import type { IContainer } from '@/container';
import type { PagesPaginationDTO } from './dtos';

export const POSTS_REPOSITORY = getUniqueId();

type FieldName = 'id' | 'title' | 'slug';

export interface IPostsRepository {
  getPostByField: (field: FieldName, fieldValue: string) => Promise<IPost | null>;
  getPostsCount: () => Promise<number>;
  getPostsByPages: (paginationSettings: PagesPaginationDTO) => Promise<IPost[]>;
  addPost: (postData: AddDTO, creatorId: string) => Promise<void>;
  fullUpdatePostById: (id: string, newPostData: UpdateDTO) => Promise<void>;
  removePostById: (id: string) => Promise<void>;
}

export class PostsRepository implements IPostsRepository {
  private readonly SLUG_WORDS_COUNT = 15;

  private readonly database: IDatabase;

  public constructor(container: IContainer) {
    this.database = container[DATABASE] as IDatabase;
  }

  public async getPostByField(field: string, value: string): Promise<IPost | null> {
    const sql = this.database.connection;
    const posts = await sql<IPost[]>`
      SELECT * FROM posts.posts WHERE ${sql(field)} = ${value} LIMIT 1;
    `;

    return posts[0] ?? null;
  }

  public async getPostsCount(): Promise<number> {
    const postsCount = await this.database.connection<Array<{ postsCount: string }>>`
      SELECT count(*) as "postsCount" FROM posts.posts;
    `;

    return Number(postsCount[0].postsCount);
  }

  public async getPostsByPages({ page, limit }: PagesPaginationDTO): Promise<IPost[]> {
    return this.database.connection<IPost[]>`
      SELECT *
      FROM posts.posts
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;
  }

  public async addPost(postData: AddDTO, creatorId: string): Promise<void> {
    const sql = this.database.connection;
    const postDataForCreating: IPost = {
      ...postData,
      creatorId,
      slug: createSlug(postData.title, this.SLUG_WORDS_COUNT),
    } as const;

    await sql`INSERT INTO posts.posts ${sql(postDataForCreating)};`;
  }

  public async fullUpdatePostById(id: string, newPostData: UpdateDTO): Promise<void> {
    const sql = this.database.connection;
    const newSlug = createSlug(newPostData.title, this.SLUG_WORDS_COUNT);

    await sql`
      UPDATE posts.posts
      SET ${sql({ ...newPostData, slug: newSlug })}
      WHERE id = ${id};
    `;
  }

  public async removePostById(id: string): Promise<void> {
    await this.database.connection`DELETE FROM posts.posts WHERE id = ${id};`;
  }
}
