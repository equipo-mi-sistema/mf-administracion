import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { IconComponent } from '../shared/components/atomics';
import { ToastContainerComponent } from '../shared/components/organism/toast';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-admin-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, IconComponent, ToastContainerComponent],
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Barra de Navegación del Módulo de Administración y Gobernanza -->
      <div class="flex items-center gap-1.5 p-1 bg-surface-200/80 rounded-xl max-w-fit mb-6 text-xs font-semibold shadow-xs flex-wrap">
        <a 
          routerLink="teams" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <app-icon name="users" size="sm"></app-icon>
          <span>Equipos</span>
        </a>

        <a 
          routerLink="members" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <app-icon name="user" size="sm"></app-icon>
          <span>Miembros</span>
        </a>

        <a 
          routerLink="roles" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <app-icon name="shield" size="sm"></app-icon>
          <span>Roles (RBAC)</span>
        </a>

        <a 
          routerLink="kill-switch" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <app-icon name="extension" size="sm"></app-icon>
          <span>Kill-Switch</span>
        </a>

        <a 
          routerLink="audit" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <app-icon name="search" size="sm"></app-icon>
          <span>Auditoría</span>
        </a>
      </div>

      <!-- Vistas Hijas -->
      <router-outlet></router-outlet>
      
      <!-- Contenedor de notificaciones Toast para el microfrontend -->
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class AdminComponent {
  private authService = inject(AuthService);
  readonly isSuperAdmin = this.authService.isSuperAdmin;
}
