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

export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';
export type DrawerPosition = 'left' | 'right';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop con desenfoque suave -->
        <div
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
          (click)="onBackdropClick()"
        ></div>

        <!-- Panel Deslizante Drawer -->
        <div class="fixed inset-y-0 flex max-w-full" [class.right-0]="position() === 'right'" [class.left-0]="position() === 'left'">
          <div
            [class]="drawerClasses()"
            class="relative w-screen bg-white shadow-2xl flex flex-col transition-all transform animate-slideInRight overflow-hidden"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 class="text-base font-bold text-slate-900 truncate pr-2">
                {{ title() }}
              </h3>

              <button
                type="button"
                (click)="close()"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cerrar panel"
              >
                <app-icon name="close" size="sm"></app-icon>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6 text-sm text-slate-600 overflow-y-auto flex-1">
              <ng-content></ng-content>
            </div>

            <!-- Footer proyectado -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 empty:hidden">
              <ng-content select="[drawer-footer]"></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DrawerComponent {
  isOpen = model<boolean>(false);
  title = input<string>('Panel Lateral');
  size = input<DrawerSize>('md');
  position = input<DrawerPosition>('right');
  closeOnBackdrop = input<boolean>(true);
  closeOnEsc = input<boolean>(true);

  closed = output<void>();

  drawerClasses = computed(() => {
    const sizeMap: Record<DrawerSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-xl',
      full: 'max-w-full'
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
