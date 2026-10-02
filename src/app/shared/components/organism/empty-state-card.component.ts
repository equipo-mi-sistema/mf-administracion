import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../atomics/icon.component';

@Component({
  selector: 'app-empty-state-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3">
        <app-icon [name]="iconName()" size="lg"></app-icon>
      </div>
      <h3 class="text-sm font-semibold text-slate-800">{{ title() }}</h3>
      <p class="mt-1 text-xs text-slate-500 max-w-md mx-auto">
        {{ description() }}
        @if (codeSnippet()) {
          <code class="bg-slate-100 px-1 py-0.5 rounded text-brand-700 font-mono">{{ codeSnippet() }}</code>
        }
      </p>
      <div class="mt-4">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EmptyStateCardComponent {
  iconName = input<string>('plus');
  title = input.required<string>();
  description = input<string>('');
  codeSnippet = input<string>('');
}
