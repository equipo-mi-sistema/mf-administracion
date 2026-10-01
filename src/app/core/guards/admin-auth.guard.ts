import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Auth, user, getIdTokenResult } from '@angular/fire/auth';
import { map, switchMap, take } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { PermissionService } from '../services/permission.service';

export const adminAuthGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(Auth, { optional: true });
  const permissionService = inject(PermissionService);

  // URL del Host para redirigir si no hay sesión
  const hostLoginUrl = 'http://localhost:4200/login';

  if (!auth) {
    console.error('Firebase Auth no disponible en sistema-administracion');
    window.location.href = hostLoginUrl;
    return false;
  }

  return user(auth).pipe(
    take(1),
    switchMap((firebaseUser) => {
      // 1. Si no hay sesión activa en Firebase Auth, redirigir al Login del Host
      if (!firebaseUser) {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${hostLoginUrl}?returnUrl=${returnUrl}`;
        return of(false);
      }

      // 2. Si hay sesión activa, extraer y evaluar Custom Claims del JWT
      return from(getIdTokenResult(firebaseUser, false)).pipe(
        map((tokenResult) => {
          const claims = tokenResult.claims;
          const roles = (claims['roles'] as string[]) || [];
          const permissions = (claims['permissions'] as string[]) || [];
          const modules = (claims['modules'] as string[]) || [];

          const hasAdminRole = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
          const hasAdminPermission = permissions.includes('ROLE_MANAGE') || permissions.includes('USER_VIEW');
          const hasAdminModule = modules.includes('ADMINISTRACION') || modules.includes('ADMIN');

          // Si cuenta con roles, permisos o módulos administrativos
          if (hasAdminRole || hasAdminPermission || hasAdminModule) {
            return true;
          }

          // Si el usuario está autenticado pero no tiene privilegios asignados
          console.warn('Usuario autenticado pero sin rol de administración:', firebaseUser.email);
          alert('Acceso restringido: Tu cuenta Google no cuenta con roles ni permisos de administrador.');
          window.location.href = 'http://localhost:4200/';
          return false;
        })
      );
    })
  );
};
