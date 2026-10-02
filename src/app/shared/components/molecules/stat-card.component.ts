import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent, BadgeVariant } from '../atomics/badge.component';
import { IconComponent } from '../atomics/icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent, IconComponent],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-card hover:shadow-card-hover transition-shadow duration-normal">
      <div class="flex items-center justify-between mb-3">
        <div [class]="iconBgClasses()">
          <app-icon [name]="iconName()" size="lg"></app-icon>
        </div>
        @if (badgeText()) {
          <app-badge [variant]="badgeVariant()">
            {{ badgeText() }}
          </app-badge>
        }
      </div>
      <h3 class="text-base font-semibold text-slate-800">{{ title() }}</h3>
      <p class="mt-1 text-xs text-slate-500 leading-relaxed">
        {{ description() }}
      </p>
      @if (footerText()) {
        <div class="mt-3 text-[11px] font-mono text-slate-400">
          {{ footerText() }}
        </div>
      }
    </div>
  `
})
export class StatCardComponent {
  title = input.required<string>();
  description = input.required<string>();
  badgeText = input<string>('');
  badgeVariant = input<BadgeVariant>('brand');
  iconName = input<string>('cube');
  iconColorClass = input<string>('bg-brand-50 text-brand-600');
  footerText = input<string>('');

  iconBgClasses() {
    return `flex h-10 w-10 items-center justify-center rounded-lg ${this.iconColorClass()}`;
  }
}
