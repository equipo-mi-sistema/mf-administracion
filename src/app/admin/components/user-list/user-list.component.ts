import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, UserFilter } from '../../../core/models/admin.model';
import { UserFormModalComponent } from '../user-form-modal/user-form-modal.component';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import {
  AvatarComponent,
  BadgeComponent,
  BadgeVariant,
  ButtonComponent,
  IconComponent,
  InputComponent
} from '../../../shared/components/atomics';
import {
  SearchInputComponent,
  SelectComponent,
  SelectOption,
  StatCardComponent
} from '../../../shared/components/molecules';
import {
  ConfirmModalComponent,
  EmptyStateCardComponent
} from '../../../shared/components/organism';
import { ToastService } from '../../../shared/components/organism/toast';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    UserFormModalComponent,
    HasPermissionDirective,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    AvatarComponent,
    InputComponent,
    SearchInputComponent,
    SelectComponent,
    StatCardComponent,
    EmptyStateCardComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Encabezado de la Sección -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Directorio de Usuarios</h1>
            <app-badge variant="brand" size="sm">ABAC & RBAC</app-badge>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión de identidades centralizadas, asignación de roles y delimitación de alcance territorial.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Botón de Enlace a Roles -->
          <a routerLink="../roles">
            <app-button variant="outline" size="sm">
              <app-icon name="shield" size="sm"></app-icon>
              <span>Matriz de Roles</span>
            </app-button>
          </a>

          <!-- Botón Crear Usuario (Guarded by *hasPermission) -->
          <app-button 
            *hasPermission="'USER_CREATE'"
            variant="primary" 
            size="sm"
            (clicked)="openCreateModal()"
          >
            <app-icon name="plus" size="sm"></app-icon>
            <span>Nuevo Usuario</span>
          </app-button>
        </div>
      </div>

      <!-- Tarjetas de Métricas Rápidas Reutilizando StatCardComponent -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Total Usuarios"
          description="Identidades registradas en el sistema"
          [badgeText]="users.length.toString()"
          badgeVariant="neutral"
          iconName="users"
          iconColorClass="bg-brand-50 text-brand-600"
        ></app-stat-card>

        <app-stat-card
          title="Usuarios Activos"
          description="Con acceso operativo concedido"
          [badgeText]="countByState('ACTIVO').toString()"
          badgeVariant="success"
          iconName="check"
          iconColorClass="bg-emerald-50 text-emerald-600"
        ></app-stat-card>

        <app-stat-card
          title="Usuarios Inactivos"
          description="Acceso en pausa o suspendido"
          [badgeText]="countByState('INACTIVO').toString()"
          badgeVariant="warning"
          iconName="warning"
          iconColorClass="bg-amber-50 text-amber-600"
        ></app-stat-card>

        <app-stat-card
          title="Bloqueados"
          description="Restringidos por políticas o seguridad"
          [badgeText]="countByState('BLOQUEADO').toString()"
          badgeVariant="danger"
          iconName="close"
          iconColorClass="bg-rose-50 text-rose-600"
        ></app-stat-card>
      </div>

      <!-- Panel de Filtros Interactivos (Búsqueda, Ciudad, Comuna, Estado) -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <app-icon name="search" size="sm" class="text-brand-600"></app-icon>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Filtros de Búsqueda</span>
          </div>
          <app-button
            *ngIf="hasActiveFilters()" 
            variant="ghost" 
            size="sm"
            (clicked)="resetFilters()"
          >
            <span>Limpiar Filtros</span>
          </app-button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <!-- Búsqueda por Nombre / Correo -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Buscar</label>
            <app-search-input 
              [value]="filters.search || ''"
              (search)="onSearchChange($event)"
              placeholder="Nombre o correo..." 
              size="sm"
            ></app-search-input>
          </div>

          <!-- Filtro por Ciudad -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Ciudad</label>
            <app-input 
              [value]="filters.ciudad || ''" 
              (inputChange)="onCiudadChange($event)" 
              placeholder="Ej: Medellín o Bello" 
              size="sm"
            ></app-input>
          </div>

          <!-- Filtro por Comuna -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Comuna (ABAC)</label>
            <app-input 
              [value]="filters.comuna || ''" 
              (inputChange)="onComunaChange($event)" 
              placeholder="Ej: Comuna 10, Comuna 4" 
              size="sm"
            ></app-input>
          </div>

          <!-- Filtro por Estado -->
          <div>
            <app-select 
              label="Estado"
              [value]="filters.estado || ''" 
              [options]="estadoFilterOptions"
              placeholder="Todos los Estados"
              (changed)="onEstadoChange($event)"
            ></app-select>
          </div>
        </div>
      </div>

      <!-- Tabla de Datos con Estándar Design System -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th class="py-3.5 px-4">Usuario</th>
                <th class="py-3.5 px-4">Rol Asignado</th>
                <th class="py-3.5 px-4">Ámbito Territorial (ABAC Scope)</th>
                <th class="py-3.5 px-4">Estado</th>
                <th class="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let u of filteredUsers" class="hover:bg-slate-50/60 transition">
                
                <!-- Identidad con Avatar Reutilizable -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <app-avatar [initials]="getInitials(u)" size="md"></app-avatar>
                    <div>
                      <div class="font-semibold text-slate-800 text-xs sm:text-sm">{{ u.nombres }} {{ u.apellidos }}</div>
                      <div class="text-slate-400 text-[11px] font-mono">{{ u.email }}</div>
                    </div>
                  </div>
                </td>

                <!-- Rol con Badge Reutilizable -->
                <td class="py-3 px-4">
                  <app-badge variant="neutral" size="sm">
                    {{ u.rolNombre || u.rolId }}
                  </app-badge>
                </td>

                <!-- Scope Territorial -->
                <td class="py-3 px-4">
                  <div class="flex flex-col gap-1">
                    <div class="font-medium text-slate-700 text-xs">
                      {{ u.scope.ciudad }}, {{ u.scope.departamento }}
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <ng-container *ngIf="u.scope.comunas.includes('*'); else comunasTags">
                        <app-badge variant="brand" size="sm">
                          Todas las Comunas (*)
                        </app-badge>
                      </ng-container>
                      <ng-template #comunasTags>
                        <app-badge 
                          *ngFor="let c of u.scope.comunas" 
                          variant="neutral" 
                          size="sm"
                        >
                          {{ c }}
                        </app-badge>
                      </ng-template>
                    </div>
                  </div>
                </td>

                <!-- Estado con Badge Reutilizable y Dot -->
                <td class="py-3 px-4">
                  <app-badge [variant]="getEstadoVariant(u.estado)" [dot]="true" size="sm">
                    {{ u.estado }}
                  </app-badge>
                </td>

                <!-- Acciones con Botones e Íconos Atómicos -->
                <td class="py-3 px-4 text-right">
                  <div class="inline-flex items-center gap-1">
                    <app-button 
                      *hasPermission="'USER_EDIT'"
                      variant="ghost" 
                      size="icon"
                      (clicked)="openEditModal(u)" 
                      title="Editar usuario y alcance"
                    >
                      <app-icon name="edit" size="sm" class="text-slate-500 hover:text-brand-600"></app-icon>
                    </app-button>

                    <app-button 
                      *hasPermission="'USER_DELETE'"
                      variant="ghost" 
                      size="icon"
                      (clicked)="promptDeleteUser(u)" 
                      title="Eliminar usuario"
                    >
                      <app-icon name="trash" size="sm" class="text-slate-400 hover:text-rose-600"></app-icon>
                    </app-button>
                  </div>
                </td>
              </tr>

              <!-- Fila vacía con EmptyStateCardComponent Reutilizable -->
              <tr *ngIf="filteredUsers.length === 0">
                <td colspan="5" class="py-8 px-4 text-center">
                  <app-empty-state-card
                    iconName="search"
                    title="No se encontraron usuarios"
                    description="Prueba ajustando los criterios de los filtros de búsqueda superiores."
                  >
                    <app-button 
                      *ngIf="hasActiveFilters()" 
                      variant="outline" 
                      size="sm" 
                      (clicked)="resetFilters()"
                    >
                      <span>Restablecer Filtros</span>
                    </app-button>
                  </app-empty-state-card>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Componente Modal para Creación/Edición -->
      <app-user-form-modal
        *ngIf="showModal"
        [user]="selectedUser"
        (close)="showModal = false"
        (onSaved)="handleSave($event)">
      </app-user-form-modal>

      <!-- Modal de Confirmación Estilizado Reutilizable -->
      <app-confirm-modal
        [(isOpen)]="showDeleteConfirm"
        title="Eliminar Usuario"
        [message]="deleteConfirmMessage"
        confirmText="Eliminar"
        variant="danger"
        [loading]="deleting"
        (confirmed)="confirmDeleteUser()"
        (cancelled)="cancelDelete()"
      ></app-confirm-modal>

    </div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  users: User[] = [];
  filteredUsers: User[] = [];
  filters: UserFilter = { ciudad: '', comuna: '', estado: '', search: '' };

  estadoFilterOptions: SelectOption[] = [
    { label: 'Todos los Estados', value: '' },
    { label: 'ACTIVO', value: 'ACTIVO' },
    { label: 'INACTIVO', value: 'INACTIVO' },
    { label: 'BLOQUEADO', value: 'BLOQUEADO' }
  ];

  showModal = false;
  selectedUser: User | null = null;

  // Confirm delete modal state
  showDeleteConfirm = false;
  userToDelete: User | null = null;
  deleteConfirmMessage = '';
  deleting = false;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
      this.applyFilters();
    });
  }

  applyFilters() {
    const s = (this.filters.search || '').trim().toLowerCase();
    const c = (this.filters.ciudad || '').trim().toLowerCase();
    const com = (this.filters.comuna || '').trim().toLowerCase();
    const e = this.filters.estado || '';

    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !s || 
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(s) || 
        u.email.toLowerCase().includes(s);

      const matchEstado = !e || u.estado === e;

      const matchCiudad = !c || 
        (u.scope?.ciudad && u.scope.ciudad.toLowerCase().includes(c));

      const matchComuna = !com || 
        (u.scope?.comunas && (u.scope.comunas.includes('*') || u.scope.comunas.some(cm => cm.toLowerCase().includes(com))));

      return matchSearch && matchEstado && matchCiudad && matchComuna;
    });
  }

  onSearchChange(search: string) {
    this.filters.search = search;
    this.applyFilters();
  }

  onCiudadChange(ciudad: string) {
    this.filters.ciudad = ciudad;
    this.applyFilters();
  }

  onComunaChange(comuna: string) {
    this.filters.comuna = comuna;
    this.applyFilters();
  }

  onEstadoChange(estado: any) {
    this.filters.estado = estado;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.ciudad || this.filters.comuna || this.filters.estado);
  }

  resetFilters() {
    this.filters = { ciudad: '', comuna: '', estado: '', search: '' };
    this.applyFilters();
  }

  countByState(state: string): number {
    return this.users.filter(u => u.estado === state).length;
  }

  getEstadoVariant(estado: string): BadgeVariant {
    switch (estado) {
      case 'ACTIVO':
        return 'success';
      case 'INACTIVO':
        return 'warning';
      case 'BLOQUEADO':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  getInitials(u: User): string {
    const n = u.nombres ? u.nombres[0] : '';
    const a = u.apellidos ? u.apellidos[0] : '';
    return (n + a).toUpperCase() || 'U';
  }

  openCreateModal() {
    this.selectedUser = null;
    this.showModal = true;
  }

  openEditModal(user: User) {
    this.selectedUser = user;
    this.showModal = true;
  }

  async handleSave(userData: Partial<User>) {
    try {
      if (this.selectedUser?.id) {
        await this.userService.updateUser(this.selectedUser.id, userData);
        this.toastService.success('Usuario actualizado', `${userData.nombres || 'El usuario'} ha sido modificado con éxito.`);
      } else {
        await this.userService.createUser(userData as Omit<User, 'id'>);
        this.toastService.success('Usuario creado', `${userData.nombres || 'El nuevo usuario'} ha sido registrado.`);
      }
      this.showModal = false;
      this.loadUsers();
    } catch {
      this.toastService.error('Error', 'No fue posible guardar el usuario.');
    }
  }

  promptDeleteUser(user: User) {
    this.userToDelete = user;
    this.deleteConfirmMessage = `¿Estás seguro de que deseas eliminar permanentemente a ${user.nombres} ${user.apellidos}? Esta acción no se puede deshacer.`;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
  }

  async confirmDeleteUser() {
    if (!this.userToDelete?.id) return;
    this.deleting = true;
    try {
      await this.userService.deleteUser(this.userToDelete.id);
      this.toastService.success('Usuario eliminado', 'El usuario fue eliminado del directorio.');
      this.showDeleteConfirm = false;
      this.userToDelete = null;
      this.loadUsers();
    } catch {
      this.toastService.error('Error', 'No se pudo eliminar el usuario.');
    } finally {
      this.deleting = false;
    }
  }
}
