import { Component, inject, OnInit } from '@angular/core';

import { PostsService } from '@entities/posts/posts.service';
import { Post } from '@entities/posts/posts.types';

export const enum ListPostsState {
  LOADING = 'loading',
  ERROR = 'error',
  SUCCESS = 'success',
}

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [],
  providers: [PostsService],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent implements OnInit {
  private readonly postsService = inject(PostsService);

  public state: ListPostsState = ListPostsState.LOADING;
  public pageCount: number = NaN;
  public posts: Post[] = [];

  public ngOnInit(): void {
    this.postsService.getPosts().subscribe({
      next: (postsPage): void => {
        this.state = ListPostsState.SUCCESS;
        this.posts = postsPage.posts;
      },
      error: (error): void => {
        this.state = ListPostsState.ERROR;
        console.error(error);
      },
    });
  }
}
