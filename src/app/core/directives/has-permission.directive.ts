import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permService = inject(PermissionService);

  private requiredPermissions: string[] = [];
  private isVisible = false;

  @Input() set hasPermission(permission: string | string[]) {
    if (Array.isArray(permission)) {
      this.requiredPermissions = permission;
    } else if (permission) {
      this.requiredPermissions = [permission];
    } else {
      this.requiredPermissions = [];
    }
    this.updateView();
  }

  constructor() {
    // Reacciona automáticamente cuando cambian los permisos en la señal reactiva
    effect(() => {
      this.permService.permissions();
      this.updateView();
    });
  }

  private updateView() {
    if (this.requiredPermissions.length === 0) {
      this.render();
      return;
    }

    const hasAccess = this.requiredPermissions.some(perm =>
      this.permService.hasPermission(perm)
    );

    if (hasAccess && !this.isVisible) {
      this.render();
    } else if (!hasAccess && this.isVisible) {
      this.clear();
    }
  }

  private render() {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.isVisible = true;
  }

  private clear() {
    this.viewContainer.clear();
    this.isVisible = false;
  }
}
