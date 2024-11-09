import type { IUser } from '../auth';

export interface IPost {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly text: string;
  readonly creatorId: string;
}

interface CreatorData extends Pick<IUser, 'username'> {}

export interface PostForRendering extends Omit<IPost, 'creatorId'> {
  readonly creator: CreatorData;
}

export interface PagesPaginationResult {
  readonly posts: PostForRendering[];
  readonly pagesCount: number;
}

export interface PostForRenderingWithPermission extends PostForRendering {
  readonly canModify: boolean;
}
