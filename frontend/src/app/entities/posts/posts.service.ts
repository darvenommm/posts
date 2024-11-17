import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { PostsPages } from './posts.types';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly postsUrl = `${environment.apiUrl}/posts`;

  public getPosts(): Observable<PostsPages> {
    return this.http.get<PostsPages>(this.postsUrl, { withCredentials: true });
  }
}
