import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [adminAuthGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.routes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
