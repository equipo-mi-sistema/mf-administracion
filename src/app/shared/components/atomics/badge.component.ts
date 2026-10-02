import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses()">
      @if (dot()) {
        <span [class]="dotClasses()"></span>
      }
      <ng-content>{{ label() }}</ng-content>
    </span>
  `
})
export class BadgeComponent {
  variant = input<BadgeVariant>('brand');
  size = input<BadgeSize>('sm');
  dot = input<boolean>(false);
  pulse = input<boolean>(false);
  label = input<string>('');

  badgeClasses = computed(() => {
    const base = 'inline-flex items-center font-medium rounded-full transition-colors';
    
    const sizeMap: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs'
    };

    const variantMap: Record<BadgeVariant, string> = {
      brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-700/10',
      success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border border-amber-200',
      danger: 'bg-rose-50 text-rose-700 border border-rose-200',
      neutral: 'bg-slate-100 text-slate-700 border border-slate-200'
    };

    return `${base} ${sizeMap[this.size()]} ${variantMap[this.variant()]}`;
  });

  dotClasses = computed(() => {
    const base = 'h-1.5 w-1.5 rounded-full mr-1.5 flex-shrink-0';
    const pulseClass = this.pulse() ? 'animate-pulse' : '';

    const colorMap: Record<BadgeVariant, string> = {
      brand: 'bg-brand-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500',
      neutral: 'bg-slate-500'
    };

    return `${base} ${colorMap[this.variant()]} ${pulseClass}`.trim();
  });
}
