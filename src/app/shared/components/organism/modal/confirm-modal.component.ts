import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, IconComponent, SpinnerComponent } from '../../atomics';
import { ModalComponent } from './modal.component';

export type ConfirmVariant = 'danger' | 'warning' | 'brand';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, IconComponent, SpinnerComponent],
  template: `
    <app-modal
      [(isOpen)]="isOpen"
      [size]="'md'"
      [title]="title()"
      [showCloseButton]="!loading()"
      [closeOnBackdrop]="!loading()"
      [closeOnEsc]="!loading()"
      (closed)="onCancel()"
    >
      <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 sm:gap-4 py-1">
        <div [class]="iconBgClasses()" class="p-3.5 sm:p-3 rounded-2xl flex-shrink-0 flex items-center justify-center">
          <app-icon [name]="iconName()" size="lg"></app-icon>
        </div>

        <div class="flex-1">
          <p class="text-sm text-slate-600 leading-relaxed">{{ message() }}</p>
          <ng-content></ng-content>
        </div>
      </div>

      <div modal-footer class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 w-full">
        <app-button
          variant="outline"
          size="sm"
          class="w-full sm:w-auto"
          [disabled]="loading()"
          (clicked)="onCancel()"
        >
          <span>{{ cancelText() }}</span>
        </app-button>

        <app-button
          [variant]="buttonVariant()"
          size="sm"
          class="w-full sm:w-auto"
          [disabled]="loading()"
          (clicked)="onConfirm()"
        >
          @if (loading()) {
            <app-spinner size="sm" colorClass="text-white"></app-spinner>
          }
          <span>{{ confirmText() }}</span>
        </app-button>
      </div>
    </app-modal>
  `
})
export class ConfirmModalComponent {
  isOpen = model<boolean>(false);
  title = input<string>('¿Confirmar acción?');
  message = input<string>('¿Estás seguro de continuar con esta operación? Esta acción podría ser irreversible.');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');
  variant = input<ConfirmVariant>('danger');
  loading = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  iconName = computed(() => {
    switch (this.variant()) {
      case 'warning': return 'warning';
      case 'brand': return 'info';
      case 'danger':
      default: return 'trash';
    }
  });

  iconBgClasses = computed(() => {
    switch (this.variant()) {
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'brand': return 'bg-brand-100 text-brand-600';
      case 'danger':
      default: return 'bg-rose-100 text-rose-600';
    }
  });

  buttonVariant = computed(() => {
    switch (this.variant()) {
      case 'warning': return 'secondary';
      case 'brand': return 'primary';
      case 'danger':
      default: return 'primary';
    }
  });

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.isOpen.set(false);
    this.cancelled.emit();
  }
}
