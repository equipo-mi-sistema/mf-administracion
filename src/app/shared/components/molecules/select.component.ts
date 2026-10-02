import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../atomics/icon.component';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="relative w-full">
      @if (label()) {
        <label [for]="id()" class="block text-xs font-semibold text-slate-700 mb-1.5">
          {{ label() }}
        </label>
      }

      <div class="relative">
        <select
          [id]="id()"
          [disabled]="disabled()"
          [value]="value()"
          (change)="onChange($event)"
          [class]="selectClasses()"
        >
          @if (placeholder()) {
            <option value="" [disabled]="true" [selected]="!value()">
              {{ placeholder() }}
            </option>
          }

          @for (option of options(); track option.value) {
            <option
              [value]="option.value"
              [disabled]="option.disabled ?? false"
              [selected]="value() === option.value"
            >
              {{ option.label }}
            </option>
          }
        </select>

        <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <app-icon name="chevron-down" size="sm"></app-icon>
        </span>
      </div>

      @if (typeofError() === 'string') {
        <p class="mt-1 text-xs text-red-600 font-medium">{{ error() }}</p>
      }
    </div>
  `
})
export class SelectComponent {
  value = model<any>(null);
  options = input<SelectOption[]>([]);
  placeholder = input<string>('Seleccione una opción');
  label = input<string>('');
  disabled = input<boolean>(false);
  error = input<string | boolean>(false);
  id = input<string>('');

  changed = output<any>();

  typeofError = computed(() => typeof this.error());

  selectClasses = computed(() => {
    const base = 'w-full appearance-none rounded-xl border py-2.5 pl-3.5 pr-10 text-sm font-normal text-slate-800 transition-all outline-none bg-white cursor-pointer';

    const state = this.error()
      ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-3 focus:ring-red-100'
      : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-100';

    const disabledClass = this.disabled() ? 'opacity-60 cursor-not-allowed bg-slate-50 text-slate-400' : '';

    return `${base} ${state} ${disabledClass}`.trim();
  });

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedVal = target.value;
    this.value.set(selectedVal);
    this.changed.emit(selectedVal);
  }
}
