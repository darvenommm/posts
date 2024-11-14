import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { SignUpDTO, SignInDTO } from './auth.types';

@Injectable()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public signUp(dto: SignUpDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/sign-up`, dto);
  }

  public signIn(dto: SignInDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/sing-in`, dto);
  }

  public signOut(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/sign-out`, null);
  }
}
