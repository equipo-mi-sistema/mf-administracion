import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const adminAuthGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(Auth, { optional: true });
  const hostLoginUrl = 'http://localhost:4200/login';

  if (!auth) {
    console.error('Firebase Auth no disponible en sistema-administracion');
    window.location.href = hostLoginUrl;
    return false;
  }

  return user(auth).pipe(
    take(1),
    map((firebaseUser) => {
      // 1. Si no hay sesión activa en Firebase Auth, redirigir al Login del Host
      if (!firebaseUser) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${hostLoginUrl}?returnUrl=${returnUrl}`;
        return false;
      }

      // 2. Usuario autenticado: permitir acceso directamente
      return true;
    })
  );
};
