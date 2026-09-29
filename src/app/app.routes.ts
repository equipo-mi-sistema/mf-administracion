import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./admin/admin.routes').then(m => m.routes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
