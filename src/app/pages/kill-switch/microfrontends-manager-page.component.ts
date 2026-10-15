import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KillSwitchService } from '../../core/services/kill-switch.service';
import { AuthService } from '../../core/auth/auth.service';
import { MicrofrontendConfig } from '../../core/models/admin.model';
import {
  BadgeComponent,
  ButtonComponent,
  IconComponent,
  ToggleComponent
} from '../../shared/components/atomics';
import {
  ConfirmModalComponent
} from '../../shared/components/organism';
import { ToastService } from '../../shared/components/organism/toast';

@Component({
  selector: 'app-microfrontends-manager-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    ToggleComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Encabezado de Módulos del Sistema -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Disponibilidad de Módulos del Sistema</h1>
            <app-badge variant="brand" size="sm">Configuración Operativa</app-badge>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Habilita o pausa el acceso a los módulos funcionales para los colaboradores en tiempo real.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button 
            variant="outline" 
            size="sm"
            (clicked)="refreshModules()"
          >
            <app-icon name="refresh" size="sm"></app-icon>
            <span>Actualizar Módulos</span>
          </app-button>
        </div>
      </div>

      <!-- Tarjetas de Módulos del Sistema -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (m of modules; track m.id) {
          <div 
            [class.border-slate-200]="m.active"
            [class.border-amber-200]="!m.active"
            [class.bg-amber-50/20]="!m.active"
            class="bg-white rounded-2xl border shadow-card p-5 flex flex-col justify-between transition-all">
            
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-2.5">
                  <div 
                    [class.bg-brand-50]="m.active"
                    [class.text-brand-600]="m.active"
                    [class.bg-amber-100]="!m.active"
                    [class.text-amber-700]="!m.active"
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                    <app-icon [name]="m.icon || 'settings'" size="sm"></app-icon>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm leading-snug">{{ m.name }}</h3>
                    <span class="text-[11px] text-slate-400">Ruta: /{{ m.routePath }}</span>
                  </div>
                </div>

                @if (m.active) {
                  <app-badge variant="success" size="sm" [dot]="true">Disponible</app-badge>
                } @else {
                  <app-badge variant="warning" size="sm" [dot]="true">En Mantenimiento</app-badge>
                }
              </div>

              <!-- Información de Negocio del Módulo -->
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600 my-3">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 text-[11px]">Área de Operación:</span>
                  <span class="font-medium text-slate-700 text-[11px]">{{ m.badge || 'Operativa' }}</span>
                </div>
                <div class="space-y-1">
                  <span class="text-slate-400 text-[11px] block">Perfiles con Acceso:</span>
                  <div class="flex gap-1.5 flex-wrap">
                    @for (r of m.rolesAllowed; track r) {
                      <span class="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md text-[10px] font-medium">
                        {{ getRoleFriendlyName(r) }}
                      </span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Interruptor de Disponibilidad -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs font-semibold" [class.text-emerald-700]="m.active" [class.text-amber-700]="!m.active">
                {{ m.active ? 'Disponible para usuarios' : 'En pausa (Mantenimiento)' }}
              </span>

              <app-toggle
                [checked]="m.active"
                [disabled]="!isSuperAdmin()"
                (toggled)="requestToggle(m)"
              ></app-toggle>
            </div>
          </div>
        }
      </div>

      <!-- Modal de Confirmación para Pausar Módulo -->
      <app-confirm-modal
        [(isOpen)]="showConfirmToggleModal"
        title="¿Pausar disponibilidad del módulo?"
        [message]="confirmMessage"
        confirmText="Pausar Módulo"
        confirmVariant="danger"
        (confirmed)="executeToggle()"
        (cancelled)="showConfirmToggleModal = false"
      ></app-confirm-modal>

    </div>
  `
})
export class MicrofrontendsManagerPageComponent implements OnInit {
  private killSwitchService = inject(KillSwitchService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly isSuperAdmin = this.authService.isSuperAdmin;

  modules: MicrofrontendConfig[] = [];

  showConfirmToggleModal = false;
  moduleToToggle: MicrofrontendConfig | null = null;
  targetNewState = false;
  confirmMessage = '';

  ngOnInit(): void {
    this.refreshModules();
  }

  refreshModules(): void {
    this.killSwitchService.getMicrofrontends().subscribe(m => this.modules = m);
  }

  getRoleFriendlyName(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador',
      TEAM_OWNER: 'Líder de Equipo',
      MEMBER: 'Miembro Operativo',
      ADMIN: 'Administrador',
      LEADER: 'Líder Territorial',
      OPERATOR: 'Operador de Campo'
    };
    return map[role] || role;
  }

  requestToggle(module: MicrofrontendConfig): void {
    if (!this.isSuperAdmin()) {
      this.toastService.error('Acceso Denegado', 'Solo un Super Administrador puede modificar la disponibilidad de módulos.');
      return;
    }

    const nextState = !module.active;

    if (!nextState) {
      // Advertencia al pausar
      this.moduleToToggle = module;
      this.targetNewState = false;
      this.confirmMessage = `Al pausar "${module.name}", el módulo se mostrará como "En Mantenimiento" para los usuarios hasta que vuelva a ser activado.`;
      this.showConfirmToggleModal = true;
    } else {
      // Reactivar inmediatamente
      this.moduleToToggle = module;
      this.targetNewState = true;
      this.executeToggle();
    }
  }

  async executeToggle(): Promise<void> {
    if (!this.moduleToToggle) return;
    const mod = this.moduleToToggle;
    const newState = this.targetNewState;

    try {
      await this.killSwitchService.toggleMicrofrontend(mod.id, newState);
      this.showConfirmToggleModal = false;
      this.toastService.success(
        newState ? 'Módulo Habilitado' : 'Módulo Pausado',
        `El módulo "${mod.name}" ahora está ${newState ? 'disponible' : 'en mantenimiento'}. Evento registrado en auditoría.`
      );
      this.refreshModules();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No fue posible actualizar la disponibilidad del módulo.');
    }
  }
}
