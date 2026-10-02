import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../atomics/icon.component';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <nav class="flex items-center text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1" aria-label="Breadcrumb">
      <ol class="flex items-center gap-1.5 sm:gap-2">
        @for (item of items(); track item.label; let last = $last) {
          <li class="flex items-center gap-1.5 sm:gap-2">
            @if (!last && item.url) {
              <a
                [routerLink]="item.url"
                class="flex items-center gap-1 hover:text-brand-600 font-medium transition-colors"
              >
                @if (item.icon) {
                  <app-icon [name]="item.icon" size="sm"></app-icon>
                }
                <span>{{ item.label }}</span>
              </a>
            } @else {
              <span class="flex items-center gap-1 font-semibold text-slate-800" aria-current="page">
                @if (item.icon) {
                  <app-icon [name]="item.icon" size="sm" class="text-brand-600"></app-icon>
                }
                <span>{{ item.label }}</span>
              </span>
            }

            @if (!last) {
              <span class="text-slate-300 flex-shrink-0" aria-hidden="true">
                <app-icon [name]="separator()" size="sm"></app-icon>
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
  separator = input<string>('chevron-right');
}
