import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, catchError } from 'rxjs';
import { Role, Permission } from '../models/admin.model';

const INITIAL_PERMISSIONS: Permission[] = [
  { id: 'perm_1', codigo: 'USER_VIEW', nombre: 'Ver Usuarios', descripcion: 'Consultar listado y detalles de usuarios', modulo: 'USUARIOS' },
  { id: 'perm_2', codigo: 'USER_CREATE', nombre: 'Crear Usuarios', descripcion: 'Registrar nuevos usuarios en el sistema', modulo: 'USUARIOS' },
  { id: 'perm_3', codigo: 'USER_EDIT', nombre: 'Editar Usuarios', descripcion: 'Modificar datos y scopes geográficos', modulo: 'USUARIOS' },
  { id: 'perm_4', codigo: 'USER_DELETE', nombre: 'Eliminar Usuarios', descripcion: 'Dar de baja o suspender usuarios', modulo: 'USUARIOS' },
  { id: 'perm_5', codigo: 'ROLE_MANAGE', nombre: 'Gestionar Roles', descripcion: 'Crear, editar y asignar matriz de permisos', modulo: 'ROLES' },
  { id: 'perm_6', codigo: 'AUDIT_VIEW', nombre: 'Ver Auditoría', descripcion: 'Revisar logs de accesos y cambios en ABAC', modulo: 'AUDITORIA' },
  { id: 'perm_7', codigo: 'CONFIG_ACCESS', nombre: 'Configuración Global', descripcion: 'Ajustes del tenant y conectores', modulo: 'CONFIGURACION' }
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'rol_admin_gral',
    nombre: 'Administrador General',
    descripcion: 'Control total de la plataforma y administración de seguridad',
    permisos: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE', 'ROLE_MANAGE', 'AUDIT_VIEW', 'CONFIG_ACCESS'],
    esSistema: true
  },
  {
    id: 'rol_coordinador',
    nombre: 'Coordinador Zonal',
    descripcion: 'Gestión de operadores dentro de su ámbito geográfico asignado',
    permisos: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT'],
    esSistema: false
  },
  {
    id: 'rol_operador',
    nombre: 'Operador de Campo',
    descripcion: 'Acceso a operaciones básicas sin facultades de creación de cuentas',
    permisos: ['USER_VIEW'],
    esSistema: false
  },
  {
    id: 'rol_auditor',
    nombre: 'Auditor de Calidad',
    descripcion: 'Consulta de registros, usuarios y registros de auditoría',
    permisos: ['USER_VIEW', 'AUDIT_VIEW'],
    esSistema: false
  }
];

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private firestore = inject(Firestore, { optional: true });
  private mockRoles$ = new BehaviorSubject<Role[]>(INITIAL_ROLES);
  private mockPerms$ = new BehaviorSubject<Permission[]>(INITIAL_PERMISSIONS);

  getRoles(): Observable<Role[]> {
    if (this.firestore) {
      try {
        const rolesCol = collection(this.firestore, 'roles');
        return (collectionData(rolesCol, { idField: 'id' }) as Observable<Role[]>).pipe(
          catchError((err) => {
            console.warn('[Firestore] Error al consultar /roles, usando fallback:', err);
            return this.mockRoles$.asObservable();
          })
        );
      } catch (e) {
        console.warn('[Firestore] No conectado, usando roles locales:', e);
      }
    }
    return this.mockRoles$.asObservable();
  }

  getPermissions(): Observable<Permission[]> {
    if (this.firestore) {
      try {
        const permsCol = collection(this.firestore, 'permissions');
        return (collectionData(permsCol, { idField: 'id' }) as Observable<Permission[]>).pipe(
          catchError((err) => {
            console.warn('[Firestore] Error al consultar /permissions, usando fallback:', err);
            return this.mockPerms$.asObservable();
          })
        );
      } catch (e) {
        console.warn('[Firestore] No conectado, usando permisos locales:', e);
      }
    }
    return this.mockPerms$.asObservable();
  }

  async createRole(role: Omit<Role, 'id'>): Promise<string> {
    if (this.firestore) {
      try {
        const rolesCol = collection(this.firestore, 'roles');
        const docRef = await addDoc(rolesCol, role);
        return docRef.id;
      } catch (err) {
        console.warn('[Firestore] Error creando rol en la nube:', err);
      }
    }

    const newId = 'rol_' + Date.now();
    const newRole: Role = { id: newId, ...role };
    this.mockRoles$.next([...this.mockRoles$.value, newRole]);
    return newId;
  }

  async updateRole(id: string, role: Partial<Role>): Promise<void> {
    if (this.firestore) {
      try {
        const roleDoc = doc(this.firestore, `roles/${id}`);
        await updateDoc(roleDoc, role);
        return;
      } catch (err) {
        console.warn('[Firestore] Error actualizando rol en la nube:', err);
      }
    }

    const current = this.mockRoles$.value;
    const index = current.findIndex(r => r.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...role };
      this.mockRoles$.next([...current]);
    }
  }

  async deleteRole(id: string): Promise<void> {
    if (this.firestore) {
      try {
        const roleDoc = doc(this.firestore, `roles/${id}`);
        await deleteDoc(roleDoc);
        return;
      } catch (err) {
        console.warn('[Firestore] Error eliminando rol en la nube:', err);
      }
    }

    const current = this.mockRoles$.value.filter(r => r.id !== id);
    this.mockRoles$.next(current);
  }
}
