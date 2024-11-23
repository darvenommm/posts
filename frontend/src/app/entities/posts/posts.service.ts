import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  CreatePostDTO,
  PostsPages,
  PostsPagesOptions,
  PostWithCanModify,
  UpdatePostDTO,
  CreateResult,
  UpdateResult,
} from './posts.types';

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

  public createPost(createPostDTO: CreatePostDTO): Observable<CreateResult> {
    return this.http.post<CreateResult>(this.postsUrl, createPostDTO);
  }

  public updatePost(slug: string, updatePostDTO: UpdatePostDTO): Observable<UpdateResult> {
    return this.http.put<UpdateResult>(`${this.postsUrl}/${slug}`, updatePostDTO);
  }
}
