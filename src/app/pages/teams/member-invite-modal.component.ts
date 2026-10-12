import { Component, model, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../core/services/team.service';
import { ToastService } from '../../shared/components/organism/toast';
import {
  ButtonComponent,
  IconComponent,
  InputComponent
} from '../../shared/components/atomics';
import { ModalComponent } from '../../shared/components/organism';

@Component({
  selector: 'app-member-invite-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ButtonComponent,
    InputComponent,
    IconComponent
  ],
  template: `
    <app-modal
      [(isOpen)]="isOpen"
      title="Invitar Miembro Pre-aprobado"
      size="md"
      (closed)="close()"
    >
      <div class="space-y-4">
        <p class="text-xs text-slate-500 -mt-2">
          Ingresa la cuenta de Google (Gmail). Al iniciar sesión con Google SSO, se vinculará de forma transparente al equipo con sus Custom Claims ligeros.
        </p>

        <!-- Correo Google -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Correo de Google (@gmail.com) *
          </label>
          <app-input
            [(value)]="email"
            placeholder="ejemplo@gmail.com"
            size="sm"
          ></app-input>
          @if (email && !isValidEmail()) {
            <p class="text-[11px] text-red-500 mt-1">Por favor ingresa un correo electrónico válido.</p>
          }
        </div>

        <!-- Selección de Rol -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Rol Técnico (RBAC) *
          </label>
          <select 
            [(ngModel)]="roleId"
            class="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none">
            <option value="MEMBER">MEMBER (Miembro Operativo)</option>
            <option value="TEAM_OWNER">TEAM_OWNER (Dueño de Equipo)</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (Administrador Global)</option>
          </select>
          <p class="text-[11px] text-slate-400 mt-1">Define qué permisos técnicos tendrá en la plataforma.</p>
        </div>

        <!-- Cargo Funcional -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Cargo Organizacional Funcional *
          </label>
          <app-input
            [(value)]="cargo"
            placeholder="Ej: Coordinador Comuna 2 / Líder de Referidos"
            size="sm"
          ></app-input>
          <p class="text-[11px] text-slate-400 mt-1">Metadato organizacional libre, sin impacto en reglas de seguridad.</p>
        </div>
      </div>

      <div modal-footer class="flex items-center justify-end gap-2.5 w-full">
        <app-button 
          variant="ghost" 
          size="sm" 
          (clicked)="close()"
        >
          <span>Cancelar</span>
        </app-button>

        <app-button 
          variant="primary" 
          size="sm" 
          [disabled]="!canSubmit() || isSubmitting" 
          (clicked)="submitInvitation()"
        >
          <app-icon name="mail" size="sm"></app-icon>
          <span>{{ isSubmitting ? 'Enviando...' : 'Generar Pre-aprobación' }}</span>
        </app-button>
      </div>
    </app-modal>
  `
})
export class MemberInviteModalComponent {
  private teamService = inject(TeamService);
  private toastService = inject(ToastService);

  isOpen = model<boolean>(false);
  teamId = input<string>('eq_dosquebradas_01');

  invited = output<void>();

  email = '';
  roleId = 'MEMBER';
  cargo = '';
  isSubmitting = false;

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  canSubmit(): boolean {
    return this.isValidEmail() && !!this.cargo.trim() && !!this.teamId();
  }

  close(): void {
    this.isOpen.set(false);
  }

  async submitInvitation(): Promise<void> {
    if (!this.canSubmit()) return;

    this.isSubmitting = true;
    try {
      await this.teamService.createInvitation({
        email: this.email.trim(),
        team_id: this.teamId(),
        role_id: this.roleId,
        cargo: this.cargo.trim()
      });

      this.toastService.success(
        'Invitación Pre-aprobada',
        `Se registró la pre-aprobación para ${this.email}. Vinculación automática en su primer inicio de sesión.`
      );

      this.email = '';
      this.cargo = '';
      this.isOpen.set(false);
      this.invited.emit();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No se pudo generar la invitación.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
