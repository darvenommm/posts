import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { Post, PostsPages, PostsService } from '@entities/posts';

@Component({
  selector: 'app-posts-list',
  imports: [],
  providers: [PostsService],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent {
  private readonly postsService = inject(PostsService);

  public readonly postsPages = rxResource({
    loader: (): Observable<PostsPages> => this.postsService.getPosts(),
  });
}
