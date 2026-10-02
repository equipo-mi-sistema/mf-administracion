import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (item of items(); track $index) {
      <div
        [class]="skeletonClasses()"
        [style.width]="width()"
        [style.height]="height()"
        aria-hidden="true"
      ></div>
    }
  `
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('text');
  width = input<string>('100%');
  height = input<string>('1rem');
  count = input<number>(1);
  customClass = input<string>('');

  items = computed(() => Array.from({ length: this.count() }));

  skeletonClasses = computed(() => {
    const base = 'animate-pulse bg-slate-200/80 transition-all';

    const variantMap: Record<SkeletonVariant, string> = {
      text: 'rounded-md my-1.5',
      circular: 'rounded-full flex-shrink-0',
      rectangular: 'rounded-xl'
    };

    return `${base} ${variantMap[this.variant()]} ${this.customClass()}`.trim();
  });
}
