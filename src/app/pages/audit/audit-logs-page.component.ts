import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
import { AuditLog } from '../../core/models/admin.model';
import {
  BadgeComponent,
  ButtonComponent,
  IconComponent,
  InputComponent
} from '../../shared/components/atomics';
import {
  ModalComponent
} from '../../shared/components/organism';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    InputComponent,
    ModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Encabezado de Auditoría -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Auditoría Inmutable de Seguridad</h1>
            <app-badge variant="brand" size="sm">Trazabilidad IP</app-badge>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Registro cronológico inalterable de operaciones administrativas en <code class="font-mono text-brand-600">/audit_logs</code>.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button 
            variant="outline" 
            size="sm"
            (clicked)="refreshLogs()"
          >
            <app-icon name="refresh" size="sm"></app-icon>
            <span>Actualizar Logs</span>
          </app-button>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center gap-3">
        <div class="flex-1 w-full sm:w-auto">
          <app-input
            [(value)]="searchQuery"
            placeholder="Buscar por ejecutor, IP o target_id..."
            size="sm"
          ></app-input>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select 
            [(ngModel)]="selectedActionFilter"
            class="text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none">
            <option value="">Todas las Acciones</option>
            <option value="ROLE_CREATE">ROLE_CREATE</option>
            <option value="ROLE_UPDATE">ROLE_UPDATE</option>
            <option value="ROLE_DELETE">ROLE_DELETE</option>
            <option value="USER_DISABLE">USER_DISABLE (Botón Rojo)</option>
            <option value="USER_ENABLE">USER_ENABLE</option>
            <option value="TEAM_CREATE">TEAM_CREATE</option>
            <option value="TEAM_TRANSFER">TEAM_TRANSFER</option>
            <option value="KILL_SWITCH_TOGGLED">KILL_SWITCH_TOGGLED</option>
            <option value="INVITATION_CREATE">INVITATION_CREATE</option>
          </select>
        </div>
      </div>

      <!-- Tabla de Logs de Auditoría -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th class="p-3.5 pl-5">Timestamp (UTC)</th>
                <th class="p-3.5">Acción</th>
                <th class="p-3.5">Ejecutor</th>
                <th class="p-3.5">Dirección IP</th>
                <th class="p-3.5">Objetivo (Target ID)</th>
                <th class="p-3.5 pr-5 text-right">Detalle de Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
              @for (log of filteredLogs(); track log.id || log.timestamp_utc) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 pl-5 text-slate-600 whitespace-nowrap">
                    {{ log.timestamp_utc | date:'yyyy-MM-dd HH:mm:ss' }} UTC
                  </td>

                  <td class="p-3.5 whitespace-nowrap font-sans">
                    <app-badge [variant]="getActionBadgeVariant(log.action)" size="sm">
                      {{ log.action }}
                    </app-badge>
                  </td>

                  <td class="p-3.5 text-slate-700 whitespace-nowrap">
                    <div>{{ log.executor_email }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">UID: {{ log.executor_uid }}</div>
                  </td>

                  <td class="p-3.5 text-slate-700 whitespace-nowrap">
                    <span class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800">{{ log.ip_address }}</span>
                  </td>

                  <td class="p-3.5 text-slate-700 truncate max-w-[160px]" title="{{ log.target_id }}">
                    {{ log.target_id }}
                  </td>

                  <td class="p-3.5 pr-5 text-right font-sans">
                    <app-button 
                      variant="ghost" 
                      size="sm"
                      (clicked)="inspectLog(log)"
                    >
                      <app-icon name="search" size="sm"></app-icon>
                      <span>Inspeccionar</span>
                    </app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-400 font-sans">
                    No se encontraron registros de auditoría coincidentes.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Inspección de Estados (Previous vs New State) -->
      <app-modal
        [(isOpen)]="showInspectModal"
        title="Inspección de Registro de Auditoría"
        size="lg"
        (closed)="showInspectModal = false"
      >
        @if (selectedLog) {
          <div class="space-y-4 text-xs font-sans">
            <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span class="text-slate-400 text-[11px] block">Acción Auditada:</span>
                <span class="font-bold text-slate-800">{{ selectedLog.action }}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[11px] block">Dirección IP:</span>
                <span class="font-mono text-slate-800">{{ selectedLog.ip_address }}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[11px] block">Ejecutor:</span>
                <span class="text-slate-800">{{ selectedLog.executor_email }}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[11px] block">User Agent:</span>
                <span class="text-[10px] text-slate-500 font-mono truncate block">{{ selectedLog.user_agent }}</span>
              </div>
            </div>

            <!-- Comparador de Estados -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span class="block font-bold text-slate-700 mb-1">Estado Previo (previous_state):</span>
                <pre class="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">{{ selectedLog.previous_state | json }}</pre>
              </div>

              <div>
                <span class="block font-bold text-slate-700 mb-1">Nuevo Estado (new_state):</span>
                <pre class="p-3 bg-slate-900 text-sky-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">{{ selectedLog.new_state | json }}</pre>
              </div>
            </div>
          </div>
        }

        <div modal-footer class="flex items-center justify-end w-full">
          <app-button variant="outline" size="sm" (clicked)="showInspectModal = false">
            <span>Cerrar</span>
          </app-button>
        </div>
      </app-modal>

    </div>
  `
})
export class AuditLogsPage implements OnInit {
  private auditService = inject(AuditService);

  logs: AuditLog[] = [];
  searchQuery = '';
  selectedActionFilter = '';

  showInspectModal = false;
  selectedLog: AuditLog | null = null;

  ngOnInit(): void {
    this.refreshLogs();
  }

  refreshLogs(): void {
    this.auditService.getAuditLogs().subscribe(l => this.logs = l);
  }

  filteredLogs(): AuditLog[] {
    return this.logs.filter(log => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        log.executor_email.toLowerCase().includes(q) ||
        log.ip_address.toLowerCase().includes(q) ||
        log.target_id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q);

      const matchesAction = !this.selectedActionFilter || log.action === this.selectedActionFilter;

      return matchesSearch && matchesAction;
    });
  }

  getActionBadgeVariant(action: string): any {
    if (action.includes('DISABLE') || action.includes('DELETE')) return 'danger';
    if (action.includes('TOGGLED') || action.includes('TRANSFER')) return 'warning';
    if (action.includes('CREATE') || action.includes('ENABLE')) return 'success';
    return 'neutral';
  }

  inspectLog(log: AuditLog): void {
    this.selectedLog = log;
    this.showInspectModal = true;
  }
}
