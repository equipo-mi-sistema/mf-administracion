import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  setDoc, 
  updateDoc 
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, of, catchError } from 'rxjs';
import { MicrofrontendConfig } from '../models/admin.model';
import { AuditService } from './audit.service';
import { AuthService } from '../auth/auth.service';

const INITIAL_MICROFRONTENDS: MicrofrontendConfig[] = [
  {
    id: 'administracion',
    name: 'Administración y Gobernanza',
    routePath: 'administracion',
    remoteEntry: 'http://localhost:4201/remoteEntry.json',
    exposedModule: './routes',
    active: true,
    rolesAllowed: ['SUPER_ADMIN'],
    icon: 'shield',
    order: 1,
    badge: 'Core'
  },
  {
    id: 'mapeo',
    name: 'Mapeo Territorial y Red Electoral',
    routePath: 'mapeo',
    remoteEntry: 'http://localhost:4202/remoteEntry.json',
    exposedModule: './routes',
    active: false,
    rolesAllowed: ['SUPER_ADMIN', 'TEAM_OWNER', 'MEMBER'],
    icon: 'map',
    order: 2,
    badge: 'Territorio'
  },
  {
    id: 'gestion',
    name: 'Gestión y Casos Ciudadanos v2',
    routePath: 'gestion',
    remoteEntry: 'http://localhost:4203/remoteEntry.json',
    exposedModule: './routes',
    active: false,
    rolesAllowed: ['SUPER_ADMIN', 'TEAM_OWNER', 'MEMBER'],
    icon: 'users',
    order: 3,
    badge: 'Atención'
  },
  {
    id: 'asistencia',
    name: 'Asistencia y Control de Eventos',
    routePath: 'asistencia',
    remoteEntry: 'http://localhost:4204/remoteEntry.json',
    exposedModule: './routes',
    active: false,
    rolesAllowed: ['SUPER_ADMIN', 'TEAM_OWNER', 'MEMBER'],
    icon: 'calendar',
    order: 4,
    badge: 'Eventos'
  },
  {
    id: 'transporte',
    name: 'Logística y Rastreo GPS PWA',
    routePath: 'transporte',
    remoteEntry: 'http://localhost:4205/remoteEntry.json',
    exposedModule: './routes',
    active: false,
    rolesAllowed: ['SUPER_ADMIN', 'TEAM_OWNER', 'MEMBER'],
    icon: 'truck',
    order: 5,
    badge: 'Logística'
  },
  {
    id: 'conteo',
    name: 'Testigos Electorales y Escrutinio E-14',
    routePath: 'conteo',
    remoteEntry: 'http://localhost:4206/remoteEntry.json',
    exposedModule: './routes',
    active: false,
    rolesAllowed: ['SUPER_ADMIN', 'TEAM_OWNER', 'MEMBER'],
    icon: 'chart',
    order: 6,
    badge: 'Escrutinio'
  }
];

@Injectable({
  providedIn: 'root'
})
export class KillSwitchService {
  private firestore = inject(Firestore, { optional: true });
  private auditService = inject(AuditService);
  private authService = inject(AuthService);
  private mockModules$ = new BehaviorSubject<MicrofrontendConfig[]>(INITIAL_MICROFRONTENDS);

  getMicrofrontends(): Observable<MicrofrontendConfig[]> {
    if (this.firestore) {
      try {
        const colRef = collection(this.firestore, 'config/microfrontends/modules');
        return (collectionData(colRef, { idField: 'id' }) as Observable<MicrofrontendConfig[]>).pipe(
          catchError((err) => {
            console.warn('[KillSwitchService] Usando fallback local para módulos:', err);
            return this.mockModules$.asObservable();
          })
        );
      } catch (err) {
        console.warn('[KillSwitchService] Firestore no disponible:', err);
      }
    }
    return this.mockModules$.asObservable();
  }

  async toggleMicrofrontend(id: string, newActiveState: boolean): Promise<void> {
    const currentList = this.mockModules$.value;
    const targetModule = currentList.find(m => m.id === id);
    const previousState = targetModule ? { active: targetModule.active } : null;

    if (this.firestore) {
      try {
        const docRef = doc(this.firestore, `config/microfrontends/modules/${id}`);
        await setDoc(docRef, { active: newActiveState }, { merge: true });
      } catch (err) {
        console.warn('[KillSwitchService] No se pudo guardar estado en Firestore:', err);
      }
    }

    // Actualizar estado en memoria
    const updated = currentList.map(m => m.id === id ? { ...m, active: newActiveState } : m);
    this.mockModules$.next(updated);

    // Emitir auditoría inmutable obligatoria
    await this.auditService.logEvent({
      action: 'KILL_SWITCH_TOGGLED',
      target_id: id,
      previous_state: previousState,
      new_state: { active: newActiveState }
    });
  }
}
