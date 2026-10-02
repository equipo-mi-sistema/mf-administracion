import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()">
      <div class="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-cyan-500 shadow-lg shadow-brand-500/25">
        <svg class="w-3/5 h-3/5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    </div>
  `
})
export class BrandLogoComponent {
  size = input<'sm' | 'md' | 'lg'>('md');

  containerClasses = computed(() => {
    switch (this.size()) {
      case 'sm': return 'w-10 h-10';
      case 'lg': return 'w-20 h-20';
      default:   return 'w-16 h-16';
    }
  });
}
