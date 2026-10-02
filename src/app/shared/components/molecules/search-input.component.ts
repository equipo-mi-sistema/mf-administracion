import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  model,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconComponent } from '../atomics/icon.component';

export type SearchInputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="relative w-full">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <app-icon name="search" size="sm"></app-icon>
      </span>

      <input
        type="text"
        [value]="value()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        (input)="onInputChange($event)"
        [class]="inputClasses()"
      />

      @if (value()) {
        <button
          type="button"
          (click)="clear()"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title="Limpiar búsqueda"
        >
          <app-icon name="close" size="sm"></app-icon>
        </button>
      }
    </div>
  `
})
export class SearchInputComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  value = model<string>('');
  placeholder = input<string>('Buscar...');
  debounceMs = input<number>(300);
  disabled = input<boolean>(false);
  size = input<SearchInputSize>('md');

  search = output<string>();
  cleared = output<void>();

  inputClasses = computed(() => {
    const base = 'w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-slate-800 transition-all outline-none placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-3 focus:ring-brand-100';

    const sizeMap: Record<SearchInputSize, string> = {
      sm: 'py-1.5 text-xs',
      md: 'py-2.5 text-sm',
      lg: 'py-3 text-base'
    };

    const disabledClass = this.disabled() ? 'opacity-60 cursor-not-allowed bg-slate-50' : '';

    return `${base} ${sizeMap[this.size()]} ${disabledClass}`.trim();
  });

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceMs()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        this.search.emit(query);
      });
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.searchSubject.next(val);
  }

  clear(): void {
    this.value.set('');
    this.search.emit('');
    this.cleared.emit();
  }
}
