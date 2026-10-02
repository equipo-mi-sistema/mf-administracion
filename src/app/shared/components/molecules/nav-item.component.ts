import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../atomics/icon.component';
import { BadgeComponent } from '../atomics/badge.component';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, BadgeComponent],
  template: `
    <a
      [routerLink]="route()"
      routerLinkActive="bg-brand-50 text-brand-700 font-semibold"
      [routerLinkActiveOptions]="{ exact: exact() }"
      class="group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      [title]="label()"
      (click)="clicked.emit()"
    >
      <span class="flex-shrink-0 text-slate-500 group-hover:text-brand-600 transition-colors">
        <app-icon [name]="icon()" size="md"></app-icon>
      </span>

      @if (!collapsed()) {
        <span class="ml-3 flex-1 whitespace-nowrap">{{ label() }}</span>
        @if (badge()) {
          <app-badge variant="brand" size="sm" class="ml-auto">
            {{ badge() }}
          </app-badge>
        }
      }
    </a>
  `
})
export class NavItemComponent {
  route = input.required<string>();
  label = input.required<string>();
  icon = input<string>('dashboard');
  badge = input<string | undefined>(undefined);
  collapsed = input<boolean>(false);
  exact = input<boolean>(false);

  clicked = output<void>();
}
