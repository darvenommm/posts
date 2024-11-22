import type { IUser } from '../auth';

export interface IPost {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly text: string;
  readonly creatorId: string;
}

interface CreatorData extends Pick<IUser, 'username'> {}

export interface PostData extends Omit<IPost, 'creatorId'> {
  readonly creator: CreatorData;
  readonly canModify: boolean;
}

export interface PageOptions {
  limit: number;
  page: number;
}

export interface CreatePostData extends Pick<IPost, 'id' | 'title' | 'text' | 'creatorId'> {}

export interface UpdatePostData extends Pick<IPost, 'title' | 'text'> {}

export interface CreateResult {
  readonly slug: string;
}

export interface UpdateResult {
  readonly newSlug: string;
}

export interface PageResult {
  readonly posts: PostData[];
  readonly pagesCount: number;
}
