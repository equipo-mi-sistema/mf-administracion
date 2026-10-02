import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (orientation() === 'horizontal') {
      <div class="relative flex items-center w-full my-4 select-none">
        <div class="flex-grow border-t border-slate-200"></div>
        @if (text()) {
          <span class="flex-shrink mx-3 text-xs font-medium text-slate-400 uppercase tracking-wider bg-white px-2">
            {{ text() }}
          </span>
        }
        <div class="flex-grow border-t border-slate-200"></div>
      </div>
    } @else {
      <div class="inline-block h-full border-r border-slate-200 mx-2 self-stretch" aria-hidden="true"></div>
    }
  `
})
export class DividerComponent {
  text = input<string | undefined>(undefined);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
}
