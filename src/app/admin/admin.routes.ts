import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
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
