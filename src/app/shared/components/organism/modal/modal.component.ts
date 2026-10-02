import {
  Component,
  HostListener,
  computed,
  input,
  model,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atomics/icon.component';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop con desenfoque suave -->
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          (click)="onBackdropClick()"
        ></div>

        <!-- Contenedor del Modal Responsivo -->
        <div
          [class]="modalClasses()"
          class="relative w-full max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all transform animate-scaleUp m-auto max-h-[90vh] flex flex-col"
        >
          <!-- Header con Título Visible -->
          @if (title() || showCloseButton()) {
            <div class="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div class="flex items-center gap-2.5 min-w-0 pr-2">
                @if (title()) {
                  <h3 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug truncate">
                    {{ title() }}
                  </h3>
                }
                <ng-content select="[modal-title]"></ng-content>
              </div>

              @if (showCloseButton()) {
                <button
                  type="button"
                  (click)="close()"
                  class="p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Cerrar modal"
                >
                  <app-icon name="close" size="sm"></app-icon>
                </button>
              }
            </div>
          }

          <!-- Body con scroll interno automático en pantallas pequeñas -->
          <div class="p-4 sm:p-6 text-sm text-slate-600 overflow-y-auto flex-1">
            <ng-content></ng-content>
          </div>

          <!-- Footer proyectado adaptable a mobile -->
          <div class="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3 empty:hidden flex-shrink-0">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  isOpen = model<boolean>(false);
  title = input<string>('');
  size = input<ModalSize>('md');
  closeOnBackdrop = input<boolean>(true);
  closeOnEsc = input<boolean>(true);
  showCloseButton = input<boolean>(true);

  closed = output<void>();

  modalClasses = computed(() => {
    const sizeMap: Record<ModalSize, string> = {
      sm: 'sm:max-w-sm',
      md: 'sm:max-w-md',
      lg: 'sm:max-w-lg',
      xl: 'sm:max-w-2xl'
    };
    return sizeMap[this.size()];
  });

  @HostListener('document:keydown.escape')
  onEscKey(): void {
    if (this.isOpen() && this.closeOnEsc()) {
      this.close();
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
