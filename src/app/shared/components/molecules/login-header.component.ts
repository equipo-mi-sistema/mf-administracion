import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandLogoComponent } from '../atomics/brand-logo.component';
import { TypographyComponent } from '../atomics/typography.component';

@Component({
  selector: 'app-login-header',
  standalone: true,
  imports: [CommonModule, BrandLogoComponent, TypographyComponent],
  template: `
    <div class="flex flex-col items-center text-center space-y-4">
      <app-brand-logo size="md"></app-brand-logo>
      <div class="space-y-1.5">
        <app-typography variant="h1">Ecosistema SISTEMA</app-typography>
        <app-typography variant="subtitle">
          Inicia sesión de forma segura para acceder a tus módulos de administración.
        </app-typography>
      </div>
    </div>
  `
})
export class LoginHeaderComponent { }
