import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { adminAuthGuard } from '../core/guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        component: UserListComponent,
        title: 'Gestión de Usuarios | Administración'
      },
      {
        path: 'roles',
        component: RoleManagementComponent,
        title: 'Matriz de Roles y Permisos | Administración'
      }
    ]
  }
];

export const ADMIN_ROUTES = routes;
