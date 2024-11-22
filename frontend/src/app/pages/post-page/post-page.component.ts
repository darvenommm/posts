import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PostWithCanModify, PostsService } from '@entities/posts';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-page',
  imports: [RouterLink],
  providers: [PostsService],
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.scss',
})
export class PostPageComponent {
  private readonly postsService = inject(PostsService);

  public readonly slug = input.required<string>({ alias: 'postSlug' });

  public readonly post = rxResource({
    loader: (): Observable<PostWithCanModify> => this.postsService.getPost(this.slug()),
  });
}
