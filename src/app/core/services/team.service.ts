import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, of, catchError } from 'rxjs';
import { Team, Invitation } from '../models/admin.model';
import { AuditService } from './audit.service';
import { AuthService } from '../auth/auth.service';

const INITIAL_TEAMS: Team[] = [
  {
    id: 'eq_dosquebradas_01',
    team_id: 'eq_dosquebradas_01',
    team_name: 'Equipo Territorial Dosquebradas',
    leader_uid: 'usr_001',
    leader_email: 'carlos.restrepo@misistema.local',
    leader_name: 'Carlos Andrés Restrepo',
    created_at: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'eq_pereira_centro',
    team_id: 'eq_pereira_centro',
    team_name: 'Comando Central Pereira',
    leader_uid: 'usr_002',
    leader_email: 'mariana.duque@misistema.local',
    leader_name: 'Mariana Duque',
    created_at: '2026-02-01T15:30:00.000Z'
  },
  {
    id: 'eq_santa_rosa_01',
    team_id: 'eq_santa_rosa_01',
    team_name: 'Comité Santa Rosa de Cabal',
    leader_uid: 'usr_003',
    leader_email: 'santiago.munoz@misistema.local',
    leader_name: 'Santiago Muñoz',
    created_at: '2026-02-20T08:00:00.000Z'
  }
];

const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv_001',
    email: 'votantes.coord@gmail.com',
    email_hash: 'a1b2c3d4e5f6',
    team_id: 'eq_dosquebradas_01',
    team_name: 'Equipo Territorial Dosquebradas',
    role_id: 'TEAM_OWNER',
    cargo: 'Coordinador General Comuna 2',
    created_at: '2026-03-01T12:00:00.000Z'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private firestore = inject(Firestore, { optional: true });
  private auditService = inject(AuditService);
  private authService = inject(AuthService);

  private mockTeams$ = new BehaviorSubject<Team[]>(INITIAL_TEAMS);
  private mockInvitations$ = new BehaviorSubject<Invitation[]>(INITIAL_INVITATIONS);

  getTeams(): Observable<Team[]> {
    if (this.firestore) {
      try {
        const colRef = collection(this.firestore, 'teams');
        return (collectionData(colRef, { idField: 'id' }) as Observable<Team[]>).pipe(
          catchError((err) => {
            console.warn('[TeamService] Usando fallback local para equipos:', err);
            return this.mockTeams$.asObservable();
          })
        );
      } catch (err) {
        console.warn('[TeamService] Firestore no disponible:', err);
      }
    }
    return this.mockTeams$.asObservable();
  }

  async createTeam(params: { team_name: string; leader_uid: string; leader_email?: string; leader_name?: string }): Promise<string> {
    const isSuperAdmin = this.authService.isSuperAdmin();
    if (!isSuperAdmin) {
      await this.auditService.logEvent({
        action: 'UNAUTHORIZED_TEAM_CREATE_ATTEMPT',
        target_id: params.team_name,
        new_state: { error: '403 Forbidden - Solo SUPER_ADMIN puede crear equipos' }
      });
      throw new Error('403 Forbidden: Únicamente un SUPER_ADMIN puede crear equipos.');
    }

    const team_id = 'eq_' + params.team_name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    const newTeam: Team = {
      id: team_id,
      team_id,
      team_name: params.team_name,
      leader_uid: params.leader_uid,
      leader_email: params.leader_email,
      leader_name: params.leader_name,
      created_at: new Date().toISOString()
    };

    if (this.firestore) {
      try {
        const docRef = doc(this.firestore, `teams/${team_id}`);
        await setDoc(docRef, newTeam);
      } catch (err) {
        console.warn('[TeamService] Error al persistir equipo en Firestore:', err);
      }
    }

    this.mockTeams$.next([...this.mockTeams$.value, newTeam]);

    await this.auditService.logEvent({
      action: 'TEAM_CREATE',
      target_id: team_id,
      previous_state: null,
      new_state: newTeam
    });

    return team_id;
  }

  async updateTeamName(teamId: string, newName: string): Promise<void> {
    const current = this.mockTeams$.value;
    const team = current.find(t => t.id === teamId || t.team_id === teamId);
    const previousState = team ? { team_name: team.team_name } : null;

    if (this.firestore) {
      try {
        const docRef = doc(this.firestore, `teams/${teamId}`);
        await updateDoc(docRef, { team_name: newName });
      } catch (err) {
        console.warn('[TeamService] Error actualizando nombre en Firestore:', err);
      }
    }

    const updated = current.map(t => (t.id === teamId || t.team_id === teamId) ? { ...t, team_name: newName } : t);
    this.mockTeams$.next(updated);

    await this.auditService.logEvent({
      action: 'TEAM_UPDATE',
      target_id: teamId,
      previous_state: previousState,
      new_state: { team_name: newName }
    });
  }

  async transferLeadership(teamId: string, newLeaderUid: string, newLeaderEmail?: string, newLeaderName?: string): Promise<void> {
    const isSuperAdmin = this.authService.isSuperAdmin();
    if (!isSuperAdmin) {
      await this.auditService.logEvent({
        action: 'UNAUTHORIZED_TEAM_TRANSFER_ATTEMPT',
        target_id: teamId,
        new_state: { error: '403 Forbidden - Solo SUPER_ADMIN puede transferir liderazgo' }
      });
      throw new Error('403 Forbidden: Únicamente un SUPER_ADMIN puede transferir el liderazgo de un equipo.');
    }

    const current = this.mockTeams$.value;
    const team = current.find(t => t.id === teamId || t.team_id === teamId);
    const previousLeader = team?.leader_uid;

    if (this.firestore) {
      try {
        const docRef = doc(this.firestore, `teams/${teamId}`);
        await updateDoc(docRef, { 
          leader_uid: newLeaderUid,
          leader_email: newLeaderEmail || null,
          leader_name: newLeaderName || null
        });
      } catch (err) {
        console.warn('[TeamService] Error en transferencia de liderazgo Firestore:', err);
      }
    }

    const updated = current.map(t => {
      if (t.id === teamId || t.team_id === teamId) {
        return { 
          ...t, 
          leader_uid: newLeaderUid,
          leader_email: newLeaderEmail || t.leader_email,
          leader_name: newLeaderName || t.leader_name
        };
      }
      return t;
    });
    this.mockTeams$.next(updated);

    await this.auditService.logEvent({
      action: 'TEAM_TRANSFER',
      target_id: teamId,
      previous_state: { leader_uid: previousLeader },
      new_state: { leader_uid: newLeaderUid, leader_email: newLeaderEmail }
    });
  }

  getInvitations(): Observable<Invitation[]> {
    if (this.firestore) {
      try {
        const colRef = collection(this.firestore, 'invitations');
        return (collectionData(colRef, { idField: 'id' }) as Observable<Invitation[]>).pipe(
          catchError(() => this.mockInvitations$.asObservable())
        );
      } catch {
        // fallback
      }
    }
    return this.mockInvitations$.asObservable();
  }

  async createInvitation(params: { email: string; team_id: string; role_id: string; cargo: string }): Promise<string> {
    // Hashear email para la clave de documento
    const emailNormalized = params.email.trim().toLowerCase();
    const hash = btoa(emailNormalized).replace(/=/g, '');

    const teams = this.mockTeams$.value;
    const teamObj = teams.find(t => t.id === params.team_id || t.team_id === params.team_id);

    const newInvite: Invitation = {
      id: hash,
      email: emailNormalized,
      email_hash: hash,
      team_id: params.team_id,
      team_name: teamObj?.team_name || params.team_id,
      role_id: params.role_id,
      cargo: params.cargo,
      created_at: new Date().toISOString()
    };

    if (this.firestore) {
      try {
        const docRef = doc(this.firestore, `invitations/${hash}`);
        await setDoc(docRef, newInvite);
      } catch (err) {
        console.warn('[TeamService] Error guardando invitación en Firestore:', err);
      }
    }

    this.mockInvitations$.next([newInvite, ...this.mockInvitations$.value]);

    await this.auditService.logEvent({
      action: 'INVITATION_CREATE',
      target_id: emailNormalized,
      previous_state: null,
      new_state: { team_id: params.team_id, role_id: params.role_id, cargo: params.cargo }
    });

    return hash;
  }
}
