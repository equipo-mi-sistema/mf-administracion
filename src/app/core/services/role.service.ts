import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc 
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, of, catchError } from 'rxjs';
import { Role, RolePermissionsMap, Permission } from '../models/admin.model';
import { AuditService } from './audit.service';
import { AuthService } from '../auth/auth.service';

export interface MicroappDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  permissions: { code: string; label: string; description: string }[];
}

export const ECOSYSTEM_MICROAPPS: MicroappDefinition[] = [
  {
    id: 'administracion',
    name: 'Administración y Directorio',
    icon: 'shield',
    description: 'Control de usuarios, roles, equipos, auditoría y disponibilidad del sistema',
    permissions: [
      { code: 'users:manage', label: 'Gestión de Usuarios', description: 'Crear, editar y desactivar miembros del equipo' },
      { code: 'roles:manage', label: 'Gestión de Roles', description: 'Crear roles y configurar la matriz de permisos globales' },
      { code: 'audit:view', label: 'Visualización de Auditoría', description: 'Consultar logs inmutables con trazabilidad IP' },
      { code: 'killswitch:manage', label: 'Gobernanza Kill-Switch', description: 'Activar o suspender microfrontends en tiempo real' }
    ]
  },
  {
    id: 'mapeo',
    name: 'Mapeo Territorial y Votantes',
    icon: 'map',
    description: 'Red electoral, geolocalización por comunas y jerarquía líder-votante',
    permissions: [
      { code: 'voters:read', label: 'Consultar Votantes', description: 'Visualizar registros de votantes y mapas de calor' },
      { code: 'voters:write', label: 'Registrar/Editar Votantes', description: 'Añadir y actualizar datos de contacto de votantes' },
      { code: 'territory:manage', label: 'Gestionar Territorio', description: 'Asignar comunas, barrios y mesas de votación' }
    ]
  },
  {
    id: 'gestion',
    name: 'Casos Ciudadanos v2',
    icon: 'users',
    description: 'Recepción, seguimiento y categorización de solicitudes ciudadanas',
    permissions: [
      { code: 'cases:read', label: 'Consultar Casos', description: 'Revisar solicitudes comunitarias y estado de atención' },
      { code: 'cases:create', label: 'Crear Casos', description: 'Radicar nuevas peticiones ciudadanas' },
      { code: 'cases:manage', label: 'Gestionar y Cerrar', description: 'Asignar responsables, notas y resolución final' }
    ]
  },
  {
    id: 'asistencia',
    name: 'Registro de Asistencia',
    icon: 'calendar',
    description: 'Control de asistencia en eventos comunitarios vinculado a votantes',
    permissions: [
      { code: 'events:read', label: 'Consultar Eventos', description: 'Ver reuniones y estadísticas de concurrencia' },
      { code: 'events:register', label: 'Registrar Asistentes', description: 'Toma rápida de asistencia presencial' }
    ]
  },
  {
    id: 'transporte',
    name: 'Logística y GPS PWA',
    icon: 'truck',
    description: 'Rutas, vehículos y rastreo en tiempo real para la jornada electoral',
    permissions: [
      { code: 'routes:view', label: 'Ver Rutas Asignadas', description: 'Consultar trayectos y móviles autorizados' },
      { code: 'gps:track', label: 'Rastreo en Tiempo Real', description: 'Transmitir y visualizar coordenadas de los móviles' }
    ]
  },
  {
    id: 'conteo',
    name: 'Testigos y E-14',
    icon: 'chart',
    description: 'Captura fotográfica de formularios E-14 y consolidación de escrutinio',
    permissions: [
      { code: 'tally:view', label: 'Ver Consolidado E-14', description: 'Consultar resultados acumulados de mesas' },
      { code: 'e14:upload', label: 'Cargar Formulario E-14', description: 'Subir fotografía y datos de mesa de votación' },
      { code: 'e14:verify', label: 'Verificar Escrutinio', description: 'Aprobar o auditar actas E-14 registradas' }
    ]
  }
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'SUPER_ADMIN',
    role_id: 'SUPER_ADMIN',
    role_name: 'Super Administrador',
    nombre: 'Super Administrador',
    descripcion: 'Control absoluto del ecosistema Polyrepo y asignación de políticas de seguridad',
    created_by: 'SYSTEM',
    esSistema: true,
    permissions: {
      administracion: ['users:manage', 'roles:manage', 'audit:view', 'killswitch:manage'],
      mapeo: ['voters:read', 'voters:write', 'territory:manage'],
      gestion: ['cases:read', 'cases:create', 'cases:manage'],
      asistencia: ['events:read', 'events:register'],
      transporte: ['routes:view', 'gps:track'],
      conteo: ['tally:view', 'e14:upload', 'e14:verify']
    },
    permisos: ['users:manage', 'roles:manage', 'audit:view', 'killswitch:manage', 'voters:read', 'voters:write', 'territory:manage', 'cases:read', 'cases:create', 'cases:manage', 'events:read', 'events:register', 'routes:view', 'gps:track', 'tally:view', 'e14:upload', 'e14:verify', 'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE', 'ROLE_MANAGE', 'AUDIT_VIEW']
  },
  {
    id: 'TEAM_OWNER',
    role_id: 'TEAM_OWNER',
    role_name: 'Dueño de Equipo',
    nombre: 'Dueño de Equipo',
    descripcion: 'Líder del equipo territorial con potestad para invitar miembros y gestionar territorio',
    created_by: 'SUPER_ADMIN',
    esSistema: true,
    permissions: {
      administracion: ['users:manage', 'audit:view'],
      mapeo: ['voters:read', 'voters:write', 'territory:manage'],
      gestion: ['cases:read', 'cases:create', 'cases:manage'],
      asistencia: ['events:read', 'events:register'],
      transporte: ['routes:view'],
      conteo: ['tally:view', 'e14:upload']
    },
    permisos: ['users:manage', 'voters:read', 'voters:write', 'territory:manage', 'cases:read', 'cases:create', 'events:read', 'events:register', 'USER_VIEW', 'USER_CREATE']
  },
  {
    id: 'MEMBER',
    role_id: 'MEMBER',
    role_name: 'Miembro Operativo',
    nombre: 'Miembro Operativo',
    descripcion: 'Operador de campo para registro de votantes y atención ciudadana',
    created_by: 'SUPER_ADMIN',
    esSistema: true,
    permissions: {
      administracion: [],
      mapeo: ['voters:read', 'voters:write'],
      gestion: ['cases:read', 'cases:create'],
      asistencia: ['events:register'],
      transporte: ['routes:view'],
      conteo: ['e14:upload']
    },
    permisos: ['voters:read', 'voters:write', 'cases:read', 'cases:create', 'events:register', 'USER_VIEW']
  }
];

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private firestore = inject(Firestore, { optional: true });
  private auditService = inject(AuditService);
  private authService = inject(AuthService);
  private mockRoles$ = new BehaviorSubject<Role[]>(INITIAL_ROLES);

  getMicroapps(): MicroappDefinition[] {
    return ECOSYSTEM_MICROAPPS;
  }

  getRoles(): Observable<Role[]> {
    if (this.firestore) {
      try {
        const rolesCol = collection(this.firestore, 'roles');
        return (collectionData(rolesCol, { idField: 'id' }) as Observable<Role[]>).pipe(
          catchError((err) => {
            console.warn('[RoleService] Fallo al leer /roles, usando roles locales:', err);
            return this.mockRoles$.asObservable();
          })
        );
      } catch (e) {
        console.warn('[RoleService] No conectado, usando roles locales:', e);
      }
    }
    return this.mockRoles$.asObservable();
  }

  // Compatibilidad con componentes legados
  getPermissions(): Observable<Permission[]> {
    const list: Permission[] = [];
    ECOSYSTEM_MICROAPPS.forEach(m => {
      m.permissions.forEach(p => {
        list.push({
          id: p.code,
          codigo: p.code,
          nombre: p.label,
          descripcion: p.description,
          modulo: m.id.toUpperCase() as any
        });
      });
    });
    return of(list);
  }

  async createRole(roleData: Partial<Role>): Promise<string> {
    const isSuperAdmin = this.authService.isSuperAdmin();
    if (!isSuperAdmin) {
      await this.auditService.logEvent({
        action: 'UNAUTHORIZED_ROLE_CREATE_ATTEMPT',
        target_id: roleData.role_name || roleData.nombre || 'UNKNOWN',
        new_state: { error: '403 Forbidden - Solo SUPER_ADMIN puede crear roles' }
      });
      throw new Error('403 Forbidden: Únicamente un SUPER_ADMIN puede crear Roles Globales.');
    }

    const role_id = 'rol_' + (roleData.role_name || roleData.nombre || '').toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    const newRole: Role = {
      id: role_id,
      role_id,
      role_name: roleData.role_name || roleData.nombre || 'Nuevo Rol',
      nombre: roleData.role_name || roleData.nombre || 'Nuevo Rol',
      descripcion: roleData.descripcion || '',
      created_by: this.authService.currentUser()?.uid || 'SUPER_ADMIN',
      permissions: roleData.permissions || {
        administracion: [],
        mapeo: ['voters:read'],
        gestion: ['cases:read'],
        asistencia: [],
        transporte: [],
        conteo: []
      },
      permisos: roleData.permisos || ['voters:read', 'cases:read'],
      esSistema: false
    };

    if (this.firestore) {
      try {
        const docRef = doc(this.firestore, `roles/${role_id}`);
        await setDoc(docRef, newRole);
      } catch (err) {
        console.warn('[RoleService] Error al guardar rol en Firestore:', err);
      }
    }

    this.mockRoles$.next([...this.mockRoles$.value, newRole]);

    await this.auditService.logEvent({
      action: 'ROLE_CREATE',
      target_id: role_id,
      previous_state: null,
      new_state: newRole
    });

    return role_id;
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<void> {
    const isSuperAdmin = this.authService.isSuperAdmin();
    if (!isSuperAdmin) {
      await this.auditService.logEvent({
        action: 'UNAUTHORIZED_ROLE_UPDATE_ATTEMPT',
        target_id: id,
        new_state: { error: '403 Forbidden - Solo SUPER_ADMIN puede modificar roles' }
      });
      throw new Error('403 Forbidden: Únicamente un SUPER_ADMIN puede editar Roles Globales.');
    }

    const current = this.mockRoles$.value;
    const target = current.find(r => r.id === id || r.role_id === id);
    const previousState = target ? { permissions: target.permissions } : null;

    if (this.firestore) {
      try {
        const roleDoc = doc(this.firestore, `roles/${id}`);
        await updateDoc(roleDoc, updates);
      } catch (err) {
        console.warn('[RoleService] Error actualizando rol en Firestore:', err);
      }
    }

    const updated = current.map(r => (r.id === id || r.role_id === id) ? { ...r, ...updates } : r);
    this.mockRoles$.next(updated);

    await this.auditService.logEvent({
      action: 'ROLE_UPDATE',
      target_id: id,
      previous_state: previousState,
      new_state: updates
    });
  }

  async deleteRole(id: string): Promise<void> {
    const isSuperAdmin = this.authService.isSuperAdmin();
    if (!isSuperAdmin) {
      await this.auditService.logEvent({
        action: 'UNAUTHORIZED_ROLE_DELETE_ATTEMPT',
        target_id: id,
        new_state: { error: '403 Forbidden - Solo SUPER_ADMIN puede eliminar roles' }
      });
      throw new Error('403 Forbidden: Únicamente un SUPER_ADMIN puede eliminar roles.');
    }

    if (this.firestore) {
      try {
        const roleDoc = doc(this.firestore, `roles/${id}`);
        await deleteDoc(roleDoc);
      } catch (err) {
        console.warn('[RoleService] Error eliminando rol en Firestore:', err);
      }
    }

    const current = this.mockRoles$.value.filter(r => r.id !== id && r.role_id !== id);
    this.mockRoles$.next(current);

    await this.auditService.logEvent({
      action: 'ROLE_DELETE',
      target_id: id,
      previous_state: null,
      new_state: null
    });
  }
}
