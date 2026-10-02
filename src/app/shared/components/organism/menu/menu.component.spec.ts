import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuComponent } from './menu.component';
import { MenuItem } from './menu.model';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  const mockItems: MenuItem[] = [
    { label: 'Inicio', icon: 'dashboard', route: '/' },
    {
      label: 'Componentes de diseño',
      icon: 'palette',
      children: [
        { label: 'Atómicos', route: '/componentes-diseno/atomicos', icon: 'cube' },
        { label: 'Moléculas', route: '/componentes-diseno/moleculas', icon: 'extension' },
        { label: 'Organismos', route: '/componentes-diseno/organismos', icon: 'palette' }
      ]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe detectar si un elemento tiene submenús', () => {
    expect(component.hasChildren(mockItems[0])).toBeFalse();
    expect(component.hasChildren(mockItems[1])).toBeTrue();
  });

  it('debe alternar la expansión al ejecutar toggleSubmenu', () => {
    const parentItem = mockItems[1];
    expect(component.isExpanded(parentItem)).toBeFalse();

    component.toggleSubmenu(parentItem);
    expect(component.isExpanded(parentItem)).toBeTrue();

    component.toggleSubmenu(parentItem);
    expect(component.isExpanded(parentItem)).toBeFalse();
  });

  it('debe emitir itemClicked al hacer clic en un elemento', () => {
    spyOn(component.itemClicked, 'emit');
    const leafItem = mockItems[0];
    component.handleItemClick(leafItem);
    expect(component.itemClicked.emit).toHaveBeenCalledWith(leafItem);
  });
});
