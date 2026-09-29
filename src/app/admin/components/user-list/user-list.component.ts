import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, UserFilter } from '../../../core/models/admin.model';
import { UserFormModalComponent } from '../user-form-modal/user-form-modal.component';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserFormModalComponent, HasPermissionDirective],
  template: `
    <div class="space-y-6">
      
      <!-- Encabezado de la Sección -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Directorio de Usuarios</h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
              ABAC & RBAC
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Gestión de identidades centralizadas, asignación de roles y delimitación de alcance territorial.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Botón de Enlace a Roles -->
          <a 
            routerLink="../roles" 
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Matriz de Roles</span>
          </a>

          <!-- Botón Crear Usuario (Guarded by *hasPermission) -->
          <button 
            *hasPermission="'USER_CREATE'"
            (click)="openCreateModal()" 
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas Rápidas -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span class="text-xs font-medium text-slate-500">Total Usuarios</span>
          <div class="text-2xl font-bold text-slate-900 mt-1">{{ users.length }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span class="text-xs font-medium text-slate-500">Activos</span>
          <div class="text-2xl font-bold text-emerald-600 mt-1">{{ countByState('ACTIVO') }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span class="text-xs font-medium text-slate-500">Inactivos</span>
          <div class="text-2xl font-bold text-amber-600 mt-1">{{ countByState('INACTIVO') }}</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span class="text-xs font-medium text-slate-500">Bloqueados</span>
          <div class="text-2xl font-bold text-rose-600 mt-1">{{ countByState('BLOQUEADO') }}</div>
        </div>
      </div>

      <!-- Panel de Filtros Interactivos (Ciudad, Comuna, Estado, Búsqueda) -->
      <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Filtros de Búsqueda</span>
          <button 
            *ngIf="hasActiveFilters()" 
            (click)="resetFilters()" 
            class="text-xs text-brand-600 hover:text-brand-800 font-medium">
            Limpiar Filtros
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <!-- Búsqueda por Nombre / Correo -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Buscar</label>
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="filters.search" 
                (ngModelChange)="applyFilters()" 
                placeholder="Nombre o correo..." 
                class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Filtro por Ciudad -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Ciudad</label>
            <input 
              type="text" 
              [(ngModel)]="filters.ciudad" 
              (ngModelChange)="applyFilters()" 
              placeholder="Ej: Medellín o Bello" 
              class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
          </div>

          <!-- Filtro por Comuna -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Comuna (ABAC)</label>
            <input 
              type="text" 
              [(ngModel)]="filters.comuna" 
              (ngModelChange)="applyFilters()" 
              placeholder="Ej: Comuna 10, Comuna 4" 
              class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
          </div>

          <!-- Filtro por Estado -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Estado</label>
            <select 
              [(ngModel)]="filters.estado" 
              (ngModelChange)="applyFilters()" 
              class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
              <option value="">Todos los Estados</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="BLOQUEADO">BLOQUEADO</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabla de Datos -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th class="py-3 px-4">Usuario</th>
                <th class="py-3 px-4">Rol Asignado</th>
                <th class="py-3 px-4">Ámbito Territorial (ABAC Scope)</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let u of filteredUsers" class="hover:bg-slate-50/60 transition">
                
                <!-- Identidad -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {{ getInitials(u) }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-800">{{ u.nombres }} {{ u.apellidos }}</div>
                      <div class="text-slate-400 text-[11px]">{{ u.email }}</div>
                    </div>
                  </div>
                </td>

                <!-- Rol -->
                <td class="py-3 px-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 text-slate-700">
                    {{ u.rolNombre || u.rolId }}
                  </span>
                </td>

                <!-- Scope Territorial -->
                <td class="py-3 px-4">
                  <div class="flex flex-col gap-1">
                    <div class="font-medium text-slate-700">
                      {{ u.scope.ciudad }}, {{ u.scope.departamento }}
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <ng-container *ngIf="u.scope.comunas.includes('*'); else comunasTags">
                        <span class="px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 border border-sky-200">
                          Todas las Comunas (*)
                        </span>
                      </ng-container>
                      <ng-template #comunasTags>
                        <span 
                          *ngFor="let c of u.scope.comunas" 
                          class="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                          {{ c }}
                        </span>
                      </ng-template>
                    </div>
                  </div>
                </td>

                <!-- Estado -->
                <td class="py-3 px-4">
                  <span [ngClass]="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': u.estado === 'ACTIVO',
                    'bg-amber-50 text-amber-700 border-amber-200': u.estado === 'INACTIVO',
                    'bg-rose-50 text-rose-700 border-rose-200': u.estado === 'BLOQUEADO'
                  }" class="inline-flex items-center px-2 py-0.5 rounded-full font-semibold border text-[11px]">
                    {{ u.estado }}
                  </span>
                </td>

                <!-- Acciones Guarded by Directives -->
                <td class="py-3 px-4 text-right">
                  <div class="inline-flex items-center gap-2">
                    <button 
                      *hasPermission="'USER_EDIT'"
                      (click)="openEditModal(u)" 
                      title="Editar usuario y alcance"
                      class="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button 
                      *hasPermission="'USER_DELETE'"
                      (click)="deleteUser(u)" 
                      title="Eliminar usuario"
                      class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Fila vacía cuando no hay coincidencias -->
              <tr *ngIf="filteredUsers.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-sm font-medium text-slate-600">No se encontraron usuarios</p>
                    <p class="text-xs text-slate-400 mt-0.5">Prueba ajustando los criterios de los filtros superiores.</p>
                  </div>
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
    </div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  filteredUsers: User[] = [];
  filters: UserFilter = { ciudad: '', comuna: '', estado: '', search: '' };

  showModal = false;
  selectedUser: User | null = null;

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
    if (this.selectedUser?.id) {
      await this.userService.updateUser(this.selectedUser.id, userData);
    } else {
      await this.userService.createUser(userData as Omit<User, 'id'>);
    }
    this.showModal = false;
    this.loadUsers();
  }

  async deleteUser(user: User) {
    if (confirm(`¿Estás seguro de eliminar al usuario ${user.nombres} ${user.apellidos}?`)) {
      if (user.id) {
        await this.userService.deleteUser(user.id);
      }
      this.loadUsers();
    }
  }
}
