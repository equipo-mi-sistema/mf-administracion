import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-brand-900/10">
      <div class="relative z-10 max-w-2xl">
        @if (chipText()) {
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur mb-4 border border-white/20">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            {{ chipText() }}
          </div>
        }
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          {{ title() }}
        </h1>
        <p class="text-sm sm:text-base text-brand-100 leading-relaxed">
          <ng-content>{{ description() }}</ng-content>
        </p>
      </div>
      <div class="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  `
})
export class WelcomeBannerComponent {
  title = input.required<string>();
  description = input<string>('');
  chipText = input<string>('');
}
