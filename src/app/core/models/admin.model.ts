export interface GeographicScope {
  departamento: string;
  ciudad: string;
  comunas: string[]; // e.g. ['Comuna 1 - Popular', 'Comuna 10 - La Candelaria'] o ['*']
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id?: string;
  uid?: string;
  nombres?: string;
  apellidos?: string;
  displayName?: string;
  email: string;
  telefono?: string;
  photoURL?: string;
  rolId?: string;
  role_id?: string | null;
  rolNombre?: string;
  team_id?: string | null;
  teamId?: string | null;
  cargo?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  status?: UserStatus;
  scope?: GeographicScope;
  fechaCreacion?: string | Date;
  fechaActualizacion?: string | Date;
  updatedAt?: string | Date;
}

export interface Member extends User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role_id: string | null;
  team_id: string | null;
  cargo?: string;
  status: UserStatus;
  updatedAt?: string;
}

export interface Team {
  id?: string;
  team_id?: string;
  team_name: string;
  leader_uid: string;
  leader_email?: string;
  leader_name?: string;
  created_at: string;
}

export interface RolePermissionsMap {
  mapeo: string[];        // ['voters:read', 'voters:write', 'territory:manage']
  gestion: string[];      // ['cases:read', 'cases:create', 'cases:manage']
  asistencia: string[];   // ['events:read', 'events:register']
  transporte: string[];   // ['routes:view', 'gps:track']
  conteo: string[];       // ['tally:view', 'e14:upload', 'e14:verify']
  administracion: string[]; // ['users:manage', 'roles:manage', 'audit:view', 'killswitch:manage']
  [key: string]: string[];
}

export interface Role {
  id?: string;
  role_id?: string;
  role_name?: string;
  nombre?: string;
  descripcion?: string;
  created_by?: string;
  permissions?: RolePermissionsMap;
  permisos?: string[];   // Array de códigos de permisos (compatibilidad)
  esSistema?: boolean;
}

export interface Invitation {
  id?: string;
  email: string;
  email_hash: string;
  team_id: string;
  team_name?: string;
  role_id: string;
  cargo: string;
  created_at: string;
}

export interface AuditLog {
  id?: string;
  timestamp_utc: string;
  executor_uid: string;
  executor_email: string;
  ip_address: string;
  user_agent: string;
  action: 'ROLE_CREATE' | 'ROLE_UPDATE' | 'ROLE_DELETE' | 'USER_DISABLE' | 'USER_ENABLE' | 'TEAM_CREATE' | 'TEAM_UPDATE' | 'TEAM_TRANSFER' | 'KILL_SWITCH_TOGGLED' | 'INVITATION_CREATE' | string;
  target_id: string;
  previous_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
}

export interface MicrofrontendConfig {
  id: string;              // ej: 'mapeo'
  name: string;            // 'Módulo de Mapeo'
  routePath: string;       // 'mapeo'
  remoteEntry: string;
  exposedModule: string;   // './routes'
  active: boolean;         // Kill-Switch: true | false
  rolesAllowed: string[];  // ['SUPER_ADMIN', 'TEAM_OWNER', 'MEMBER']
  icon?: string;
  order: number;
  badge?: string;
}

export type PermissionModule = 'USUARIOS' | 'ROLES' | 'AUDITORIA' | 'CONFIGURACION';

export interface Permission {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: PermissionModule;
}

export interface UserFilter {
  ciudad?: string;
  comuna?: string;
  estado?: string;
  status?: string;
  team_id?: string;
  search?: string;
}
