import { Routes } from '@angular/router';

import { FormPageComponent } from '@pages/form-page';
import { SignUpPageComponent } from '@pages/sign-up-page';
import { SignInPageComponent } from '@pages/sign-in-page';
import { NotFoundPageComponent } from '@pages/not-found-page';
import { PostsComponent } from '@pages/posts';
import { authGuard } from '@entities/auth';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  },
  {
    path: 'posts',
    component: PostsComponent,
    title: 'posts',
    // canActivate: [authGuard],
  },
  {
    path: 'auth',
    component: FormPageComponent,
    children: [
      {
        path: 'sign-up',
        component: SignUpPageComponent,
        title: 'Sign Up',
      },
      {
        path: 'sign-in',
        component: SignInPageComponent,
        title: 'Sign In',
      },
    ],
  },
  {
    path: '**',
    component: NotFoundPageComponent,
  },
];
