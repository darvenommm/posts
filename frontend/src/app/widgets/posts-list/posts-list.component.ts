import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import { Post, PostsPagesOptions, PostsPages, PostsService } from '@entities/posts';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-posts-list',
  imports: [RouterLink],
  providers: [PostsService],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent {
  private readonly postsService = inject(PostsService);

  public currentPage = signal<number>(1);

  public readonly postsPages = rxResource({
    request: (): PostsPagesOptions => ({ pageNumber: this.currentPage() }),
    loader: ({ request: options }): Observable<PostsPages> => this.postsService.getPosts(options),
  });

  public readonly posts = computed((): Post[] =>
    this.postsPages.hasValue() ? this.postsPages.value()!.posts : [],
  );

  public readonly pagesCount = computed((): number =>
    this.postsPages.hasValue() ? this.postsPages.value()!.pagesCount : 1,
  );

  public handleDecrementClick(): void {
    if (this.currentPage() <= 1) {
      return;
    }

    this.currentPage.update((previous): number => previous - 1);
  }

  public handleIncrementClick(): void {
    if (!this.postsPages.hasValue() || this.currentPage() >= this.pagesCount()) {
      return;
    }

    this.currentPage.update((previous): number => previous + 1);
  }
}
