import { Injectable, signal, computed } from '@angular/core';
import { GeographicScope } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
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
