import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, of, catchError } from 'rxjs';
import { User, UserFilter } from '../models/admin.model';

const INITIAL_MOCK_USERS: User[] = [
  {
    id: 'usr_001',
    uid: 'firebase_uid_1',
    nombres: 'Carlos Andrés',
    apellidos: 'Restrepo Gómez',
    email: 'carlos.restrepo@misistema.local',
    telefono: '+57 300 123 4567',
    rolId: 'rol_admin_gral',
    rolNombre: 'Administrador General',
    estado: 'ACTIVO',
    scope: {
      departamento: 'Antioquia',
      ciudad: 'Medellín',
      comunas: ['*']
    },
    fechaCreacion: '2026-01-15'
  },
  {
    id: 'usr_002',
    uid: 'firebase_uid_2',
    nombres: 'Mariana',
    apellidos: 'Duque Pérez',
    email: 'mariana.duque@misistema.local',
    telefono: '+57 311 987 6543',
    rolId: 'rol_coordinador',
    rolNombre: 'Coordinador Zonal',
    estado: 'ACTIVO',
    scope: {
      departamento: 'Antioquia',
      ciudad: 'Medellín',
      comunas: ['Comuna 10 - La Candelaria', 'Comuna 11 - Laureles']
    },
    fechaCreacion: '2026-02-10'
  },
  {
    id: 'usr_003',
    uid: 'firebase_uid_3',
    nombres: 'Santiago',
    apellidos: 'Muñoz Varela',
    email: 'santiago.munoz@misistema.local',
    telefono: '+57 320 555 7890',
    rolId: 'rol_operador',
    rolNombre: 'Operador de Campo',
    estado: 'INACTIVO',
    scope: {
      departamento: 'Antioquia',
      ciudad: 'Bello',
      comunas: ['Comuna 4 - Suárez']
    },
    fechaCreacion: '2026-03-01'
  },
  {
    id: 'usr_004',
    uid: 'firebase_uid_4',
    nombres: 'Valentina',
    apellidos: 'Ospina Henao',
    email: 'valentina.ospina@misistema.local',
    telefono: '+57 315 444 1122',
    rolId: 'rol_auditor',
    rolNombre: 'Auditor de Calidad',
    estado: 'BLOQUEADO',
    scope: {
      departamento: 'Antioquia',
      ciudad: 'Medellín',
      comunas: ['Comuna 14 - El Poblado']
    },
    fechaCreacion: '2026-03-12'
  }
];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore, { optional: true });
  private mockUsers$ = new BehaviorSubject<User[]>(INITIAL_MOCK_USERS);

  getUsers(filters?: UserFilter): Observable<User[]> {
    if (this.firestore) {
      try {
        const usersCollection = collection(this.firestore, 'users');
        let q = query(usersCollection);

        if (filters?.estado) {
          q = query(q, where('estado', '==', filters.estado));
        }
        if (filters?.ciudad) {
          q = query(q, where('scope.ciudad', '==', filters.ciudad));
        }

        return (collectionData(q, { idField: 'id' }) as Observable<User[]>).pipe(
          catchError((err) => {
            console.warn('[Firestore] Error al consultar /users, utilizando almacén local de desarrollo:', err);
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
    const newUser: User = { id: newId, ...payload };
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
    const index = current.findIndex(u => u.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...payload };
      this.mockUsers$.next([...current]);
    }
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

    const current = this.mockUsers$.value.filter(u => u.id !== id);
    this.mockUsers$.next(current);
  }
}
