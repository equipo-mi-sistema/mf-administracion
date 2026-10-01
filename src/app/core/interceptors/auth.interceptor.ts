import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let auth: Auth | null = null;
  try {
    auth = inject(Auth);
  } catch {
    // Si Auth no está provisto en standalone testing, continuar
  }

  const currentUser = auth?.currentUser;
  if (!currentUser) {
    return next(req);
  }

  return from(currentUser.getIdToken()).pipe(
    switchMap((token) => {
      if (token) {
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(cloned);
      }
      return next(req);
    })
  );
};
