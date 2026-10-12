import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, of, catchError } from 'rxjs';
import { User, UserFilter } from '../models/admin.model';
import { AuditService } from './audit.service';
import { AuthService } from '../auth/auth.service';

const INITIAL_MOCK_USERS: User[] = [
  {
    id: 'usr_001',
    uid: 'usr_001',
    nombres: 'Carlos Andrés',
    apellidos: 'Restrepo Gómez',
    displayName: 'Carlos Andrés Restrepo Gómez',
    email: 'carlos.restrepo@misistema.local',
    telefono: '+57 300 123 4567',
    rolId: 'SUPER_ADMIN',
    role_id: 'SUPER_ADMIN',
    rolNombre: 'Super Administrador',
    team_id: 'eq_dosquebradas_01',
    teamId: 'eq_dosquebradas_01',
    cargo: 'Director Estratégico',
    estado: 'ACTIVO',
    status: 'ACTIVE',
    scope: {
      departamento: 'Risaralda',
      ciudad: 'Dosquebradas',
      comunas: ['*']
    },
    fechaCreacion: '2026-01-15'
  },
  {
    id: 'usr_002',
    uid: 'usr_002',
    nombres: 'Mariana',
    apellidos: 'Duque Pérez',
    displayName: 'Mariana Duque Pérez',
    email: 'mariana.duque@misistema.local',
    telefono: '+57 311 987 6543',
    rolId: 'TEAM_OWNER',
    role_id: 'TEAM_OWNER',
    rolNombre: 'Dueño de Equipo',
    team_id: 'eq_pereira_centro',
    teamId: 'eq_pereira_centro',
    cargo: 'Coordinadora Pereira Centro',
    estado: 'ACTIVO',
    status: 'ACTIVE',
    scope: {
      departamento: 'Risaralda',
      ciudad: 'Pereira',
      comunas: ['Comuna 10 - Centro', 'Comuna 11 - San Joaquín']
    },
    fechaCreacion: '2026-02-10'
  },
  {
    id: 'usr_003',
    uid: 'usr_003',
    nombres: 'Santiago',
    apellidos: 'Muñoz Varela',
    displayName: 'Santiago Muñoz Varela',
    email: 'santiago.munoz@misistema.local',
    telefono: '+57 320 555 7890',
    rolId: 'MEMBER',
    role_id: 'MEMBER',
    rolNombre: 'Miembro Operativo',
    team_id: 'eq_santa_rosa_01',
    teamId: 'eq_santa_rosa_01',
    cargo: 'Líder Barrial',
    estado: 'INACTIVO',
    status: 'INACTIVE',
    scope: {
      departamento: 'Risaralda',
      ciudad: 'Santa Rosa de Cabal',
      comunas: ['Barrio La Hermosa']
    },
    fechaCreacion: '2026-03-01'
  },
  {
    id: 'usr_004',
    uid: 'usr_004',
    nombres: 'Valentina',
    apellidos: 'Ospina Henao',
    displayName: 'Valentina Ospina Henao',
    email: 'valentina.ospina@misistema.local',
    telefono: '+57 315 444 1122',
    rolId: 'MEMBER',
    role_id: 'MEMBER',
    rolNombre: 'Auditor de Calidad',
    team_id: 'eq_dosquebradas_01',
    teamId: 'eq_dosquebradas_01',
    cargo: 'Auditor de Procesos',
    estado: 'ACTIVO',
    status: 'ACTIVE',
    scope: {
      departamento: 'Risaralda',
      ciudad: 'Dosquebradas',
      comunas: ['Comuna 2']
    },
    fechaCreacion: '2026-03-12'
  }
];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore, { optional: true });
  private auditService = inject(AuditService);
  private authService = inject(AuthService);
  private mockUsers$ = new BehaviorSubject<User[]>(INITIAL_MOCK_USERS);

  getUsers(filters?: UserFilter): Observable<User[]> {
    if (this.firestore) {
      try {
        const usersCollection = collection(this.firestore, 'users');
        let q = query(usersCollection);

        if (filters?.team_id) {
          q = query(q, where('team_id', '==', filters.team_id));
        }
        if (filters?.status) {
          q = query(q, where('status', '==', filters.status));
        }

        return (collectionData(q, { idField: 'id' }) as Observable<User[]>).pipe(
          catchError((err) => {
            console.warn('[Firestore] Error al consultar /users, utilizando almacén local:', err);
            return this.mockUsers$.asObservable();
          })
        );
      } catch (e) {
        console.warn('[Firestore] No inicializado, usando almacén local:', e);
      }
    }
    return this.mockUsers$.asObservable();
  }

  async createUser(user: Omit<User, 'id'>): Promise<string> {
    const payload = {
      ...user,
      displayName: user.displayName || `${user.nombres || ''} ${user.apellidos || ''}`.trim(),
      status: user.status || (user.estado === 'INACTIVO' ? 'INACTIVE' : 'ACTIVE'),
      role_id: user.role_id || user.rolId || 'MEMBER',
      team_id: user.team_id || user.teamId || null,
      fechaCreacion: new Date().toISOString()
    };

    if (this.firestore) {
      try {
        const usersCollection = collection(this.firestore, 'users');
        const docRef = await addDoc(usersCollection, payload);
        return docRef.id;
      } catch (err) {
        console.warn('[Firestore] Fallo al escribir en /users, guardando localmente:', err);
      }
    }

    const newId = 'usr_' + Date.now();
    const newUser: User = { id: newId, uid: newId, ...payload };
    const current = this.mockUsers$.value;
    this.mockUsers$.next([newUser, ...current]);
    return newId;
  }

  async updateUser(id: string, user: Partial<User>): Promise<void> {
    const payload = {
      ...user,
      fechaActualizacion: new Date().toISOString()
    };

    if (this.firestore) {
      try {
        const userDoc = doc(this.firestore, `users/${id}`);
        await updateDoc(userDoc, payload);
        return;
      } catch (err) {
        console.warn('[Firestore] Fallo al actualizar en /users, actualizando localmente:', err);
      }
    }

    const current = this.mockUsers$.value;
    const index = current.findIndex(u => u.id === id || u.uid === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...payload };
      this.mockUsers$.next([...current]);
    }
  }

  /**
   * "Botón Rojo": Inhabilita al usuario y fija status = 'INACTIVE' en Firestore.
   * Esto dispara el listener onSnapshot en el Host, expulsándolo de inmediato en todas sus pestañas.
   */
  async deactivateUser(uid: string): Promise<void> {
    const current = this.mockUsers$.value;
    const userObj = current.find(u => u.id === uid || u.uid === uid);
    const prevStatus = userObj?.status || userObj?.estado || 'ACTIVE';

    const updates = {
      status: 'INACTIVE' as const,
      estado: 'INACTIVO' as const,
      updatedAt: new Date().toISOString()
    };

    if (this.firestore) {
      try {
        const userDoc = doc(this.firestore, `users/${uid}`);
        await updateDoc(userDoc, updates);
      } catch (err) {
        console.warn('[UserService] Error al desactivar en Firestore:', err);
      }
    }

    const updatedList = current.map(u => 
      (u.id === uid || u.uid === uid) ? { ...u, ...updates } : u
    );
    this.mockUsers$.next(updatedList);

    await this.auditService.logEvent({
      action: 'USER_DISABLE',
      target_id: uid,
      previous_state: { status: prevStatus },
      new_state: { status: 'INACTIVE' }
    });
  }

  async activateUser(uid: string): Promise<void> {
    const current = this.mockUsers$.value;
    const userObj = current.find(u => u.id === uid || u.uid === uid);
    const prevStatus = userObj?.status || userObj?.estado || 'INACTIVE';

    const updates = {
      status: 'ACTIVE' as const,
      estado: 'ACTIVO' as const,
      updatedAt: new Date().toISOString()
    };

    if (this.firestore) {
      try {
        const userDoc = doc(this.firestore, `users/${uid}`);
        await updateDoc(userDoc, updates);
      } catch (err) {
        console.warn('[UserService] Error al activar en Firestore:', err);
      }
    }

    const updatedList = current.map(u => 
      (u.id === uid || u.uid === uid) ? { ...u, ...updates } : u
    );
    this.mockUsers$.next(updatedList);

    await this.auditService.logEvent({
      action: 'USER_ENABLE',
      target_id: uid,
      previous_state: { status: prevStatus },
      new_state: { status: 'ACTIVE' }
    });
  }

  async deleteUser(id: string): Promise<void> {
    if (this.firestore) {
      try {
        const userDoc = doc(this.firestore, `users/${id}`);
        await deleteDoc(userDoc);
        return;
      } catch (err) {
        console.warn('[Firestore] Fallo al eliminar en /users, eliminando localmente:', err);
      }
    }

    const current = this.mockUsers$.value.filter(u => u.id !== id && u.uid !== id);
    this.mockUsers$.next(current);
  }
}
