import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
        router.navigate(['/auth/sign-up']);
      }

      return throwError(() => error);
    }),
  );
};
