import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex group">
      <ng-content></ng-content>

      <div
        [class]="tooltipClasses()"
        class="absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap"
        role="tooltip"
      >
        {{ text() }}
      </div>
    </div>
  `
})
export class TooltipComponent {
  text = input.required<string>();
  position = input<TooltipPosition>('top');

  tooltipClasses = computed(() => {
    switch (this.position()) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-1.5';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-1.5';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-1.5';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-1.5';
    }
  });
}
