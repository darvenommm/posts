import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { PostWithCanModify, PostsService } from '@entities/posts';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-page',
  imports: [RouterLink],
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.scss',
})
export class PostPageComponent {
  private readonly postsService = inject(PostsService);
  private readonly router = inject(Router);

  public readonly slug = input.required<string>({ alias: 'postSlug' });

  public readonly post = rxResource({
    loader: (): Observable<PostWithCanModify> => this.postsService.getPost(this.slug()),
  });

  public deletePost(slug: string): void {
    this.postsService.deletePost(slug).subscribe({
      next: (): void => void this.router.navigateByUrl('/'),
      error: console.error,
    });
  }
}
