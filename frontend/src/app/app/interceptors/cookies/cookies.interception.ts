import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST_CONTEXT } from '@angular/core';

type RequestContext = { session: string | null };

export const cookiesInterceptor: HttpInterceptorFn = (request, next) => {
  const requestContext = inject<null | RequestContext>(REQUEST_CONTEXT);

  if (isPlatformServer(inject(PLATFORM_ID)) && requestContext) {
    const requestWithCookie = request.clone({
      setHeaders: {
        cookie: requestContext.session ?? '',
      },
    });

    return next(requestWithCookie);
  }

  return next(request);
};
