import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { IconComponent } from '../shared/components/atomics';
import { ToastContainerComponent } from '../shared/components/organism/toast';

@Component({
  selector: 'app-admin-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, IconComponent, ToastContainerComponent],
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Sub-navegación del Módulo de Administración -->
      <div class="flex items-center gap-1 p-1 bg-surface-200/80 rounded-xl max-w-fit mb-6 text-xs font-semibold">
        <a 
          routerLink="users" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <app-icon name="users" size="sm"></app-icon>
          <span>Usuarios & ABAC</span>
        </a>
        <a 
          routerLink="roles" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <app-icon name="shield" size="sm"></app-icon>
          <span>Roles & Permisos</span>
        </a>
      </div>

      <!-- Vistas hijas -->
      <router-outlet></router-outlet>
      
      <!-- Contenedor de notificaciones Toast para el microfrontend -->
      <app-toast-container></app-toast-container>
    </div>
  `
})
export class AdminComponent {}
