import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label
      [class.opacity-60]="disabled()"
      [class.cursor-not-allowed]="disabled()"
      [class.cursor-pointer]="!disabled()"
      class="inline-flex items-start gap-3 select-none group"
    >
      <div class="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          [id]="id()"
          [checked]="checked()"
          [disabled]="disabled()"
          (change)="onToggle($event)"
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
export class CheckboxComponent {
  checked = model<boolean>(false);
  label = input<string>('');
  description = input<string>('');
  disabled = input<boolean>(false);
  indeterminate = input<boolean>(false);
  error = input<boolean>(false);
  id = input<string>('');

  changed = output<boolean>();

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

  onToggle(event: Event): void {
    if (this.disabled()) return;
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.changed.emit(target.checked);
  }
}
