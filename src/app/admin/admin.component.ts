import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Sub-navegación del Módulo de Administración -->
      <div class="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl max-w-fit mb-6 text-xs font-semibold">
        <a 
          routerLink="users" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Usuarios & ABAC</span>
        </a>
        <a 
          routerLink="roles" 
          routerLinkActive="bg-white text-brand-700 shadow-sm" 
          class="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-2">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Roles & Permisos</span>
        </a>
      </div>

      <!-- Vistas hijas -->
      <router-outlet></router-outlet>
    </div>
  `
})
export class AdminComponent {}
