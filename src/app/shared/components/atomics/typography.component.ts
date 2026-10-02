import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typography',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant()) {
      @case ('h1') {
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"><ng-content></ng-content></h1>
      }
      @case ('subtitle') {
        <p class="text-sm text-slate-500 leading-relaxed"><ng-content></ng-content></p>
      }
      @case ('caption') {
        <p class="text-xs text-slate-400"><ng-content></ng-content></p>
      }
      @case ('security-note') {
        <p class="text-xs text-slate-500 leading-relaxed font-medium"><ng-content></ng-content></p>
      }
      @default {
        <span class="text-sm text-slate-700"><ng-content></ng-content></span>
      }
    }
  `
})
export class TypographyComponent {
  variant = input<'h1' | 'subtitle' | 'caption' | 'security-note' | 'body'>('body');
}
