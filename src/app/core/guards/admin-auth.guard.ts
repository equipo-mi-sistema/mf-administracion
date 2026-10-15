import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user, getIdTokenResult } from '@angular/fire/auth';
import { map, take, switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export const adminAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth, { optional: true });
  const router = inject(Router);

  const redirectToLogin = () => {
    const isStandalonePort = window.location.port === '4201';
    if (isStandalonePort && environment.hostBaseUrl) {
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `${environment.hostBaseUrl}/login?returnUrl=${returnUrl}`;
    } else {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    }
    return false;
  };

  if (!auth) {
    console.warn('Firebase Auth no disponible en sistema-administracion, redirigiendo a login.');
    return redirectToLogin();
  }

  return user(auth).pipe(
    take(1),
    switchMap((firebaseUser) => {
      if (!firebaseUser) {
        return of(null);
      }
      return from(getIdTokenResult(firebaseUser, false)).pipe(
        switchMap((tokenResult) => {
          const claims = tokenResult.claims || {};
          const roleId = (claims['role_id'] as string) || '';
          const roles = (claims['roles'] as string[]) || [];

          if (roleId === 'SUPER_ADMIN' || roles.includes('SUPER_ADMIN')) {
            return of(tokenResult);
          }

          // Si el token en caché no tiene el claim, forzar refresco
          return from(getIdTokenResult(firebaseUser, true));
        })
      );
    }),
    map((tokenResult) => {
      // 1. Si no hay sesión activa en Firebase Auth, redirigir
      if (!tokenResult) {
        return redirectToLogin();
      }

      // 2. Verificar que posea rol de SUPER_ADMIN en claims
      const claims = tokenResult.claims || {};
      const roleId = (claims['role_id'] as string) || '';
      const roles = (claims['roles'] as string[]) || [];

      const isSuperAdmin = roleId === 'SUPER_ADMIN' || roles.includes('SUPER_ADMIN');

      if (!isSuperAdmin) {
        console.warn('[AdminAuthGuard] Acceso denegado: Se requiere rol SUPER_ADMIN. Rol actual:', roleId);
        return redirectToLogin();
      }

      return true;
    })
  );
};
