import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { TeamService } from '../../core/services/team.service';
import { AuthService } from '../../core/auth/auth.service';
import { User, Team } from '../../core/models/admin.model';
import { MemberInviteModalComponent } from '../teams/member-invite-modal.component';
import {
  BadgeComponent,
  ButtonComponent,
  IconComponent,
  InputComponent
} from '../../shared/components/atomics';
import {
  ConfirmModalComponent
} from '../../shared/components/organism';
import { ToastService } from '../../shared/components/organism/toast';

@Component({
  selector: 'app-member-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    InputComponent,
    ConfirmModalComponent,
    MemberInviteModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Directorio de Miembros y Usuarios</h1>
            <app-badge variant="brand" size="sm">Gobernanza /users</app-badge>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Control de cuentas activas, cargos funcionales y el <span class="text-red-600 font-semibold">Botón Rojo</span> de expulsión en tiempo real.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <app-button 
            variant="primary" 
            size="sm"
            (clicked)="openInviteModal()"
          >
            <app-icon name="mail" size="sm"></app-icon>
            <span>Invitar Miembro</span>
          </app-button>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center gap-3">
        <div class="flex-1 w-full sm:w-auto">
          <app-input
            [(value)]="searchQuery"
            placeholder="Buscar por nombre, correo o cargo..."
            size="sm"
          ></app-input>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Filtro por Equipo -->
          <select 
            [(ngModel)]="selectedTeamFilter"
            class="text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none">
            <option value="">Todos los Equipos</option>
            @for (team of teams; track team.id || team.team_id) {
              <option [value]="team.team_id || team.id">{{ team.team_name }}</option>
            }
          </select>

          <!-- Filtro por Estado -->
          <select 
            [(ngModel)]="selectedStatusFilter"
            class="text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none">
            <option value="">Todos los Estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Tabla de Miembros -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th class="p-3.5 pl-5">Miembro</th>
                <th class="p-3.5">Rol Técnico</th>
                <th class="p-3.5">Equipo Asignado</th>
                <th class="p-3.5">Cargo Funcional</th>
                <th class="p-3.5">Estado</th>
                <th class="p-3.5 pr-5 text-right">Acción (Botón Rojo)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (user of filteredUsers(); track user.uid || user.id) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 pl-5">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                        {{ getInitials(user) }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-800">{{ user.displayName || user.nombres }}</div>
                        <div class="text-[11px] text-slate-400">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>

                  <td class="p-3.5">
                    <app-badge 
                      [variant]="getRoleBadgeVariant(user.role_id || user.rolId || '')" 
                      size="sm">
                      {{ user.role_id || user.rolId || 'MEMBER' }}
                    </app-badge>
                  </td>

                  <td class="p-3.5">
                    <span class="font-medium text-slate-700">{{ getTeamName(user.team_id || user.teamId) }}</span>
                  </td>

                  <td class="p-3.5">
                    <span class="text-slate-600">{{ user.cargo || 'Sin cargo asignado' }}</span>
                  </td>

                  <td class="p-3.5">
                    @if (isUserActive(user)) {
                      <app-badge variant="success" size="sm" [dot]="true">ACTIVO</app-badge>
                    } @else {
                      <app-badge variant="danger" size="sm" [dot]="true">INACTIVO</app-badge>
                    }
                  </td>

                  <td class="p-3.5 pr-5 text-right">
                    @if (isUserActive(user)) {
                      <app-button 
                        variant="danger" 
                        size="sm"
                        (clicked)="promptDeactivateUser(user)"
                        title="Desactivar sesión y forzar expulsión inmediata en el Host"
                      >
                        <app-icon name="trash" size="sm"></app-icon>
                        <span>Expulsar</span>
                      </app-button>
                    } @else {
                      <app-button 
                        variant="outline" 
                        size="sm"
                        (clicked)="promptReactivateUser(user)"
                      >
                        <app-icon name="check" size="sm"></app-icon>
                        <span>Reactivar</span>
                      </app-button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-slate-400">
                    No se encontraron miembros coincidentes con los filtros.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Confirmación: Botón Rojo de Expulsión -->
      <app-confirm-modal
        [(isOpen)]="showDeactivateConfirmModal"
        title="¿Expulsar y Desactivar Miembro?"
        [message]="deactivateMessage"
        confirmText="Confirmar Expulsión"
        confirmVariant="danger"
        (confirmed)="confirmDeactivate()"
        (cancelled)="showDeactivateConfirmModal = false"
      ></app-confirm-modal>

      <!-- Modal de Invitación Pre-aprobada -->
      <app-member-invite-modal
        [(isOpen)]="showInviteModal"
        [teamId]="teams[0]?.team_id || teams[0]?.id || ''"
        (invited)="loadData()"
      ></app-member-invite-modal>

    </div>
  `
})
export class MemberListPageComponent implements OnInit {
  private userService = inject(UserService);
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  users: User[] = [];
  teams: Team[] = [];

  searchQuery = '';
  selectedTeamFilter = '';
  selectedStatusFilter = '';

  showInviteModal = false;
  showDeactivateConfirmModal = false;
  userToDeactivate: User | null = null;
  deactivateMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.userService.getUsers().subscribe(u => this.users = u);
    this.teamService.getTeams().subscribe(t => this.teams = t);
  }

  filteredUsers(): User[] {
    return this.users.filter(u => {
      const q = this.searchQuery.toLowerCase().trim();
      const name = (u.displayName || `${u.nombres || ''} ${u.apellidos || ''}`).toLowerCase();
      const email = u.email.toLowerCase();
      const cargo = (u.cargo || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || email.includes(q) || cargo.includes(q);
      const matchesTeam = !this.selectedTeamFilter || (u.team_id === this.selectedTeamFilter || u.teamId === this.selectedTeamFilter);
      
      const userStatus = u.status || (u.estado === 'INACTIVO' ? 'INACTIVE' : 'ACTIVE');
      const matchesStatus = !this.selectedStatusFilter || userStatus === this.selectedStatusFilter;

      return matchesSearch && matchesTeam && matchesStatus;
    });
  }

  isUserActive(user: User): boolean {
    return (user.status === 'ACTIVE') || (user.estado === 'ACTIVO' && user.status !== 'INACTIVE');
  }

  getInitials(user: User): string {
    const name = user.displayName || user.nombres || user.email;
    return name.slice(0, 2).toUpperCase();
  }

  getRoleBadgeVariant(role: string): any {
    if (role === 'SUPER_ADMIN') return 'brand';
    if (role === 'TEAM_OWNER') return 'warning';
    return 'neutral';
  }

  getTeamName(teamId?: string | null): string {
    if (!teamId) return 'Sin equipo';
    const found = this.teams.find(t => t.id === teamId || t.team_id === teamId);
    return found ? found.team_name : teamId;
  }

  openInviteModal(): void {
    this.showInviteModal = true;
  }

  promptDeactivateUser(user: User): void {
    this.userToDeactivate = user;
    const name = user.displayName || user.nombres || user.email;
    this.deactivateMessage = `Esta acción cambiará el estado de ${name} a INACTIVE en Firestore. El Host detectará el cambio de inmediato mediante su listener onSnapshot y expulsará su sesión de todas las pestañas abiertas.`;
    this.showDeactivateConfirmModal = true;
  }

  async confirmDeactivate(): Promise<void> {
    if (!this.userToDeactivate) return;
    const uid = this.userToDeactivate.uid || this.userToDeactivate.id;
    if (!uid) return;

    try {
      await this.userService.deactivateUser(uid);
      this.showDeactivateConfirmModal = false;
      this.toastService.success('Usuario Inhabilitado', 'Se aplicó la expulsión Zero-Trust en tiempo real.');
      this.loadData();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No fue posible inhabilitar el usuario.');
    }
  }

  async promptReactivateUser(user: User): Promise<void> {
    const uid = user.uid || user.id;
    if (!uid) return;

    try {
      await this.userService.activateUser(uid);
      this.toastService.success('Usuario Reactivado', 'El estado del usuario ahora es ACTIVO.');
      this.loadData();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No se pudo reactivar el usuario.');
    }
  }
}
