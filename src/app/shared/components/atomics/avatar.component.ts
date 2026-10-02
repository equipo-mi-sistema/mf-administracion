import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="alt()"
        [class]="avatarClasses() + ' object-cover'"
      />
    } @else {
      <div [class]="avatarClasses() + ' bg-gradient-to-br from-slate-700 to-slate-900 text-white font-medium shadow-sm ring-2 ring-white select-none'">
        {{ initials() }}
      </div>
    }
  `
})
export class AvatarComponent {
  initials = input<string>('U');
  src = input<string | null>(null);
  alt = input<string>('Avatar');
  size = input<AvatarSize>('md');

  avatarClasses = computed(() => {
    const base = 'inline-flex items-center justify-center rounded-full flex-shrink-0';

    const sizeMap: Record<AvatarSize, string> = {
      sm: 'h-7 w-7 text-[10px]',
      md: 'h-8 w-8 text-xs',
      lg: 'h-10 w-10 text-sm font-semibold'
    };

    return `${base} ${sizeMap[this.size()]}`;
  });
}
