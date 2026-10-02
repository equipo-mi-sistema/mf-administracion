import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, IconComponent } from '../../atomics';
import { ModalComponent } from './modal.component';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, IconComponent],
  template: `
    <app-modal
      [(isOpen)]="isOpen"
      [size]="'sm'"
      [title]="title()"
      [showCloseButton]="true"
      (closed)="onClose()"
    >
      <div class="flex flex-col items-center text-center py-2 px-1">
        <div [class]="iconBgClasses()" class="p-3.5 sm:p-4 rounded-3xl mb-3 sm:mb-4 flex items-center justify-center">
          <app-icon [name]="iconName()" size="xl"></app-icon>
        </div>

        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 sm:mb-6 max-w-sm">{{ message() }}</p>

        <app-button
          variant="primary"
          size="md"
          class="w-full"
          (clicked)="onClose()"
        >
          <span>{{ buttonText() }}</span>
        </app-button>
      </div>
    </app-modal>
  `
})
export class NotificationModalComponent {
  isOpen = model<boolean>(false);
  type = input<NotificationType>('success');
  title = input<string>('Notificación del Sistema');
  message = input<string>('');
  buttonText = input<string>('Entendido');

  closed = output<void>();

  iconName = computed(() => {
    switch (this.type()) {
      case 'success': return 'check';
      case 'warning': return 'warning';
      case 'error': return 'warning';
      case 'info':
      default: return 'info';
    }
  });

  iconBgClasses = computed(() => {
    switch (this.type()) {
      case 'success': return 'bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-500/10';
      case 'warning': return 'bg-amber-100 text-amber-600 shadow-md shadow-amber-500/10';
      case 'error': return 'bg-rose-100 text-rose-600 shadow-md shadow-rose-500/10';
      case 'info':
      default: return 'bg-brand-100 text-brand-600 shadow-md shadow-brand-500/10';
    }
  });

  onClose(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
