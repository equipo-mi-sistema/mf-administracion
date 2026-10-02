import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full">
      <textarea
        [id]="id()"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [maxLength]="maxLength() ?? -1"
        [value]="value()"
        (input)="onInput($event)"
        (focus)="focused.emit($event)"
        (blur)="blurred.emit($event)"
        [class]="textareaClasses()"
      ></textarea>

      @if (showCount() && maxLength()) {
        <div class="flex justify-end mt-1 text-[11px] text-slate-400">
          <span>{{ value().length }} / {{ maxLength() }}</span>
        </div>
      }
    </div>
  `
})
export class TextareaComponent {
  value = model<string>('');
  placeholder = input<string>('');
  rows = input<number>(3);
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  error = input<string | boolean>(false);
  maxLength = input<number | undefined>(undefined);
  showCount = input<boolean>(false);
  id = input<string>('');

  inputChange = output<string>();
  focused = output<FocusEvent>();
  blurred = output<FocusEvent>();

  textareaClasses = computed(() => {
    const base = 'w-full rounded-xl border p-3 text-sm font-normal text-slate-800 transition-all outline-none placeholder:text-slate-400 resize-y';

    const state = this.error()
      ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-3 focus:ring-red-100'
      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-100';

    const disabledClass = this.disabled() ? 'opacity-60 cursor-not-allowed bg-slate-50 text-slate-400' : '';

    return `${base} ${state} ${disabledClass}`.trim();
  });

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.inputChange.emit(target.value);
  }
}
