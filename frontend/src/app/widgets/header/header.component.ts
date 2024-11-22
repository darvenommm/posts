import { TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { SwitchThemeButtonComponent } from '@features/switch-theme-button';
import { AuthService } from '@entities/auth';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { SignOutButtonComponent } from '@features/sign-out-button';

interface Link {
  readonly text: string;
  readonly route: string[];
}

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    SwitchThemeButtonComponent,
    SignOutButtonComponent,
    TitleCasePipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  public readonly isAuthenticated = rxResource({
    loader: (): Observable<boolean> => this.authService.isAuthenticated(),
  });

  public readonly links: Link[] = [
    {
      text: 'posts',
      route: ['/posts'],
    },
    {
      text: 'create post',
      route: ['/posts/create'],
    },
  ];

  public handleUserSignOuting(): void {
    this.isAuthenticated.set(false);
  }
}
