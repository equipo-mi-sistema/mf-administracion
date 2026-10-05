import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, Role } from '../../../core/models/admin.model';
import { RoleService } from '../../../core/services/role.service';
import { ButtonComponent, InputComponent } from '../../../shared/components/atomics';
import { SelectComponent, SelectOption } from '../../../shared/components/molecules';
import { ModalComponent } from '../../../shared/components/organism/modal';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent
  ],
  template: `
    <app-modal
      [isOpen]="true"
      [title]="user ? 'Editar Usuario' : 'Registrar Nuevo Usuario'"
      size="xl"
      (closed)="close.emit()"
    >
      <form [formGroup]="userForm" (ngSubmit)="save()" class="space-y-4">
        <p class="text-xs text-slate-500 -mt-2 mb-4">
          Asigna credenciales, rol y el ámbito de acceso geográfico (ABAC) para el colaborador.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
            <app-input
              formControlName="nombres"
              placeholder="Ej: Laura Sofía"
              size="sm"
              [error]="!!(userForm.get('nombres')?.invalid && userForm.get('nombres')?.touched)"
            ></app-input>
            <span *ngIf="userForm.get('nombres')?.invalid && userForm.get('nombres')?.touched" class="text-[11px] text-rose-500 mt-1 block">
              El nombre es requerido
            </span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
            <app-input
              formControlName="apellidos"
              placeholder="Ej: Gómez Montoya"
              size="sm"
              [error]="!!(userForm.get('apellidos')?.invalid && userForm.get('apellidos')?.touched)"
            ></app-input>
            <span *ngIf="userForm.get('apellidos')?.invalid && userForm.get('apellidos')?.touched" class="text-[11px] text-rose-500 mt-1 block">
              El apellido es requerido
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
            <app-input
              type="email"
              formControlName="email"
              placeholder="usuario@misistema.local"
              size="sm"
              [error]="!!(userForm.get('email')?.invalid && userForm.get('email')?.touched)"
            ></app-input>
            <span *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-[11px] text-rose-500 mt-1 block">
              Ingresa un correo válido
            </span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
            <app-input
              type="text"
              formControlName="telefono"
              placeholder="+57 300 000 0000"
              size="sm"
            ></app-input>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <app-select
              label="Rol Asignado *"
              formControlName="rolId"
              [options]="roleOptions"
              placeholder="Selecciona un rol..."
              (changed)="onRoleSelect($event)"
              [error]="!!(userForm.get('rolId')?.invalid && userForm.get('rolId')?.touched)"
            ></app-select>
          </div>

          <div>
            <app-select
              label="Estado Operativo"
              formControlName="estado"
              [options]="estadoOptions"
              placeholder="Selecciona estado"
            ></app-select>
          </div>
        </div>

        <!-- ÁMBITO GEOGRÁFICO (ABAC SCOPE) -->
        <div class="mt-4 p-4 bg-slate-50 border border-slate-200/80 rounded-xl" formGroupName="scope">
          <div class="flex items-center gap-2 mb-1.5">
            <div class="h-2 w-2 rounded-full bg-brand-500"></div>
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Ámbito Geográfico (ABAC Scope)</h4>
          </div>
          <p class="text-xs text-slate-500 mb-3">Define qué territorio o comunas podrá supervisar o intervenir este usuario.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Departamento</label>
              <app-input
                formControlName="departamento"
                placeholder="Ej: Antioquia"
                size="sm"
              ></app-input>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Ciudad</label>
              <app-input
                formControlName="ciudad"
                placeholder="Ej: Medellín"
                size="sm"
              ></app-input>
            </div>
          </div>

          <div class="mt-3">
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">
              Comunas Permitidas (usa <span class="font-mono text-brand-600 bg-brand-50 px-1 rounded">*</span> para todas, o separa por coma)
            </label>
            <app-input
              [value]="comunasInput"
              (inputChange)="onComunasInputChange($event)"
              placeholder="Ej: Comuna 10 - La Candelaria, Comuna 11 - Laureles"
              size="sm"
            ></app-input>
          </div>

          <div class="flex flex-wrap gap-1.5 mt-2.5">
            <app-button
              variant="outline"
              size="sm"
              type="button"
              (clicked)="setQuickScope('*')"
            >
              <span>Toda la Ciudad (*)</span>
            </app-button>
            <app-button
              variant="outline"
              size="sm"
              type="button"
              (clicked)="setQuickScope('Comuna 10, Comuna 11')"
            >
              <span>Zona Centro-Occidente</span>
            </app-button>
            <app-button
              variant="outline"
              size="sm"
              type="button"
              (clicked)="setQuickScope('Comuna 14')"
            >
              <span>El Poblado</span>
            </app-button>
          </div>
        </div>
      </form>

      <!-- Footer proyectado del Modal -->
      <div modal-footer class="flex items-center justify-end gap-2.5 w-full">
        <app-button
          variant="ghost"
          size="sm"
          type="button"
          (clicked)="close.emit()"
        >
          <span>Cancelar</span>
        </app-button>

        <app-button
          variant="primary"
          size="sm"
          type="button"
          [disabled]="userForm.invalid"
          (clicked)="save()"
        >
          <span>Guardar Usuario</span>
        </app-button>
      </div>
    </app-modal>
  `
})
export class UserFormModalComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<Partial<User>>();

  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);

  roles: Role[] = [];
  roleOptions: SelectOption[] = [];
  estadoOptions: SelectOption[] = [
    { label: 'ACTIVO', value: 'ACTIVO' },
    { label: 'INACTIVO', value: 'INACTIVO' },
    { label: 'BLOQUEADO', value: 'BLOQUEADO' }
  ];

  comunasInput = '*';

  userForm: FormGroup = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    rolId: ['', Validators.required],
    rolNombre: [''],
    estado: ['ACTIVO', Validators.required],
    scope: this.fb.group({
      departamento: ['Antioquia', Validators.required],
      ciudad: ['Medellín', Validators.required],
      comunas: [['*']]
    })
  });

  ngOnInit() {
    this.roleService.getRoles().subscribe(r => {
      this.roles = r;
      this.roleOptions = r.map(role => ({
        label: role.nombre,
        value: role.id
      }));
    });

    if (this.user) {
      this.userForm.patchValue(this.user);
      this.comunasInput = this.user.scope?.comunas?.join(', ') || '*';
    }
  }

  onRoleSelect(selectedId: any) {
    const found = this.roles.find(r => r.id === selectedId);
    if (found) {
      this.userForm.patchValue({ rolNombre: found.nombre });
    }
  }

  onComunasInputChange(val: string) {
    this.comunasInput = val;
    this.parseComunas(val);
  }

  setQuickScope(val: string) {
    this.comunasInput = val;
    this.parseComunas(val);
  }

  private parseComunas(val: string) {
    const array = val.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    this.userForm.get('scope.comunas')?.setValue(array.length > 0 ? array : ['*']);
  }

  save() {
    if (this.userForm.valid) {
      this.onSaved.emit(this.userForm.value);
    }
  }
}
