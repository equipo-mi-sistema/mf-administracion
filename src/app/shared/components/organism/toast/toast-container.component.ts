import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atomics/icon.component';
import { ToastService } from './toast.service';
import { Toast, ToastType } from './toast.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-3 sm:p-0"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="toastClasses(toast.type)"
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform animate-slideInRight"
          role="status"
        >
          <div class="flex-shrink-0 mt-0.5">
            <app-icon [name]="iconName(toast.type)" size="md"></app-icon>
          </div>

          <div class="flex-1 text-xs">
            <h5 class="font-bold text-slate-900 leading-snug">{{ toast.title }}</h5>
            @if (toast.message) {
              <p class="mt-0.5 text-slate-600 leading-relaxed">{{ toast.message }}</p>
            }
          </div>

          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="flex-shrink-0 p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <app-icon name="close" size="sm"></app-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  iconName(type: ToastType): string {
    switch (type) {
      case 'success': return 'check';
      case 'warning': return 'warning';
      case 'danger': return 'warning';
      case 'info':
      default: return 'info';
    }
  }

  toastClasses(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-50/95 border-emerald-200 text-emerald-900';
      case 'warning':
        return 'bg-amber-50/95 border-amber-200 text-amber-900';
      case 'danger':
        return 'bg-rose-50/95 border-rose-200 text-rose-900';
      case 'info':
      default:
        return 'bg-brand-50/95 border-brand-200 text-brand-900';
    }
  }
}
