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
      <!-- Encabezado Kill-Switch -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Gobernanza del Kill-Switch de Microfrontends</h1>
            <app-badge variant="danger" size="sm">Control Perimetral</app-badge>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Activa o suspende el acceso a módulos remotos federados en tiempo real. Todo cambio emite una traza inmutable en <code class="font-mono text-brand-600">/audit_logs</code>.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button 
            variant="outline" 
            size="sm"
            (clicked)="refreshModules()"
          >
            <app-icon name="refresh" size="sm"></app-icon>
            <span>Sincronizar Manifiesto</span>
          </app-button>
        </div>
      </div>

      <!-- Tarjetas de Microfrontends -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (m of modules; track m.id) {
          <div 
            [class.border-slate-200]="m.active"
            [class.border-red-200]="!m.active"
            [class.bg-red-50/20]="!m.active"
            class="bg-white rounded-2xl border shadow-card p-5 flex flex-col justify-between transition-all">
            
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-2.5">
                  <div 
                    [class.bg-brand-50]="m.active"
                    [class.text-brand-600]="m.active"
                    [class.bg-red-100]="!m.active"
                    [class.text-red-700]="!m.active"
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                    <app-icon [name]="m.icon || 'extension'" size="sm"></app-icon>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm leading-snug">{{ m.name }}</h3>
                    <code class="text-[10px] text-slate-400 font-mono">/{{ m.routePath }}</code>
                  </div>
                </div>

                @if (m.active) {
                  <app-badge variant="success" size="sm" [dot]="true">Activo</app-badge>
                } @else {
                  <app-badge variant="danger" size="sm" [dot]="true">Suspendido</app-badge>
                }
              </div>

              <!-- Metadatos de Native Federation -->
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600 my-3">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 text-[11px]">Entry:</span>
                  <span class="font-mono text-[10px] truncate max-w-[170px]">{{ m.remoteEntry }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 text-[11px]">Exposed:</span>
                  <span class="font-mono text-[10px]">{{ m.exposedModule }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 text-[11px]">Roles:</span>
                  <div class="flex gap-1 flex-wrap">
                    @for (r of m.rolesAllowed; track r) {
                      <span class="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-mono">{{ r }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Interruptor Kill-Switch -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-xs font-semibold" [class.text-emerald-700]="m.active" [class.text-red-700]="!m.active">
                {{ m.active ? 'Disponible para usuarios' : 'Bloqueado (Mantenimiento)' }}
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

      <!-- Modal de Confirmación para Desactivar Módulo -->
      <app-confirm-modal
        [(isOpen)]="showConfirmToggleModal"
        title="¿Suspender Microfrontend?"
        [message]="confirmMessage"
        confirmText="Suspender Inmediatamente"
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

  requestToggle(module: MicrofrontendConfig): void {
    if (!this.isSuperAdmin()) {
      this.toastService.error('Acceso Denegado', 'Solo un SUPER_ADMIN puede operar el Kill-Switch.');
      return;
    }

    const nextState = !module.active;

    if (!nextState) {
      // Advertencia al suspender
      this.moduleToToggle = module;
      this.targetNewState = false;
      this.confirmMessage = `Al desactivar "${module.name}", el Host ocultará inmediatamente su ítem en el sidebar y el DynamicRemoteGuard bloqueará todo intento de navegación, redirigiendo a la pantalla de fuera de servicio.`;
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
        newState ? 'Microfrontend Activado' : 'Microfrontend Suspendido',
        `El módulo "${mod.name}" ahora está ${newState ? 'activo' : 'fuera de servicio'}. Traza de auditoría registrada.`
      );
      this.refreshModules();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No fue posible actualizar el Kill-Switch.');
    }
  }
}
