import '@abraham/reflection';

import { inject, injectable } from 'inversify';

import { TablesOwner } from '@/base/tablesOwner';
import { DATABASE, type IDatabase } from '@/database';
import { TITLE_CONSTRAINTS, TEXT_CONSTRAINTS } from './constraints';

export const POSTS_TABLES_OWNER = Symbol('PostsTablesOwner');

@injectable()
export class PostsTablesOwner extends TablesOwner {
  public constructor(@inject(DATABASE) private readonly database: IDatabase) {
    super();
  }

  public async create(): Promise<void> {
    return this.database.useConnection(async (connection): Promise<void> => {
      await connection.query(`
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
    });
  }
}
