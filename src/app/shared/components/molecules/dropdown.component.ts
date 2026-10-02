import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../atomics/icon.component';

export interface DropdownItem {
  id?: string;
  label: string;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="relative inline-block text-left">
      <!-- Trigger -->
      @if (trigger() === 'icon') {
        <button
          type="button"
          (click)="toggle($event)"
          class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          title="Más opciones"
        >
          <app-icon name="more-vertical" size="sm"></app-icon>
        </button>
      } @else {
        <button
          type="button"
          (click)="toggle($event)"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
        >
          <span>{{ buttonText() }}</span>
          <app-icon name="chevron-down" size="sm" class="text-slate-400"></app-icon>
        </button>
      }

      <!-- Menu flotante -->
      @if (isOpen()) {
        <div
          [class]="menuClasses()"
          class="absolute z-40 mt-1.5 w-48 rounded-xl bg-white p-1 shadow-xl border border-slate-100 ring-1 ring-black/5 animate-scaleUp focus:outline-none"
        >
          @for (item of items(); track item.id || item.label) {
            <button
              type="button"
              [disabled]="item.disabled ?? false"
              (click)="selectItem(item, $event)"
              [class]="itemClasses(item)"
              class="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (item.icon) {
                <span [class]="item.danger ? 'text-rose-500' : 'text-slate-400 group-hover:text-slate-600'">
                  <app-icon [name]="item.icon" size="sm"></app-icon>
                </span>
              }
              <span class="flex-1 text-left truncate">{{ item.label }}</span>
            </button>
          }
        </div>
      }
    </div>
  `
})
export class DropdownComponent {
  private elementRef = inject(ElementRef);

  items = input.required<DropdownItem[]>();
  align = input<'left' | 'right'>('right');
  trigger = input<'icon' | 'button'>('icon');
  buttonText = input<string>('Acciones');

  selected = output<DropdownItem>();

  isOpen = signal<boolean>(false);

  menuClasses = computed(() => {
    return this.align() === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left';
  });

  itemClasses(item: DropdownItem): string {
    if (item.danger) {
      return 'text-rose-600 hover:bg-rose-50';
    }
    return 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  selectItem(item: DropdownItem, event: Event): void {
    event.stopPropagation();
    if (item.disabled) return;
    this.isOpen.set(false);
    this.selected.emit(item);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
