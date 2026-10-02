import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { IconComponent } from '../../atomics/icon.component';
import { BadgeComponent } from '../../atomics/badge.component';
import { MenuItem } from './menu.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, BadgeComponent],
  templateUrl: './menu.component.html',
  host: {
    class: 'block w-full'
  }
})
export class MenuComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Lista de elementos del menú */
  items = input.required<MenuItem[]>();

  /** Define si el menú está en modo colapsado (para sidebars estrechos) */
  collapsed = input<boolean>(false);

  /** Si está activo, abrir un submenú cerrará los demás */
  accordion = input<boolean>(false);

  /** Evento emitido al hacer clic en cualquier opción navegable o de submenú */
  itemClicked = output<MenuItem>();

  /** Set reactivo que guarda las claves de los elementos desplegados */
  private expandedKeys = signal<Set<string>>(new Set<string>());

  ngOnInit(): void {
    // Al iniciar, expandir automáticamente si la ruta actual coincide con algún submenú
    this.autoExpandActiveRoutes(this.router.url);

    // Escuchar cambios de navegación para mantener abierto el menú correspondiente
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.autoExpandActiveRoutes(event.urlAfterRedirects || event.url);
      });
  }

  /**
   * Obtiene la clave identificadora única del item
   */
  getItemKey(item: MenuItem, index?: number): string {
    return item.id || item.route || item.label || `item-${index}`;
  }

  /**
   * Verifica si un item tiene submenú con elementos
   */
  hasChildren(item: MenuItem): boolean {
    return Array.isArray(item.children) && item.children.length > 0;
  }

  /**
   * Determina si el item especificado está expandido
   */
  isExpanded(item: MenuItem): boolean {
    return this.expandedKeys().has(this.getItemKey(item));
  }

  /**
   * Determina si la ruta actual o un submenú está activo para estilizar el padre
   */
  isChildActive(item: MenuItem): boolean {
    if (!item.children || item.children.length === 0) {
      return false;
    }
    const currentUrl = this.router.url;
    return item.children.some((child) => child.route && (currentUrl === child.route || currentUrl.startsWith(`${child.route}/`)));
  }

  /**
   * Alterna la apertura o cierre del submenú
   */
  toggleSubmenu(item: MenuItem, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const key = this.getItemKey(item);
    this.expandedKeys.update((keys) => {
      const next = new Set(this.accordion() ? [] : keys);
      if (keys.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    this.itemClicked.emit(item);
  }

  /**
   * Manejador de clic en un elemento sin hijos o en un elemento hijo
   */
  handleItemClick(item: MenuItem): void {
    this.itemClicked.emit(item);
  }

  /**
   * Auto-despliega el menú padre si la URL activa coincide con alguno de sus hijos
   */
  private autoExpandActiveRoutes(currentUrl: string): void {
    const activeParents: string[] = [];

    for (const item of this.items()) {
      if (item.children && item.children.length > 0) {
        const matchesChild = item.children.some(
          (child) => child.route && (currentUrl === child.route || currentUrl.startsWith(`${child.route}/`))
        );
        if (matchesChild) {
          activeParents.push(this.getItemKey(item));
        }
      }
    }

    if (activeParents.length > 0) {
      this.expandedKeys.update((keys) => {
        const next = new Set(keys);
        activeParents.forEach((k) => next.add(k));
        return next;
      });
    }
  }
}
