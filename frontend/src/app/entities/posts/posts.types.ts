export interface Creator {
  readonly username: string;
}

export interface Post {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly text: string;
  readonly creator: Creator;
}

export interface PostWithCanModify extends Post {
  readonly canModify: boolean;
}

export interface CreatePostDTO {
  readonly id: string;
  readonly title: string;
  readonly text: string;
}

export interface UpdatePostDTO {
  readonly title: string;
  readonly text: string;
}

export interface PostsPages {
  readonly pagesCount: number;
  readonly posts: Post[];
}

export interface PostsPagesOptions {
  readonly pageNumber?: number;
  readonly limit?: number;
}
