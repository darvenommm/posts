import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { CreatePostDTO, PostsPages, PostsPagesOptions, PostWithCanModify } from './posts.types';

@Injectable()
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly postsUrl = `${environment.apiUrl}/posts`;

  public getPost(postSlug: string): Observable<PostWithCanModify> {
    return this.http.get<PostWithCanModify>(`${this.postsUrl}/${postSlug}`);
  }

  public getPosts({ pageNumber, limit }: PostsPagesOptions = {}): Observable<PostsPages> {
    return this.http.get<PostsPages>(this.postsUrl, {
      params: { page: pageNumber ?? 1, limit: limit ?? 10 },
    });
  }

  public createPost(createPostDTO: CreatePostDTO): Observable<null> {
    return this.http.post<null>(this.postsUrl, createPostDTO);
  }
}
