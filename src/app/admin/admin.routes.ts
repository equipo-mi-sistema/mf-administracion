import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { adminAuthGuard } from '../core/guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'teams',
        pathMatch: 'full'
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('../pages/teams/teams-page.component').then(
            (m) => m.TeamsPageComponent
          ),
        title: 'Equipos Territoriales | Administración'
      },
      {
        path: 'members',
        loadComponent: () =>
          import('../pages/members/member-list-page.component').then(
            (m) => m.MemberListPageComponent
          ),
        title: 'Miembros y Directorio | Administración'
      },
      {
        path: 'users',
        redirectTo: 'members',
        pathMatch: 'full'
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('../pages/roles/roles-manager-page.component').then(
            (m) => m.RolesManagerPageComponent
          ),
        title: 'Roles y Permisos | Administración'
      },
      {
        path: 'kill-switch',
        loadComponent: () =>
          import('../pages/kill-switch/microfrontends-manager-page.component').then(
            (m) => m.MicrofrontendsManagerPageComponent
          ),
        title: 'Disponibilidad de Módulos | Administración'
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('../pages/audit/audit-logs-page.component').then(
            (m) => m.AuditLogsPage
          ),
        title: 'Auditoría y Seguridad | Administración'
      }
    ]
  }
];

export const ADMIN_ROUTES = routes;
