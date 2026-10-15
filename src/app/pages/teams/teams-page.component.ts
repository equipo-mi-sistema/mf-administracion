import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeamService } from '../../core/services/team.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { Team, User, Invitation } from '../../core/models/admin.model';
import { MemberInviteModalComponent } from './member-invite-modal.component';
import {
  BadgeComponent,
  ButtonComponent,
  IconComponent,
  InputComponent
} from '../../shared/components/atomics';
import {
  ModalComponent
} from '../../shared/components/organism';
import { ToastService } from '../../shared/components/organism/toast';

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    InputComponent,
    ModalComponent,
    MemberInviteModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Encabezado de Equipos -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Gestión de Equipos Territoriales</h1>
            <app-badge variant="brand" size="sm">Equipos Activos</app-badge>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión de equipos territoriales, líderes coordinadores e invitaciones de nuevos colaboradores.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          @if (isSuperAdmin()) {
            <app-button 
              variant="primary" 
              size="sm"
              (clicked)="openCreateTeamModal()"
            >
              <app-icon name="plus" size="sm"></app-icon>
              <span>Crear Nuevo Equipo</span>
            </app-button>
          }
        </div>
      </div>

      <!-- Tarjetas de Equipos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (team of teams; track team.id || team.team_id) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div>
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                    <app-icon name="users" size="sm"></app-icon>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm leading-snug">{{ team.team_name }}</h3>
                    <span class="text-[11px] text-slate-400">Territorio asignado</span>
                  </div>
                </div>
                <app-badge variant="brand" size="sm">Activo</app-badge>
              </div>

              <!-- Detalle de Liderazgo -->
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 my-3">
                <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Líder de Equipo</div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800">{{ team.leader_name || team.leader_email || team.leader_uid }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">Coordinador</span>
                </div>
              </div>
            </div>

            <!-- Acciones por Equipo -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
              <app-button 
                variant="outline" 
                size="sm"
                (clicked)="openInviteModal(team.team_id || team.id || '')"
              >
                <app-icon name="mail" size="sm"></app-icon>
                <span>Invitar</span>
              </app-button>

              <div class="flex items-center gap-1.5">
                <app-button 
                  variant="ghost" 
                  size="sm"
                  (clicked)="openEditNameModal(team)"
                >
                  <app-icon name="edit" size="sm"></app-icon>
                </app-button>

                @if (isSuperAdmin()) {
                  <app-button 
                    variant="ghost" 
                    size="sm"
                    (clicked)="openTransferModal(team)"
                    title="Transferir Liderazgo (Exclusivo SUPER_ADMIN)"
                  >
                    <app-icon name="refresh" size="sm"></app-icon>
                  </app-button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Sección de Invitaciones Pendientes -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-card p-5 mt-6">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Invitaciones Pendientes de Aceptación</h3>
            <p class="text-xs text-slate-500">Al iniciar sesión con Google por primera vez, se activará automáticamente el acceso del colaborador a su equipo asignado.</p>
          </div>
          <app-badge variant="neutral" size="sm">{{ invitations.length }} registradas</app-badge>
        </div>

        @if (invitations.length > 0) {
          <div class="divide-y divide-slate-100">
            @for (inv of invitations; track inv.id || inv.email_hash) {
              <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span class="font-bold text-slate-800">{{ inv.email }}</span>
                  <span class="text-slate-400 ml-2">({{ inv.cargo }})</span>
                </div>
                <div class="flex items-center gap-2">
                  <app-badge variant="neutral" size="sm">{{ inv.team_name || inv.team_id }}</app-badge>
                  <app-badge variant="brand" size="sm">{{ inv.role_id }}</app-badge>
                  <span class="text-[10px] text-slate-400">{{ inv.created_at | date:'short' }}</span>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="text-xs text-slate-400 py-3 text-center">No hay invitaciones pendientes por reclamar.</p>
        }
      </div>

      <!-- Modal Crear Equipo -->
      <app-modal
        [(isOpen)]="showCreateModal"
        title="Crear Nuevo Equipo Territorial"
        size="md"
        (closed)="showCreateModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Equipo *</label>
            <app-input [(value)]="newTeamName" placeholder="Ej: Comando Pereira Centro" size="sm"></app-input>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Líder Asignado (Leader UID) *</label>
            <select 
              [(ngModel)]="newTeamLeaderUid"
              class="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none">
              @for (user of users; track user.uid || user.id) {
                <option [value]="user.uid || user.id">
                  {{ user.displayName || user.nombres }} ({{ user.email }})
                </option>
              }
            </select>
          </div>
        </div>

        <div modal-footer class="flex items-center justify-end gap-2.5 w-full">
          <app-button variant="ghost" size="sm" (clicked)="showCreateModal = false"><span>Cancelar</span></app-button>
          <app-button variant="primary" size="sm" [disabled]="!newTeamName.trim()" (clicked)="confirmCreateTeam()"><span>Crear Equipo</span></app-button>
        </div>
      </app-modal>

      <!-- Modal Editar Nombre Equipo -->
      <app-modal
        [(isOpen)]="showEditModal"
        title="Modificar Nombre del Equipo"
        size="sm"
        (closed)="showEditModal = false"
      >
        <div class="space-y-3">
          <label class="block text-xs font-semibold text-slate-700">Nombre Oficial</label>
          <app-input [(value)]="editTeamName" size="sm"></app-input>
        </div>
        <div modal-footer class="flex items-center justify-end gap-2.5 w-full">
          <app-button variant="ghost" size="sm" (clicked)="showEditModal = false"><span>Cancelar</span></app-button>
          <app-button variant="primary" size="sm" [disabled]="!editTeamName.trim()" (clicked)="confirmEditName()"><span>Guardar</span></app-button>
        </div>
      </app-modal>

      <!-- Modal Transferir Liderazgo (Exclusivo SUPER_ADMIN) -->
      <app-modal
        [(isOpen)]="showTransferModal"
        title="Transferir Liderazgo del Equipo"
        size="md"
        (closed)="showTransferModal = false"
      >
        <div class="space-y-4">
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <strong>Atención:</strong> La transferencia de liderazgo reasigna la coordinación del equipo al nuevo responsable seleccionado sin alterar los registros históricos del equipo.
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Seleccionar Nuevo Líder de Equipo *</label>
            <select 
              [(ngModel)]="transferNewLeaderUid"
              class="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none">
              @for (user of users; track user.uid || user.id) {
                <option [value]="user.uid || user.id">
                  {{ user.displayName || user.nombres }} ({{ user.email }})
                </option>
              }
            </select>
          </div>
        </div>

        <div modal-footer class="flex items-center justify-end gap-2.5 w-full">
          <app-button variant="ghost" size="sm" (clicked)="showTransferModal = false"><span>Cancelar</span></app-button>
          <app-button variant="danger" size="sm" (clicked)="confirmTransferLeadership()"><span>Confirmar Transferencia</span></app-button>
        </div>
      </app-modal>

      <!-- Componente Modal de Invitación -->
      <app-member-invite-modal
        [(isOpen)]="showInviteModal"
        [teamId]="selectedInviteTeamId"
        (invited)="loadData()"
      ></app-member-invite-modal>

    </div>
  `
})
export class TeamsPageComponent implements OnInit {
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly isSuperAdmin = this.authService.isSuperAdmin;

  teams: Team[] = [];
  users: User[] = [];
  invitations: Invitation[] = [];

  showCreateModal = false;
  newTeamName = '';
  newTeamLeaderUid = '';

  showEditModal = false;
  editingTeam: Team | null = null;
  editTeamName = '';

  showTransferModal = false;
  transferringTeam: Team | null = null;
  transferNewLeaderUid = '';

  showInviteModal = false;
  selectedInviteTeamId = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.teamService.getTeams().subscribe(t => this.teams = t);
    this.userService.getUsers().subscribe(u => {
      this.users = u;
      if (!this.newTeamLeaderUid && u.length > 0) {
        this.newTeamLeaderUid = u[0].uid || u[0].id || '';
      }
    });
    this.teamService.getInvitations().subscribe(inv => this.invitations = inv);
  }

  openCreateTeamModal(): void {
    this.newTeamName = '';
    this.showCreateModal = true;
  }

  async confirmCreateTeam(): Promise<void> {
    if (!this.newTeamName.trim()) return;
    const leader = this.users.find(u => (u.uid || u.id) === this.newTeamLeaderUid);
    try {
      await this.teamService.createTeam({
        team_name: this.newTeamName.trim(),
        leader_uid: this.newTeamLeaderUid,
        leader_name: leader?.displayName || leader?.nombres,
        leader_email: leader?.email
      });
      this.showCreateModal = false;
      this.toastService.success('Equipo Creado', `Equipo "${this.newTeamName}" registrado exitosamente.`);
      this.loadData();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No fue posible crear el equipo.');
    }
  }

  openEditNameModal(team: Team): void {
    this.editingTeam = team;
    this.editTeamName = team.team_name;
    this.showEditModal = true;
  }

  async confirmEditName(): Promise<void> {
    if (!this.editingTeam || !this.editTeamName.trim()) return;
    const teamId = this.editingTeam.team_id || this.editingTeam.id;
    if (!teamId) return;

    try {
      await this.teamService.updateTeamName(teamId, this.editTeamName.trim());
      this.showEditModal = false;
      this.toastService.success('Nombre Actualizado', 'El nombre del equipo fue actualizado.');
      this.loadData();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No se pudo actualizar el nombre.');
    }
  }

  openTransferModal(team: Team): void {
    this.transferringTeam = team;
    this.transferNewLeaderUid = team.leader_uid;
    this.showTransferModal = true;
  }

  async confirmTransferLeadership(): Promise<void> {
    if (!this.transferringTeam || !this.transferNewLeaderUid) return;
    const teamId = this.transferringTeam.team_id || this.transferringTeam.id;
    if (!teamId) return;

    const newLeader = this.users.find(u => (u.uid || u.id) === this.transferNewLeaderUid);

    try {
      await this.teamService.transferLeadership(
        teamId,
        this.transferNewLeaderUid,
        newLeader?.email,
        newLeader?.displayName || newLeader?.nombres
      );
      this.showTransferModal = false;
      this.toastService.success('Liderazgo Transferido', `Nuevo líder asignado: ${newLeader?.email}`);
      this.loadData();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No se pudo transferir el liderazgo.');
    }
  }

  openInviteModal(teamId: string): void {
    this.selectedInviteTeamId = teamId;
    this.showInviteModal = true;
  }
}
