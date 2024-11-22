import { Routes } from '@angular/router';

import { CreatePostPageComponent } from '@pages/create-post-page';
import { NotFoundPageComponent } from '@pages/not-found-page';
import { PostPageComponent } from '@pages/post-page';
import { PostsPageComponent } from '@pages/posts-page';
import { SignInPageComponent } from '@pages/sign-in-page';
import { SignUpPageComponent } from '@pages/sign-up-page';
import { authGuard } from '@entities/auth';
import { PageTemplateComponent } from '@pages/page-template';
import { ModifyPostPageComponent } from '@pages/modify-post-page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'posts',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'sign-up',
        component: SignUpPageComponent,
        title: 'Sign up',
      },
      {
        path: 'sign-in',
        component: SignInPageComponent,
        title: 'Sign in',
      },
    ],
  },
  {
    path: '',
    component: PageTemplateComponent,
    children: [
      {
        path: 'posts',
        children: [
          {
            path: '',
            component: PostsPageComponent,
            title: 'Posts',
          },
          {
            path: 'create',
            component: CreatePostPageComponent,
            title: 'Create post',
            canActivate: [authGuard],
          },
          {
            path: ':postSlug/modify',
            component: ModifyPostPageComponent,
            title: 'Modify post',
          },
          {
            path: ':postSlug',
            component: PostPageComponent,
            title: 'Post',
          },
        ],
      },
      {
        path: '**',
        component: NotFoundPageComponent,
        title: 'Not found page',
      },
    ],
  },
];
