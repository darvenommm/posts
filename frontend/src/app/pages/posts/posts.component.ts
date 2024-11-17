import { Component } from '@angular/core';
import { SignOutButtonComponent } from '@features/sign-out-button';
import { PostsListComponent } from '../../widgets/posts-list/posts-list.component';

@Component({
  selector: 'app-all-posts',
  standalone: true,
  imports: [SignOutButtonComponent, PostsListComponent],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss',
})
export class PostsComponent {}
