import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../atomics/icon.component';

@Component({
  selector: 'app-accordion-item',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs transition-colors">
      <button
        type="button"
        (click)="toggle()"
        [disabled]="disabled()"
        [attr.aria-expanded]="isOpen()"
        [class.opacity-60]="disabled()"
        [class.cursor-not-allowed]="disabled()"
        class="w-full flex items-center justify-between p-4 text-left font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
      >
        <div class="flex items-center gap-3">
          @if (icon()) {
            <span class="text-brand-600 flex-shrink-0">
              <app-icon [name]="icon()!" size="md"></app-icon>
            </span>
          }
          <div>
            <span class="text-sm font-semibold text-slate-800">{{ title() }}</span>
            @if (subtitle()) {
              <p class="text-xs text-slate-400 mt-0.5">{{ subtitle() }}</p>
            }
          </div>
        </div>

        <span
          class="text-slate-400 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
        >
          <app-icon name="chevron-down" size="sm"></app-icon>
        </span>
      </button>

      @if (isOpen()) {
        <div class="p-4 pt-1 border-t border-slate-100 text-sm text-slate-600 animate-fadeIn">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `
})
export class AccordionItemComponent {
  title = input.required<string>();
  icon = input<string | undefined>(undefined);
  subtitle = input<string | undefined>(undefined);
  isOpen = model<boolean>(false);
  disabled = input<boolean>(false);

  toggled = output<boolean>();

  toggle(): void {
    if (this.disabled()) return;
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    this.toggled.emit(nextState);
  }
}
