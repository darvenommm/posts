import { Component, inject, output } from '@angular/core';
import { AuthService } from '@entities/auth';

@Component({
  selector: 'app-sign-out-button',
  templateUrl: './sign-out-button.component.html',
  styleUrl: './sign-out-button.component.scss',
})
export class SignOutButtonComponent {
  public readonly authService = inject(AuthService);
  public readonly signOut = output<void>();

  public onClick(): void {
    this.authService.signOut().subscribe({
      next: () => {
        this.signOut.emit();
        console.log('here');
      },
      error: console.error,
    });
  }
}
