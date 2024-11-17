import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { SignUpDTO, SignInDTO } from './auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;

  public signUp(dto: SignUpDTO): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/sign-up`, dto, { withCredentials: true });
  }

  public signIn(dto: SignInDTO): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/sign-in`, dto, { withCredentials: true });
  }

  public signOut(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/sign-out`, null, { withCredentials: true });
  }

  public isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>(`${this.authUrl}/is-auth`, { withCredentials: true });
  }
}
