import { Injectable, signal, computed, inject } from '@angular/core';
import { Auth, onAuthStateChanged, getIdTokenResult } from '@angular/fire/auth';
import { GeographicScope } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly auth = inject(Auth, { optional: true });

  // Lista de permisos reactiva del usuario en sesión
  private currentPermissions = signal<string[]>([
    'USER_VIEW',
    'USER_CREATE',
    'USER_EDIT',
    'USER_DELETE',
    'ROLE_MANAGE'
  ]);

  // Ámbito geográfico del usuario en sesión (ABAC)
  private currentScope = signal<GeographicScope>({
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    comunas: ['*']
  });

  // Lectura pública sólo de lectura
  readonly permissions = this.currentPermissions.asReadonly();
  readonly scope = this.currentScope.asReadonly();

  constructor() {
    this.initAuthSessionSync();
  }

  /**
   * Sincroniza la sesión unificada de Firebase Auth proveniente del Host
   * y mapea los Custom Claims al sistema de permisos ABAC del microfrontend.
   */
  private initAuthSessionSync(): void {
    if (!this.auth) return;

    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await getIdTokenResult(firebaseUser, false);
          const claims = tokenResult.claims;

          if (claims['permissions'] && Array.isArray(claims['permissions'])) {
            this.setPermissions(claims['permissions'] as string[]);
          } else if (claims['roles'] && Array.isArray(claims['roles'])) {
            const roles = claims['roles'] as string[];
            if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) {
              this.setPermissions(['SUPER_ADMIN', 'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE', 'ROLE_MANAGE']);
            }
          }

          if (claims['scope'] && typeof claims['scope'] === 'object') {
            this.setScope(claims['scope'] as GeographicScope);
          }
        } catch (error) {
          console.error('Error al sincronizar claims en Microfrontend Admin:', error);
        }
      }
    });
  }

  // Permite al Host o al Login actualizar los permisos
  setPermissions(perms: string[]) {
    this.currentPermissions.set(perms);
  }

  setScope(scope: GeographicScope) {
    this.currentScope.set(scope);
  }

  // Verifica si el usuario tiene un permiso específico (o SUPER_ADMIN)
  hasPermission(code: string): boolean {
    const list = this.currentPermissions();
    return list.includes('SUPER_ADMIN') || list.includes(code);
  }

  // Verifica si tiene al menos uno de los permisos provistos
  hasAnyPermission(codes: string[]): boolean {
    const list = this.currentPermissions();
    if (list.includes('SUPER_ADMIN')) return true;
    return codes.some(code => list.includes(code));
  }

  // Comprobación ABAC: ¿Puede el usuario operar sobre la ciudad y comuna indicada?
  hasScopeAccess(ciudad: string, comuna?: string): boolean {
    const s = this.currentScope();
    if (s.comunas.includes('*') && (!s.ciudad || s.ciudad.toLowerCase() === ciudad.toLowerCase())) {
      return true;
    }
    if (s.ciudad.toLowerCase() !== ciudad.toLowerCase()) {
      return false;
    }
    if (!comuna) return true;
    return s.comunas.includes('*') || s.comunas.some(c => c.toLowerCase() === comuna.toLowerCase());
  }
}
