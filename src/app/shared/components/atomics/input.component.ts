import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="relative w-full">
      @if (iconLeft()) {
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <app-icon [name]="iconLeft()!" size="sm"></app-icon>
        </span>
      }

      <input
        [type]="type()"
        [id]="id()"
        [name]="name()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [value]="value()"
        (input)="onInput($event)"
        (focus)="focused.emit($event)"
        (blur)="blurred.emit($event)"
        [class]="inputClasses()"
      />

      @if (iconRight()) {
        <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <app-icon [name]="iconRight()!" size="sm"></app-icon>
        </span>
      }
    </div>
  `
})
export class InputComponent {
  value = model<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  error = input<string | boolean>(false);
  iconLeft = input<string | undefined>(undefined);
  iconRight = input<string | undefined>(undefined);
  size = input<InputSize>('md');
  name = input<string>('');
  id = input<string>('');

  inputChange = output<string>();
  focused = output<FocusEvent>();
  blurred = output<FocusEvent>();

  inputClasses = computed(() => {
    const base = 'w-full rounded-xl border font-normal text-slate-800 transition-all outline-none placeholder:text-slate-400';
    
    // Size mapping
    const sizeMap: Record<InputSize, string> = {
      sm: 'py-1.5 text-xs',
      md: 'py-2.5 text-sm',
      lg: 'py-3 text-base'
    };

    // Padding depending on icons
    const leftPad = this.iconLeft() ? 'pl-9' : 'pl-3.5';
    const rightPad = this.iconRight() ? 'pr-9' : 'pr-3.5';

    // State classes
    const state = this.error()
      ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-3 focus:ring-red-100'
      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-100';

    const disabledClass = this.disabled() ? 'opacity-60 cursor-not-allowed bg-slate-50 text-slate-400' : '';

    return `${base} ${sizeMap[this.size()]} ${leftPad} ${rightPad} ${state} ${disabledClass}`.trim();
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.inputChange.emit(target.value);
  }
}
