import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  template: `
    <div class="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-50 select-none">
      <!-- Elementos dinámicos y estilizados de fondo (Aurora/Blurs) -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-400/25 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-300/15 rounded-full blur-[120px] pointer-events-none"></div>

      <!-- Contenedor centralizado para la tarjeta de autenticación -->
      <div class="relative z-10 w-full flex justify-center">
        <ng-content></ng-content>
      </div>

      <!-- Pie de página institucional discreto -->
      <div class="absolute bottom-4 text-center text-xs text-slate-400 z-10">
        &copy; {{ currentYear }} Ecosistema SISTEMA &bull; Seguridad y Acceso Centralizado
      </div>
    </div>
  `
})
export class AuthLayoutTemplate {
  readonly currentYear = new Date().getFullYear();
}
