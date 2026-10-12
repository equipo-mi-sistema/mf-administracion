import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RoleService, MicroappDefinition } from '../../core/services/role.service';
import { Role, RolePermissionsMap } from '../../core/models/admin.model';
import { AuthService } from '../../core/auth/auth.service';
import {
  BadgeComponent,
  ButtonComponent,
  IconComponent,
  InputComponent,
  TextareaComponent,
  ToggleComponent
} from '../../shared/components/atomics';
import {
  EmptyStateCardComponent,
  ModalComponent
} from '../../shared/components/organism';
import { AccordionComponent } from '../../shared/components/organism/accordion/accordion.component';
import { AccordionItemComponent } from '../../shared/components/molecules/accordion-item.component';
import { ToastService } from '../../shared/components/organism/toast';

@Component({
  selector: 'app-roles-manager-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ButtonComponent,
  IconComponent,
  BadgeComponent,
  ToggleComponent,
  InputComponent,
  TextareaComponent,
    ModalComponent,
    EmptyStateCardComponent,
    AccordionComponent,
    AccordionItemComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Encabezado de Gobernanza -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Gobernanza de Roles y Permisos (RBAC)</h1>
            <app-badge variant="brand" size="sm">Ecosistema Polyrepo</app-badge>
            @if (!isSuperAdmin()) {
              <app-badge variant="neutral" size="sm">Solo Lectura</app-badge>
            }
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Matriz de permisos segmentada por microaplicación para gobernar el acceso perimetral.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a routerLink="../members">
            <app-button variant="outline" size="sm">
              <app-icon name="arrow-left" size="sm"></app-icon>
              <span>Ver Miembros</span>
            </app-button>
          </a>

          @if (isSuperAdmin()) {
            <app-button 
              variant="primary" 
              size="sm"
              (clicked)="openNewRoleDialog()"
            >
              <app-icon name="plus" size="sm"></app-icon>
              <span>Crear Rol Global</span>
            </app-button>
          }
        </div>
      </div>

      <!-- Contenedor Maestro: Lista de Roles (izq) y Acordeón de Microapps (der) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- Columna Izquierda: Roles Registrados -->
        <div class="md:col-span-4 space-y-3">
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Roles del Sistema</span>
              <app-badge variant="neutral" size="sm">{{ roles.length }} activos</app-badge>
            </div>

            <div class="space-y-2">
              @for (r of roles; track r.id || r.role_id) {
                <div 
                  (click)="selectRole(r)"
                  [class.border-brand-500]="selectedRole?.id === r.id || selectedRole?.role_id === r.role_id"
                  [class.bg-brand-50/40]="selectedRole?.id === r.id || selectedRole?.role_id === r.role_id"
                  [class.ring-2]="selectedRole?.id === r.id || selectedRole?.role_id === r.role_id"
                  [class.ring-brand-500/20]="selectedRole?.id === r.id || selectedRole?.role_id === r.role_id"
                  class="p-3.5 border border-slate-200/90 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50/80 transition-all duration-fast group">
                  <div class="flex items-start justify-between gap-2">
                    <div class="font-bold text-slate-800 text-sm group-hover:text-brand-700 transition-colors">
                      {{ r.role_name || r.nombre }}
                    </div>
                    @if (r.esSistema) {
                      <app-badge variant="neutral" size="sm">Sistema</app-badge>
                    }
                  </div>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {{ r.descripcion || 'Rol configurado en el directorio activo.' }}
                  </p>
                  <div class="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-brand-600">
                    <span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                    <span>{{ countGrantedPermissions(r) }} permisos concedidos</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Acordeón por Microapp -->
        <div class="md:col-span-8">
          @if (selectedRole) {
            <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card space-y-6">
              
              <!-- Barra de herramientas del Rol -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-slate-900">
                      Permisos para: {{ selectedRole.role_name || selectedRole.nombre }}
                    </h3>
                    @if (hasUnsavedChanges()) {
                      <app-badge variant="warning" size="sm" [dot]="true">Cambios sin guardar</app-badge>
                    }
                    @if (!isSuperAdmin()) {
                      <app-badge variant="neutral" size="sm">Modo Inspección</app-badge>
                    }
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    {{ selectedRole.descripcion || 'Ajuste fino de facultades por cada módulo remoto.' }}
                  </p>
                </div>

                @if (isSuperAdmin()) {
                  <div class="flex items-center gap-2">
                    <app-button 
                      variant="primary" 
                      size="sm"
                      [disabled]="!hasUnsavedChanges()"
                      (clicked)="saveRolePermissions()"
                    >
                      <app-icon name="check" size="sm"></app-icon>
                      <span>Guardar Matriz</span>
                    </app-button>
                  </div>
                }
              </div>

              <!-- Componente de Acordeón Reutilizable por Microapp -->
              <app-accordion [accordionMode]="false">
                @for (microapp of microapps; track microapp.id) {
                  <app-accordion-item
                    [title]="microapp.name"
                    [subtitle]="microapp.description"
                    [icon]="microapp.icon"
                    [isOpen]="true"
                  >
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      @for (perm of microapp.permissions; track perm.code) {
                        <div 
                          [class.border-brand-500]="isPermissionActive(microapp.id, perm.code)"
                          [class.bg-brand-50/20]="isPermissionActive(microapp.id, perm.code)"
                          class="flex items-start justify-between gap-3 p-3.5 border border-slate-200 rounded-xl transition-all hover:bg-slate-50/80">
                          
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5">
                              <span class="text-xs font-bold text-slate-800">{{ perm.label }}</span>
                              <code class="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-mono">{{ perm.code }}</code>
                            </div>
                            <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{{ perm.description }}</p>
                          </div>

                          <div class="flex-shrink-0 pt-0.5">
                            <app-toggle
                              [checked]="isPermissionActive(microapp.id, perm.code)"
                              [disabled]="!isSuperAdmin()"
                              (toggled)="togglePermission(microapp.id, perm.code)"
                            ></app-toggle>
                          </div>
                        </div>
                      }
                    </div>
                  </app-accordion-item>
                }
              </app-accordion>

            </div>
          } @else {
            <app-empty-state-card
              iconName="shield"
              title="Selecciona un rol para ver su matriz"
              description="Podrás inspeccionar el acordeón de microapps y conmutar permisos atómicos en tiempo real."
            ></app-empty-state-card>
          }
        </div>

      </div>

      <!-- Modal Crear Nuevo Rol -->
      <app-modal
        [(isOpen)]="showNewRoleModal"
        title="Crear Nuevo Rol Global"
        size="md"
        (closed)="showNewRoleModal = false"
      >
        <p class="text-xs text-slate-500 -mt-2 mb-4">
          Define el identificador y propósito del nuevo rol antes de configurar su matriz en el acordeón.
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Rol *</label>
            <app-input 
              [(value)]="newRoleName" 
              placeholder="Ej: Auditor Electoral Comunal" 
              size="sm"
            ></app-input>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <app-textarea 
              [(value)]="newRoleDesc" 
              [rows]="3" 
              placeholder="Facultades y responsabilidades asignadas..."
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
export class RolesManagerPageComponent implements OnInit {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly isSuperAdmin = this.authService.isSuperAdmin;

  roles: Role[] = [];
  microapps: MicroappDefinition[] = [];
  selectedRole: Role | null = null;
  activePermissionsMap: RolePermissionsMap = {
    administracion: [],
    mapeo: [],
    gestion: [],
    asistencia: [],
    transporte: [],
    conteo: []
  };

  showNewRoleModal = false;
  newRoleName = '';
  newRoleDesc = '';

  ngOnInit(): void {
    this.microapps = this.roleService.getMicroapps();
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe((r) => {
      this.roles = r;
      if (!this.selectedRole && r.length > 0) {
        this.selectRole(r[0]);
      }
    });
  }

  selectRole(role: Role): void {
    this.selectedRole = role;
    this.activePermissionsMap = {
      administracion: [...(role.permissions?.administracion || [])],
      mapeo: [...(role.permissions?.mapeo || [])],
      gestion: [...(role.permissions?.gestion || [])],
      asistencia: [...(role.permissions?.asistencia || [])],
      transporte: [...(role.permissions?.transporte || [])],
      conteo: [...(role.permissions?.conteo || [])]
    };
  }

  countGrantedPermissions(role: Role): number {
    if (!role.permissions) return role.permisos?.length || 0;
    return Object.values(role.permissions).reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
  }

  isPermissionActive(microappId: string, permCode: string): boolean {
    const list = this.activePermissionsMap[microappId] || [];
    return list.includes(permCode);
  }

  togglePermission(microappId: string, permCode: string): void {
    if (!this.isSuperAdmin()) return;

    const list = this.activePermissionsMap[microappId] || [];
    if (list.includes(permCode)) {
      this.activePermissionsMap[microappId] = list.filter(p => p !== permCode);
    } else {
      this.activePermissionsMap[microappId] = [...list, permCode];
    }
  }

  hasUnsavedChanges(): boolean {
    if (!this.selectedRole) return false;
    const currentJson = JSON.stringify(this.activePermissionsMap);
    const savedMap: RolePermissionsMap = {
      administracion: [...(this.selectedRole.permissions?.administracion || [])],
      mapeo: [...(this.selectedRole.permissions?.mapeo || [])],
      gestion: [...(this.selectedRole.permissions?.gestion || [])],
      asistencia: [...(this.selectedRole.permissions?.asistencia || [])],
      transporte: [...(this.selectedRole.permissions?.transporte || [])],
      conteo: [...(this.selectedRole.permissions?.conteo || [])]
    };
    return currentJson !== JSON.stringify(savedMap);
  }

  async saveRolePermissions(): Promise<void> {
    if (!this.selectedRole) return;
    const targetId = this.selectedRole.id || this.selectedRole.role_id;
    if (!targetId) return;

    try {
      // Consolidar lista plana para retrocompatibilidad
      const flatCodes: string[] = Object.values(this.activePermissionsMap).flat();

      await this.roleService.updateRole(targetId, {
        permissions: this.activePermissionsMap,
        permisos: flatCodes
      });

      this.selectedRole.permissions = { ...this.activePermissionsMap };
      this.selectedRole.permisos = flatCodes;
      this.toastService.success('Matriz guardada', `Se actualizaron los permisos para ${this.selectedRole.role_name || this.selectedRole.nombre}.`);
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No fue posible guardar la matriz de permisos.');
    }
  }

  openNewRoleDialog(): void {
    this.newRoleName = '';
    this.newRoleDesc = '';
    this.showNewRoleModal = true;
  }

  async confirmCreateRole(): Promise<void> {
    if (!this.newRoleName.trim()) return;
    try {
      const createdId = await this.roleService.createRole({
        role_name: this.newRoleName.trim(),
        nombre: this.newRoleName.trim(),
        descripcion: this.newRoleDesc.trim(),
        permissions: {
          administracion: [],
          mapeo: ['voters:read'],
          gestion: ['cases:read'],
          asistencia: [],
          transporte: [],
          conteo: []
        }
      });
      this.showNewRoleModal = false;
      this.toastService.success('Rol Creado', `El rol "${this.newRoleName.trim()}" fue registrado en el directorio activo.`);
      this.loadRoles();
    } catch (err: any) {
      this.toastService.error('Error', err?.message || 'No se pudo crear el rol.');
    }
  }
}
