import { Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label
      [class.opacity-60]="effectiveDisabled()"
      [class.cursor-not-allowed]="effectiveDisabled()"
      [class.cursor-pointer]="!effectiveDisabled()"
      class="inline-flex items-start gap-3 select-none group"
    >
      <div class="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          [id]="id()"
          [checked]="checked()"
          [disabled]="effectiveDisabled()"
          (change)="onToggle($event)"
          (blur)="onBlur()"
          class="sr-only"
        />

        <div [class]="boxClasses()">
          @if (indeterminate()) {
            <svg class="h-3 w-3 stroke-white stroke-[2.5]" viewBox="0 0 24 24" fill="none">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          } @else if (checked()) {
            <svg class="h-3 w-3 stroke-white stroke-[2.5]" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        </div>
      </div>

      @if (label() || description()) {
        <div class="flex flex-col">
          @if (label()) {
            <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
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
export class CheckboxComponent implements ControlValueAccessor {
  checked = model<boolean>(false);
  label = input<string>('');
  description = input<string>('');
  disabled = input<boolean>(false);
  indeterminate = input<boolean>(false);
  error = input<boolean>(false);
  id = input<string>('');

  changed = output<boolean>();

  private cvaDisabled = signal<boolean>(false);
  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  effectiveDisabled = computed(() => this.disabled() || this.cvaDisabled());

  boxClasses = computed(() => {
    const base = 'h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-150';

    if (this.checked() || this.indeterminate()) {
      return `${base} bg-brand-600 border-brand-600 text-white shadow-xs group-hover:bg-brand-700`;
    }

    if (this.error()) {
      return `${base} border-red-400 bg-red-50/50 group-hover:border-red-500`;
    }

    return `${base} border-slate-300 bg-white group-hover:border-slate-400 group-focus-within:ring-2 group-focus-within:ring-brand-200`;
  });

  writeValue(val: any): void {
    this.checked.set(!!val);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  onToggle(event: Event): void {
    if (this.effectiveDisabled()) return;
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.onChange(target.checked);
    this.changed.emit(target.checked);
  }

  onBlur(): void {
    this.onTouched();
  }
}
