import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Post } from './posts.types';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly http = inject(HttpClient);

  public getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('');
  }
}
