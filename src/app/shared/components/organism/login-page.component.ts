import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthLayoutTemplate } from './auth-layout.template';
import { LoginCardComponent } from './login-card.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthLayoutTemplate, LoginCardComponent],
  template: `
    <app-auth-layout>
      <app-login-card
        [loading]="authService.isLoading()"
        [errorMessage]="authService.authError()"
        (onGoogleLogin)="handleGoogleLogin()"
      ></app-login-card>
    </app-auth-layout>
  `
})
export class LoginPageComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  async handleGoogleLogin(): Promise<void> {
    try {
      const user = await this.authService.loginWithGoogle();
      if (user) {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        await this.router.navigateByUrl(returnUrl);
      }
    } catch {
      // El error ya es capturado y publicado en authService.authError()
    }
  }
}
