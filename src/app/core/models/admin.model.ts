export interface GeographicScope {
  departamento: string;
  ciudad: string;
  comunas: string[]; // e.g. ['Comuna 1 - Popular', 'Comuna 10 - La Candelaria'] o ['*']
}

export interface User {
  id?: string;
  uid?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rolId: string;
  rolNombre?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';
  scope: GeographicScope;
  fechaCreacion?: string | Date;
  fechaActualizacion?: string | Date;
}

export type PermissionModule = 'USUARIOS' | 'ROLES' | 'AUDITORIA' | 'CONFIGURACION';

export interface Permission {
  id: string;
  codigo: string;       // ej: 'USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE', 'ROLE_MANAGE'
  nombre: string;
  descripcion: string;
  modulo: PermissionModule;
}

export interface Role {
  id?: string;
  nombre: string;
  descripcion: string;
  permisos: string[];   // Array de códigos de permisos
  esSistema?: boolean;
}

export interface UserFilter {
  ciudad?: string;
  comuna?: string;
  estado?: string;
  search?: string;
}
