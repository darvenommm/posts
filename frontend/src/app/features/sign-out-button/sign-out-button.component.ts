import { Component, inject } from '@angular/core';
import { AuthService } from '@entities/auth';
import { Router } from '@angular/router';

import { ButtonComponent } from '@shared/ui/button';

@Component({
  selector: 'app-sign-out-button',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './sign-out-button.component.html',
  styleUrl: './sign-out-button.component.scss',
})
export class SignOutButtonComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public onClick(): void {
    this.authService.signOut().subscribe({
      next: (): void => {
        this.router.navigate(['/']);
      },
      error: (error): void => {
        console.error(error);
      },
    });
  }
}
