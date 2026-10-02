import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../atomics/icon.component';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (visible()) {
      <div
        role="alert"
        [class]="containerClasses()"
        class="flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 shadow-xs"
      >
        <div class="flex-shrink-0 mt-0.5" [class]="iconColorClass()">
          <app-icon [name]="resolvedIcon()" size="md"></app-icon>
        </div>

        <div class="flex-1 text-sm">
          @if (title()) {
            <h4 class="font-semibold mb-0.5 leading-snug">{{ title() }}</h4>
          }
          <div class="leading-relaxed opacity-95">
            @if (message()) {
              <p>{{ message() }}</p>
            }
            <ng-content></ng-content>
          </div>
        </div>

        @if (dismissible()) {
          <button
            type="button"
            (click)="dismiss()"
            class="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 transition-all cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <app-icon name="close" size="sm"></app-icon>
          </button>
        }
      </div>
    }
  `
})
export class AlertComponent {
  variant = input<AlertVariant>('info');
  title = input<string>('');
  message = input<string>('');
  dismissible = input<boolean>(false);
  icon = input<string | undefined>(undefined);

  dismissed = output<void>();

  visible = signal<boolean>(true);

  resolvedIcon = computed(() => {
    if (this.icon()) return this.icon()!;
    switch (this.variant()) {
      case 'success': return 'check';
      case 'warning': return 'warning';
      case 'danger': return 'warning';
      case 'info':
      default: return 'info';
    }
  });

  containerClasses = computed(() => {
    switch (this.variant()) {
      case 'success':
        return 'bg-emerald-50/90 border-emerald-200 text-emerald-900';
      case 'warning':
        return 'bg-amber-50/90 border-amber-200 text-amber-900';
      case 'danger':
        return 'bg-rose-50/90 border-rose-200 text-rose-900';
      case 'info':
      default:
        return 'bg-brand-50/90 border-brand-200 text-brand-900';
    }
  });

  iconColorClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'text-emerald-600';
      case 'warning': return 'text-amber-600';
      case 'danger': return 'text-rose-600';
      case 'info':
      default: return 'text-brand-600';
    }
  });

  dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}
