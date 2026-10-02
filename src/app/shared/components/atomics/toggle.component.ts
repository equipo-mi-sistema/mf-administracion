import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToggleSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      [class.opacity-60]="disabled()"
      [class.cursor-not-allowed]="disabled()"
      [class.cursor-pointer]="!disabled()"
      class="inline-flex items-start gap-3 select-none group"
    >
      <div class="relative flex items-center mt-0.5">
        <input
          type="checkbox"
          [checked]="checked()"
          [disabled]="disabled()"
          (change)="onToggle($event)"
          class="sr-only"
        />

        <div [class]="trackClasses()">
          <span [class]="thumbClasses()"></span>
        </div>
      </div>

      @if (label() || description()) {
        <div class="flex flex-col">
          @if (label()) {
            <span class="text-sm font-medium text-slate-800 group-hover:text-slate-900 transition-colors">
              {{ label() }}
            </span>
          }
          @if (description()) {
            <span class="text-xs text-slate-400">
              {{ description() }}
            </span>
          }
        </div>
      }
    </label>
  `
})
export class ToggleComponent {
  checked = model<boolean>(false);
  label = input<string>('');
  description = input<string>('');
  disabled = input<boolean>(false);
  size = input<ToggleSize>('md');

  changed = output<boolean>();

  trackClasses = computed(() => {
    const sizeMap: Record<ToggleSize, string> = {
      sm: 'w-8 h-4.5 p-0.5',
      md: 'w-11 h-6 p-0.5',
      lg: 'w-14 h-7.5 p-1'
    };

    const color = this.checked()
      ? 'bg-brand-600 border-brand-600'
      : 'bg-slate-200 border-slate-300';

    return `rounded-full border transition-colors duration-200 ease-in-out flex items-center ${sizeMap[this.size()]} ${color}`;
  });

  thumbClasses = computed(() => {
    const sizeMap: Record<ToggleSize, string> = {
      sm: 'w-3.5 h-3.5',
      md: 'w-5 h-5',
      lg: 'w-5.5 h-5.5'
    };

    const translateMap: Record<ToggleSize, string> = {
      sm: this.checked() ? 'translate-x-3.5' : 'translate-x-0',
      md: this.checked() ? 'translate-x-5' : 'translate-x-0',
      lg: this.checked() ? 'translate-x-6.5' : 'translate-x-0'
    };

    return `inline-block rounded-full bg-white shadow-sm transform transition duration-200 ease-in-out ${sizeMap[this.size()]} ${translateMap[this.size()]}`;
  });

  onToggle(event: Event): void {
    if (this.disabled()) return;
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.changed.emit(target.checked);
  }
}
