import { Component, inject, output } from '@angular/core';
import { AuthService } from '@entities/auth';
import { PostsService } from '@entities/posts';

@Component({
  selector: 'app-sign-out-button',
  templateUrl: './sign-out-button.component.html',
  styleUrl: './sign-out-button.component.scss',
})
export class SignOutButtonComponent {
  private readonly postsService = inject(PostsService);

  public readonly authService = inject(AuthService);
  public readonly userSignOutEvent = output<void>();

  public onClick(): void {
    this.authService.signOut().subscribe({
      next: (): void => {
        this.postsService.$requireAllUpdateEvent.next();
        this.userSignOutEvent.emit();
      },
      error: console.error,
    });
  }
}
