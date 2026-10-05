import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { Role, Permission, PermissionModule } from '../../../core/models/admin.model';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import {
  BadgeComponent,
  ButtonComponent,
  CheckboxComponent,
  IconComponent,
  InputComponent,
  TextareaComponent
} from '../../../shared/components/atomics';
import {
  EmptyStateCardComponent,
  ModalComponent
} from '../../../shared/components/organism';
import { ToastService } from '../../../shared/components/organism/toast';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HasPermissionDirective,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    CheckboxComponent,
    InputComponent,
    TextareaComponent,
    ModalComponent,
    EmptyStateCardComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Gestión de Roles y Permisos Atómicos</h1>
            <app-badge variant="brand" size="sm">RBAC Matriz</app-badge>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Configura roles y asigna facultades atómicas para restringir o habilitar acciones en la plataforma.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Regresar a Usuarios -->
          <a routerLink="../users">
            <app-button variant="outline" size="sm">
              <app-icon name="arrow-left" size="sm"></app-icon>
              <span>Volver a Usuarios</span>
            </app-button>
          </a>

          <!-- Botón Nuevo Rol -->
          <app-button 
            *hasPermission="'ROLE_MANAGE'"
            variant="primary" 
            size="sm"
            (clicked)="openNewRoleDialog()"
          >
            <app-icon name="plus" size="sm"></app-icon>
            <span>Nuevo Rol</span>
          </app-button>
        </div>
      </div>

      <!-- Layout de Dos Columnas: Lista de Roles (izq) y Matriz de Permisos (der) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- Columna Izquierda: Roles -->
        <div class="md:col-span-4 space-y-3">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Roles Disponibles</span>
              <app-badge variant="neutral" size="sm">{{ roles.length }} registrados</app-badge>
            </div>

            <div class="space-y-2">
              <div 
                *ngFor="let r of roles" 
                (click)="selectRole(r)"
                [class.border-brand-500]="selectedRole?.id === r.id"
                [class.bg-brand-50/40]="selectedRole?.id === r.id"
                [class.ring-2]="selectedRole?.id === r.id"
                [class.ring-brand-500/20]="selectedRole?.id === r.id"
                class="p-3.5 border border-slate-200/90 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50/80 transition-all duration-fast group">
                <div class="flex items-start justify-between gap-2">
                  <div class="font-bold text-slate-800 text-sm group-hover:text-brand-700 transition-colors">
                    {{ r.nombre }}
                  </div>
                  <app-badge *ngIf="r.esSistema" variant="neutral" size="sm">
                    Sistema
                  </app-badge>
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
          <div *ngIf="selectedRole; else noRoleSelected" class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-slate-900">Permisos para: {{ selectedRole.nombre }}</h3>
                  <app-badge *ngIf="isChanged()" variant="warning" size="sm" [dot]="true">
                    Cambios sin guardar
                  </app-badge>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">{{ selectedRole.descripcion }}</p>
              </div>

              <div class="flex items-center gap-2">
                <app-button 
                  variant="outline" 
                  size="sm"
                  (clicked)="toggleAllPermissions()"
                >
                  <span>{{ allSelected() ? 'Desmarcar Todos' : 'Marcar Todos' }}</span>
                </app-button>

                <app-button 
                  *hasPermission="'ROLE_MANAGE'"
                  variant="primary" 
                  size="sm"
                  [disabled]="!isChanged()"
                  (clicked)="savePermissions()"
                >
                  <app-icon name="check" size="sm"></app-icon>
                  <span>Guardar Cambios</span>
                </app-button>
              </div>
            </div>

            <!-- Permisos agrupados por Módulo -->
            <div class="space-y-6">
              <div *ngFor="let group of groupedPermissions" class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Módulo {{ group.modulo }}</span>
                  <div class="h-px flex-1 bg-slate-100"></div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    *ngFor="let p of group.permisos" 
                    [class.border-brand-500]="isPermChecked(p.codigo)"
                    [class.bg-brand-50/25]="isPermChecked(p.codigo)"
                    class="flex items-start gap-3 p-3.5 border border-slate-200/90 rounded-xl transition-all duration-fast hover:bg-slate-50/80">
                    <app-checkbox 
                      [checked]="isPermChecked(p.codigo)" 
                      (changed)="togglePermission(p.codigo)"
                    ></app-checkbox>
                    <div class="flex-1 min-w-0" (click)="togglePermission(p.codigo)">
                      <div class="flex items-center justify-between gap-1.5 cursor-pointer">
                        <span class="text-xs font-bold text-slate-800">{{ p.nombre }}</span>
                        <code class="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-mono">{{ p.codigo }}</code>
                      </div>
                      <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed cursor-pointer">{{ p.descripcion }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <ng-template #noRoleSelected>
            <app-empty-state-card
              iconName="info"
              title="Selecciona un rol a la izquierda"
              description="Podrás inspeccionar y configurar en detalle las autorizaciones atómicas asociadas."
            ></app-empty-state-card>
          </ng-template>
        </div>

      </div>

      <!-- Diálogo Crear Nuevo Rol Reutilizando ModalComponent -->
      <app-modal
        [(isOpen)]="showNewRoleModal"
        title="Crear Nuevo Rol"
        size="md"
        (closed)="showNewRoleModal = false"
      >
        <p class="text-xs text-slate-500 -mt-2 mb-4">Define el nombre y la descripción para el nuevo rol de usuario.</p>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Rol *</label>
            <app-input 
              [(value)]="newRoleName" 
              placeholder="Ej: Supervisor Comunal" 
              size="sm"
            ></app-input>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <app-textarea 
              [(value)]="newRoleDesc" 
              [rows]="3" 
              placeholder="Responsabilidades asignadas al rol..."
            ></app-textarea>
          </div>
        </div>

        <div modal-footer class="flex items-center justify-end gap-2.5 w-full">
          <app-button 
            variant="ghost" 
            size="sm" 
            (clicked)="showNewRoleModal = false"
          >
            <span>Cancelar</span>
          </app-button>

          <app-button 
            variant="primary" 
            size="sm" 
            [disabled]="!newRoleName.trim()" 
            (clicked)="confirmCreateRole()"
          >
            <span>Crear Rol</span>
          </app-button>
        </div>
      </app-modal>

    </div>
  `
})
export class RoleManagementComponent implements OnInit {
  private roleService = inject(RoleService);
  private toastService = inject(ToastService);

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
      try {
        await this.roleService.updateRole(this.selectedRole.id, {
          permisos: this.activePermCodes
        });
        this.selectedRole.permisos = [...this.activePermCodes];
        this.toastService.success('Matriz actualizada', `Se guardaron los permisos para ${this.selectedRole.nombre}.`);
      } catch {
        this.toastService.error('Error', 'No fue posible actualizar los permisos.');
      }
    }
  }

  openNewRoleDialog() {
    this.newRoleName = '';
    this.newRoleDesc = '';
    this.showNewRoleModal = true;
  }

  async confirmCreateRole() {
    if (!this.newRoleName.trim()) return;
    try {
      await this.roleService.createRole({
        nombre: this.newRoleName.trim(),
        descripcion: this.newRoleDesc.trim(),
        permisos: ['USER_VIEW'],
        esSistema: false
      });
      const createdName = this.newRoleName.trim();
      this.showNewRoleModal = false;
      this.toastService.success('Rol creado', `El rol "${createdName}" ha sido creado con éxito.`);
      this.loadData();
    } catch {
      this.toastService.error('Error', 'No fue posible crear el nuevo rol.');
    }
  }
}
