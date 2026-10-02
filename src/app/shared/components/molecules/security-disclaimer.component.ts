import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security-disclaimer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-left">
      <div class="flex-shrink-0 text-slate-500 mt-0.5">
        <svg class="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div class="text-xs text-slate-500 leading-relaxed">
        <span class="font-semibold text-slate-700">Acceso institucional seguro.</span>
        Solo las cuentas Google corporativas autorizadas y con roles asignados tendrán acceso a los microfrontends del sistema.
      </div>
    </div>
  `
})
export class SecurityDisclaimerComponent {}
