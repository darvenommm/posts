import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostsListComponent } from '@widgets/posts-list/posts-list.component';
import { SwitchThemeButtonComponent } from '@features/switch-theme-button/switch-theme-button.component';
import { SignOutButtonComponent } from '../../features/sign-out-button/sign-out-button.component';

@Component({
  selector: 'app-posts-page',
  imports: [PostsListComponent, SwitchThemeButtonComponent, RouterLink, SignOutButtonComponent],
  templateUrl: './posts-page.component.html',
  styleUrl: './posts-page.component.scss',
})
export class PostsPageComponent {}
