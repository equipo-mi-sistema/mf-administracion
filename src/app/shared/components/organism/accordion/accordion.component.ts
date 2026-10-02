import {
  AfterContentInit,
  Component,
  ContentChildren,
  DestroyRef,
  QueryList,
  inject,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccordionItemComponent } from '../../molecules/accordion-item.component';

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <ng-content></ng-content>
    </div>
  `
})
export class AccordionComponent implements AfterContentInit {
  private readonly destroyRef = inject(DestroyRef);
  private subscriptions: { unsubscribe(): void }[] = [];

  /** Si está activo, abrir un elemento cerrará automáticamente a los demás */
  accordionMode = input<boolean>(false);

  @ContentChildren(AccordionItemComponent)
  items!: QueryList<AccordionItemComponent>;

  ngAfterContentInit(): void {
    this.setupAccordionMode();
    this.items.changes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setupAccordionMode());

    this.destroyRef.onDestroy(() => {
      this.clearSubscriptions();
    });
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private setupAccordionMode(): void {
    this.clearSubscriptions();
    this.items.forEach((item) => {
      const sub = item.toggled.subscribe((isOpen: boolean) => {
        if (isOpen && this.accordionMode()) {
          this.items.forEach((other) => {
            if (other !== item) {
              other.isOpen.set(false);
            }
          });
        }
      });
      this.subscriptions.push(sub);
    });
  }
}
