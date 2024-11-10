import { TablesOwner } from '@/base/tablesOwner';
import { getUniqueId } from '@/helpers';
import { DATABASE, type IDatabase } from '@/database';
import { TITLE_CONSTRAINTS, TEXT_CONSTRAINTS } from './constraints';

import type { IContainer } from '@/container';

export const POSTS_TABLES_OWNER = getUniqueId();

export class PostsTablesOwner extends TablesOwner {
  private readonly database: IDatabase;

  public constructor(container: IContainer) {
    super();
    this.database = container[DATABASE] as IDatabase;
  }

  public async create(): Promise<void> {
    const sql = this.database.connection;

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS posts.posts (
        id UUID PRIMARY KEY,
        title VARCHAR(${TITLE_CONSTRAINTS.maxLength}) NOT NULL,
        slug TEXT NOT NULL,
        text TEXT NOT NULL,
        "creatorId" UUID REFERENCES posts.users (id) ON DELETE CASCADE ON UPDATE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "postsTextLength" CHECK (LENGTH(text) <= ${TEXT_CONSTRAINTS.maxLength})
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "indexPostsSlug" ON posts.posts USING BTREE (slug);
      CREATE INDEX IF NOT EXISTS "indexPostsCreatedAt" ON posts.posts USING BTREE ("createdAt");
    `);
  }

  public async clean(): Promise<void> {
    await this.database.connection`DELETE FROM posts.posts;`;
  }
}
