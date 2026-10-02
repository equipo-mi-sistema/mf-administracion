import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../atomics/icon.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 py-3">
      <!-- Info de registros y selector de tamaño -->
      <div class="flex items-center gap-3">
        <span>
          Mostrando <strong class="text-slate-800">{{ startItem() }}</strong> - <strong class="text-slate-800">{{ endItem() }}</strong> de <strong class="text-slate-800">{{ total() }}</strong> registros
        </span>

        @if (showPageSize()) {
          <div class="flex items-center gap-1.5 ml-2">
            <span>Mostrar:</span>
            <select
              [value]="pageSize()"
              (change)="onPageSizeChange($event)"
              class="border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none focus:border-brand-500 cursor-pointer"
            >
              @for (opt of pageSizeOptions(); track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          </div>
        }
      </div>

      <!-- Controles de Navegación -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          (click)="goToPage(currentPage() - 1)"
          [disabled]="currentPage() <= 1"
          class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Página anterior"
        >
          <app-icon name="chevron-left" size="sm"></app-icon>
        </button>

        @for (page of pages(); track page) {
          @if (page === -1) {
            <span class="px-2 py-1 text-slate-400">...</span>
          } @else {
            <button
              type="button"
              (click)="goToPage(page)"
              [class]="page === currentPage() ? 'bg-brand-600 text-white font-bold border-brand-600 shadow-xs' : 'border-slate-200 text-slate-700 hover:bg-slate-50'"
              class="min-w-[28px] h-7 px-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center justify-center"
            >
              {{ page }}
            </button>
          }
        }

        <button
          type="button"
          (click)="goToPage(currentPage() + 1)"
          [disabled]="currentPage() >= totalPages()"
          class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Página siguiente"
        >
          <app-icon name="chevron-right" size="sm"></app-icon>
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  total = input.required<number>();
  pageSize = model<number>(10);
  currentPage = model<number>(1);
  pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  showPageSize = input<boolean>(true);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  startItem = computed(() => {
    if (this.total() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  endItem = computed(() => Math.min(this.currentPage() * this.pageSize(), this.total()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const items: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push(i);
      return items;
    }

    items.push(1);
    if (current > 3) items.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) items.push(i);

    if (current < total - 2) items.push(-1);
    items.push(total);

    return items;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.pageChange.emit(page);
  }

  onPageSizeChange(event: Event): void {
    const val = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(val);
    this.currentPage.set(1);
    this.pageSizeChange.emit(val);
    this.pageChange.emit(1);
  }
}
