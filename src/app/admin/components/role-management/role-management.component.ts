import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { Role, Permission, PermissionModule } from '../../../core/models/admin.model';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HasPermissionDirective],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Gestión de Roles y Permisos Atómicos</h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              RBAC Matriz
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Configura roles y asigna facultades atómicas para restringir o habilitar acciones en la plataforma.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Regresar a Usuarios -->
          <a 
            routerLink="../users" 
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a Usuarios</span>
          </a>

          <!-- Botón Nuevo Rol -->
          <button 
            *hasPermission="'ROLE_MANAGE'"
            (click)="openNewRoleDialog()" 
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Rol</span>
          </button>
        </div>
      </div>

      <!-- Layout de Dos Columnas: Lista de Roles (izq) y Matriz de Permisos (der) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- Columna Izquierda: Roles -->
        <div class="md:col-span-4 space-y-3">
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
              <span>Roles Disponibles</span>
              <span class="text-slate-400 font-normal">{{ roles.length }} registrados</span>
            </h2>

            <div class="space-y-2">
              <div 
                *ngFor="let r of roles" 
                (click)="selectRole(r)"
                [class.border-brand-500]="selectedRole?.id === r.id"
                [class.bg-brand-50/50]="selectedRole?.id === r.id"
                class="p-3 border rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition group">
                <div class="flex items-start justify-between">
                  <div class="font-bold text-slate-800 text-sm group-hover:text-brand-700 transition">
                    {{ r.nombre }}
                  </div>
                  <span *ngIf="r.esSistema" class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Sistema
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{{ r.descripcion }}</p>
                <div class="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-brand-600">
                  <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                  <span>{{ r.permisos.length }} permisos concedidos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Matriz de Permisos Atómicos -->
        <div class="md:col-span-8">
          <div *ngIf="selectedRole; else noRoleSelected" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-slate-900">Permisos para: {{ selectedRole.nombre }}</h3>
                  <span *ngIf="isChanged()" class="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    Cambios sin guardar
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">{{ selectedRole.descripcion }}</p>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="toggleAllPermissions()" 
                  class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium border border-slate-200">
                  {{ allSelected() ? 'Desmarcar Todos' : 'Marcar Todos' }}
                </button>

                <button 
                  *hasPermission="'ROLE_MANAGE'"
                  (click)="savePermissions()" 
                  [disabled]="!isChanged()"
                  class="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 rounded-lg shadow-sm shadow-brand-500/20 transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>

            <!-- Permisos agrupados por Módulo -->
            <div class="space-y-5">
              <div *ngFor="let group of groupedPermissions" class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Módulo {{ group.modulo }}</span>
                  <div class="h-px flex-1 bg-slate-100"></div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    *ngFor="let p of group.permisos" 
                    [class.border-brand-500]="isPermChecked(p.codigo)"
                    [class.bg-brand-50/20]="isPermChecked(p.codigo)"
                    class="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                    <input 
                      type="checkbox" 
                      [checked]="isPermChecked(p.codigo)" 
                      (change)="togglePermission(p.codigo)" 
                      class="mt-1 h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300">
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800">{{ p.nombre }}</span>
                        <code class="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-mono">{{ p.codigo }}</code>
                      </div>
                      <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{{ p.descripcion }}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

          </div>

          <ng-template #noRoleSelected>
            <div class="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400">
              <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="text-sm font-semibold text-slate-600">Selecciona un rol a la izquierda</p>
              <p class="text-xs text-slate-400 mt-1">Podrás inspeccionar y configurar en detalle las autorizaciones atómicas asociadas.</p>
            </div>
          </ng-template>
        </div>

      </div>

      <!-- Diálogo Crear Nuevo Rol Simple -->
      <div *ngIf="showNewRoleModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
          <h3 class="text-base font-bold text-slate-900 mb-1">Crear Nuevo Rol</h3>
          <p class="text-xs text-slate-500 mb-4">Define el nombre y la descripción para el nuevo rol de usuario.</p>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Rol</label>
              <input type="text" [(ngModel)]="newRoleName" placeholder="Ej: Supervisor Comunal" class="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-brand-500">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
              <textarea [(ngModel)]="newRoleDesc" rows="3" placeholder="Responsabilidades asignadas..." class="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-brand-500"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-5">
            <button (click)="showNewRoleModal = false" class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button (click)="confirmCreateRole()" [disabled]="!newRoleName.trim()" class="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm">Crear</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class RoleManagementComponent implements OnInit {
  private roleService = inject(RoleService);

  roles: Role[] = [];
  permissions: Permission[] = [];
  selectedRole: Role | null = null;
  activePermCodes: string[] = [];

  showNewRoleModal = false;
  newRoleName = '';
  newRoleDesc = '';

  groupedPermissions: { modulo: PermissionModule; permisos: Permission[] }[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.roleService.getRoles().subscribe(r => {
      this.roles = r;
      if (!this.selectedRole && r.length > 0) {
        this.selectRole(r[0]);
      }
    });

    this.roleService.getPermissions().subscribe(p => {
      this.permissions = p;
      this.groupPermissions();
    });
  }

  groupPermissions() {
    const modules: PermissionModule[] = ['USUARIOS', 'ROLES', 'AUDITORIA', 'CONFIGURACION'];
    this.groupedPermissions = modules
      .map(modulo => ({
        modulo,
        permisos: this.permissions.filter(p => p.modulo === modulo)
      }))
      .filter(g => g.permisos.length > 0);
  }

  selectRole(role: Role) {
    this.selectedRole = role;
    this.activePermCodes = [...role.permisos];
  }

  isPermChecked(code: string): boolean {
    return this.activePermCodes.includes(code);
  }

  togglePermission(code: string) {
    if (this.activePermCodes.includes(code)) {
      this.activePermCodes = this.activePermCodes.filter(c => c !== code);
    } else {
      this.activePermCodes.push(code);
    }
  }

  allSelected(): boolean {
    return this.permissions.length > 0 && this.permissions.every(p => this.activePermCodes.includes(p.codigo));
  }

  toggleAllPermissions() {
    if (this.allSelected()) {
      this.activePermCodes = [];
    } else {
      this.activePermCodes = this.permissions.map(p => p.codigo);
    }
  }

  isChanged(): boolean {
    if (!this.selectedRole) return false;
    const original = [...this.selectedRole.permisos].sort().join(',');
    const current = [...this.activePermCodes].sort().join(',');
    return original !== current;
  }

  async savePermissions() {
    if (this.selectedRole?.id) {
      await this.roleService.updateRole(this.selectedRole.id, {
        permisos: this.activePermCodes
      });
      this.selectedRole.permisos = [...this.activePermCodes];
      alert('Matriz de permisos actualizada con éxito.');
    }
  }

  openNewRoleDialog() {
    this.newRoleName = '';
    this.newRoleDesc = '';
    this.showNewRoleModal = true;
  }

  async confirmCreateRole() {
    if (!this.newRoleName.trim()) return;
    const newId = await this.roleService.createRole({
      nombre: this.newRoleName.trim(),
      descripcion: this.newRoleDesc.trim(),
      permisos: ['USER_VIEW'],
      esSistema: false
    });
    this.showNewRoleModal = false;
    this.loadData();
  }
}
