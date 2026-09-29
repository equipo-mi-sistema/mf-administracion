import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, Role } from '../../../core/models/admin.model';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[92vh] overflow-y-auto border border-slate-100">
        
        <!-- Header -->
        <div class="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ user ? 'Editar Usuario' : 'Registrar Nuevo Usuario' }}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Asigna credenciales, rol y el ámbito de acceso geográfico (ABAC)</p>
          </div>
          <button 
            type="button" 
            (click)="close.emit()" 
            class="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>

        <form [formGroup]="userForm" (ngSubmit)="save()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
              <input 
                type="text" 
                formControlName="nombres" 
                placeholder="Ej: Laura Sofía" 
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition">
              <span *ngIf="userForm.get('nombres')?.invalid && userForm.get('nombres')?.touched" class="text-[11px] text-rose-500 mt-1 block">El nombre es requerido</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
              <input 
                type="text" 
                formControlName="apellidos" 
                placeholder="Ej: Gómez Montoya" 
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition">
              <span *ngIf="userForm.get('apellidos')?.invalid && userForm.get('apellidos')?.touched" class="text-[11px] text-rose-500 mt-1 block">El apellido es requerido</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
              <input 
                type="email" 
                formControlName="email" 
                placeholder="usuario@misistema.local" 
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition">
              <span *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-[11px] text-rose-500 mt-1 block">Ingresa un correo válido</span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
              <input 
                type="text" 
                formControlName="telefono" 
                placeholder="+57 300 000 0000" 
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Rol Asignado *</label>
              <select 
                formControlName="rolId" 
                (change)="onRoleSelect($event)" 
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition">
                <option value="">Selecciona un rol...</option>
                <option *ngFor="let r of roles" [value]="r.id">{{ r.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Estado Operativo</label>
              <select 
                formControlName="estado" 
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition">
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="BLOQUEADO">BLOQUEADO</option>
              </select>
            </div>
          </div>

          <!-- ÁMBITO GEOGRÁFICO (ABAC SCOPE) -->
          <div class="mt-5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl" formGroupName="scope">
            <div class="flex items-center gap-2 mb-2">
              <div class="h-2 w-2 rounded-full bg-brand-500"></div>
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Ámbito Geográfico (ABAC Scope)</h3>
            </div>
            <p class="text-xs text-slate-500 mb-3">Define qué territorio o comunas podrá supervisar o intervenir este usuario.</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Departamento</label>
                <input 
                  type="text" 
                  formControlName="departamento" 
                  placeholder="Ej: Antioquia" 
                  class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:border-brand-500 outline-none">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Ciudad</label>
                <input 
                  type="text" 
                  formControlName="ciudad" 
                  placeholder="Ej: Medellín" 
                  class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:border-brand-500 outline-none">
              </div>
            </div>

            <div class="mt-3">
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">
                Comunas Permitidas (usa <span class="font-mono text-brand-600 bg-brand-50 px-1 rounded">*</span> para todas, o separa por coma)
              </label>
              <input 
                type="text" 
                [value]="comunasInput" 
                (input)="onComunasInput($event)" 
                placeholder="Ej: Comuna 10 - La Candelaria, Comuna 11 - Laureles" 
                class="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:border-brand-500 outline-none">
            </div>

            <div class="flex flex-wrap gap-1.5 mt-2">
              <button 
                type="button" 
                (click)="setQuickScope('*')" 
                class="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition">
                Toda la Ciudad (*)
              </button>
              <button 
                type="button" 
                (click)="setQuickScope('Comuna 10, Comuna 11')" 
                class="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition">
                Zona Centro-Occidente
              </button>
              <button 
                type="button" 
                (click)="setQuickScope('Comuna 14')" 
                class="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition">
                El Poblado
              </button>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex justify-end items-center gap-3 mt-6 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              (click)="close.emit()" 
              class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition">
              Cancelar
            </button>
            <button 
              type="submit" 
              [disabled]="userForm.invalid" 
              class="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm shadow-brand-600/20 transition flex items-center gap-1.5">
              <span>Guardar Usuario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UserFormModalComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<Partial<User>>();

  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);

  roles: Role[] = [];
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
    this.roleService.getRoles().subscribe(r => this.roles = r);

    if (this.user) {
      this.userForm.patchValue(this.user);
      this.comunasInput = this.user.scope?.comunas?.join(', ') || '*';
    }
  }

  onRoleSelect(event: any) {
    const selectedId = event.target.value;
    const found = this.roles.find(r => r.id === selectedId);
    if (found) {
      this.userForm.patchValue({ rolNombre: found.nombre });
    }
  }

  onComunasInput(event: any) {
    const val = event.target.value;
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
