import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../atomics/avatar.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
      <app-avatar [initials]="initials()" size="md"></app-avatar>
      @if (showDetails()) {
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-xs font-semibold text-slate-800">{{ name() }}</span>
          <span class="text-[11px] text-slate-500">{{ email() }}</span>
        </div>
      }
    </div>
  `
})
export class UserProfileComponent {
  name = input<string>('Administrador');
  email = input<string>('admin@misistema.local');
  initials = input<string>('AD');
  showDetails = input<boolean>(true);
}
