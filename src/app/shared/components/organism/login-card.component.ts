import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginHeaderComponent } from '../molecules/login-header.component';
import { SecurityDisclaimerComponent } from '../molecules/security-disclaimer.component';
import { GoogleButtonComponent } from '../atomics/google-button.component';

@Component({
  selector: 'app-login-card',
  standalone: true,
  imports: [
    CommonModule,
    LoginHeaderComponent,
    SecurityDisclaimerComponent,
    GoogleButtonComponent
  ],
  template: `
    <div class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col space-y-7 transition-all duration-300">
      <!-- Header de Login -->
      <app-login-header></app-login-header>

      <!-- Mensaje de error si falla la autenticación -->
      @if (errorMessage()) {
        <div class="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2.5 animate-fadeIn">
          <svg class="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="leading-relaxed">{{ errorMessage() }}</span>
        </div>
      }

      <!-- Google SSO CTA -->
      <div class="space-y-3">
        <app-google-button
          [loading]="loading()"
          (onClick)="onGoogleLogin.emit()"
        ></app-google-button>
        <p class="text-center text-[11px] text-slate-400">
          Autenticación delegada exclusivamente mediante Google Identity Platform
        </p>
      </div>

      <!-- Separador sutil -->
      <div class="relative flex items-center justify-center">
        <div class="w-full border-t border-slate-200/70"></div>
      </div>

      <!-- Disclaimer de Seguridad -->
      <app-security-disclaimer></app-security-disclaimer>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.25s ease-out forwards;
    }
  `]
})
export class LoginCardComponent {
  loading = input<boolean>(false);
  errorMessage = input<string | null>(null);
  onGoogleLogin = output<void>();
}
