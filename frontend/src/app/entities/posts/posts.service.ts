import { inject, Injectable, REQUEST } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { CreatePostDTO, PostsPages } from './posts.types';

@Injectable()
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly postsUrl = `${environment.apiUrl}/posts`;

  public getPosts(): Observable<PostsPages> {
    return this.http.get<PostsPages>(this.postsUrl);
  }

  public createPost(createPostDTO: CreatePostDTO): Observable<null> {
    return this.http.post<null>(this.postsUrl, createPostDTO);
  }
}
