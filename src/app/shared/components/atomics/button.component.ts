import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [title]="title()"
      [class]="buttonClasses()"
      (click)="clicked.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  title = input<string>('');

  clicked = output<MouseEvent>();

  buttonClasses = computed(() => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-fast ease-smooth focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const sizeMap: Record<ButtonSize, string> = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3.5 py-2 text-sm gap-2',
      lg: 'px-4 py-2.5 text-base gap-2.5',
      icon: 'p-2'
    };

    const variantMap: Record<ButtonVariant, string> = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-subtle hover:shadow-card active:bg-brand-800 active:scale-[0.98]',
      secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 active:bg-surface-300',
      outline: 'border border-surface-300 bg-white text-surface-700 hover:bg-surface-50 active:bg-surface-100',
      ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:bg-surface-200'
    };

    return `${base} ${sizeMap[this.size()]} ${variantMap[this.variant()]}`;
  });
}
