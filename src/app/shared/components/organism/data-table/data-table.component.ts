import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent, CheckboxComponent, IconComponent, SkeletonComponent } from '../../atomics';
import { EmptyStateCardComponent } from '../empty-state-card.component';
import { SortEvent, TableColumn } from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    CheckboxComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateCardComponent
  ],
  template: `
    <div class="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <!-- Tabla Responsive con Scroll Horizontal -->
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <!-- Encabezados de Columna -->
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold select-none">
              @if (selectable()) {
                <th scope="col" class="w-10 px-4 py-3.5 text-center">
                  <app-checkbox
                    [checked]="allSelected()"
                    [indeterminate]="someSelected()"
                    (changed)="toggleSelectAll($event)"
                  ></app-checkbox>
                </th>
              }

              @for (col of columns(); track col.key) {
                <th
                  scope="col"
                  [style.width]="col.width || 'auto'"
                  [class.cursor-pointer]="col.sortable"
                  (click)="handleSort(col)"
                  class="px-4 py-3.5 transition-colors hover:text-slate-900"
                >
                  <div class="flex items-center gap-1.5" [class.justify-center]="col.align === 'center'" [class.justify-end]="col.align === 'right'">
                    <span>{{ col.header }}</span>
                    @if (col.sortable) {
                      <span class="text-slate-400">
                        @if (currentSort()?.column === col.key) {
                          <app-icon [name]="currentSort()?.direction === 'asc' ? 'chevron-up' : 'chevron-down'" size="sm" class="text-brand-600"></app-icon>
                        } @else {
                          <app-icon name="chevron-down" size="sm" class="opacity-40"></app-icon>
                        }
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>

          <!-- Cuerpo de la Tabla -->
          <tbody class="divide-y divide-slate-100 text-slate-700">
            @if (loading()) {
              <!-- Skeleton Loading Rows -->
              @for (row of [1, 2, 3, 4]; track $index) {
                <tr class="animate-pulse">
                  @if (selectable()) {
                    <td class="px-4 py-3.5 text-center"><app-skeleton width="18px" height="18px" variant="rectangular"></app-skeleton></td>
                  }
                  @for (col of columns(); track col.key) {
                    <td class="px-4 py-3.5"><app-skeleton height="1rem"></app-skeleton></td>
                  }
                </tr>
              }
            } @else if (data().length === 0) {
              <!-- Estado Vacío -->
              <tr>
                <td [attr.colspan]="totalColumns()" class="p-8 text-center">
                  <app-empty-state-card
                    iconName="database"
                    [title]="emptyTitle()"
                    [description]="emptyDescription()"
                  ></app-empty-state-card>
                </td>
              </tr>
            } @else {
              <!-- Filas de Datos -->
              @for (row of data(); track $index) {
                <tr
                  [class.bg-brand-50]="isSelected(row)"
                  class="hover:bg-slate-50/80 transition-colors"
                >
                  @if (selectable()) {
                    <td class="px-4 py-3.5 text-center">
                      <app-checkbox
                        [checked]="isSelected(row)"
                        (changed)="toggleRowSelect(row, $event)"
                      ></app-checkbox>
                    </td>
                  }

                  @for (col of columns(); track col.key) {
                    <td
                      class="px-4 py-3.5"
                      [class.text-center]="col.align === 'center'"
                      [class.text-right]="col.align === 'right'"
                    >
                      @if (col.isBadge) {
                        <app-badge [variant]="col.badgeVariant ? col.badgeVariant(row[col.key], row) : 'neutral'" size="sm">
                          {{ row[col.key] }}
                        </app-badge>
                      } @else {
                        <span>{{ row[col.key] }}</span>
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DataTableComponent {
  columns = input.required<TableColumn[]>();
  data = input<any[]>([]);
  selectable = input<boolean>(false);
  loading = input<boolean>(false);
  emptyTitle = input<string>('No hay registros disponibles');
  emptyDescription = input<string>('Actualmente no existen datos para mostrar en esta vista.');

  sortChange = output<SortEvent>();
  selectionChange = output<any[]>();

  currentSort = signal<SortEvent | null>(null);
  selectedRows = signal<Set<any>>(new Set());

  totalColumns = computed(() => this.columns().length + (this.selectable() ? 1 : 0));

  allSelected = computed(() => {
    return this.data().length > 0 && this.selectedRows().size === this.data().length;
  });

  someSelected = computed(() => {
    const size = this.selectedRows().size;
    return size > 0 && size < this.data().length;
  });

  isSelected(row: any): boolean {
    return this.selectedRows().has(row);
  }

  handleSort(col: TableColumn): void {
    if (!col.sortable) return;

    let dir: 'asc' | 'desc' = 'asc';
    const curr = this.currentSort();
    if (curr && curr.column === col.key && curr.direction === 'asc') {
      dir = 'desc';
    }

    const event: SortEvent = { column: col.key, direction: dir };
    this.currentSort.set(event);
    this.sortChange.emit(event);
  }

  toggleRowSelect(row: any, checked: boolean): void {
    this.selectedRows.update((set) => {
      const next = new Set(set);
      if (checked) next.add(row);
      else next.delete(row);
      return next;
    });
    this.selectionChange.emit(Array.from(this.selectedRows()));
  }

  toggleSelectAll(checked: boolean): void {
    this.selectedRows.update(() => {
      if (checked) {
        return new Set(this.data());
      }
      return new Set();
    });
    this.selectionChange.emit(Array.from(this.selectedRows()));
  }
}
