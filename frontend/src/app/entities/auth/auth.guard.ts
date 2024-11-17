import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { switchMap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    switchMap(async (isAuthenticated) => {
      if (!isAuthenticated) {
        await router.navigate(['/auth/sign-up']);

        return false;
      }

      return true;
    }),
  );
};
