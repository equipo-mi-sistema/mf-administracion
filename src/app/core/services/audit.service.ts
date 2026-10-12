import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  addDoc, 
  query, 
  orderBy, 
  limit 
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, of, catchError } from 'rxjs';
import { AuditLog } from '../models/admin.model';
import { AuthService } from '../auth/auth.service';

const INITIAL_MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    timestamp_utc: new Date(Date.now() - 3600000 * 2).toISOString(),
    executor_uid: 'superadmin_uid_01',
    executor_email: 'admin@misistema.gov.co',
    ip_address: '190.24.120.45',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    action: 'ROLE_CREATE',
    target_id: 'rol_coordinador',
    previous_state: null,
    new_state: { role_name: 'Coordinador Zonal', permissions: { mapeo: ['voters:read', 'territory:manage'] } }
  },
  {
    id: 'log_002',
    timestamp_utc: new Date(Date.now() - 3600000 * 5).toISOString(),
    executor_uid: 'superadmin_uid_01',
    executor_email: 'admin@misistema.gov.co',
    ip_address: '190.24.120.45',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    action: 'KILL_SWITCH_TOGGLED',
    target_id: 'mapeo',
    previous_state: { active: false },
    new_state: { active: true }
  },
  {
    id: 'log_003',
    timestamp_utc: new Date(Date.now() - 3600000 * 24).toISOString(),
    executor_uid: 'superadmin_uid_01',
    executor_email: 'admin@misistema.gov.co',
    ip_address: '186.84.90.12',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    action: 'TEAM_TRANSFER',
    target_id: 'eq_dosquebradas_01',
    previous_state: { leader_uid: 'usr_003' },
    new_state: { leader_uid: 'usr_001' }
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private firestore = inject(Firestore, { optional: true });
  private authService = inject(AuthService);
  private mockLogs$ = new BehaviorSubject<AuditLog[]>(INITIAL_MOCK_AUDIT_LOGS);
  private cachedIp: string | null = null;

  constructor() {
    this.detectClientIp();
  }

  private async detectClientIp(): Promise<string> {
    if (this.cachedIp) return this.cachedIp;
    try {
      const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
      const data = await response.json();
      this.cachedIp = data.ip || '127.0.0.1';
    } catch {
      this.cachedIp = '127.0.0.1';
    }
    return this.cachedIp || '127.0.0.1';
  }

  getAuditLogs(): Observable<AuditLog[]> {
    if (this.firestore) {
      try {
        const auditCol = collection(this.firestore, 'audit_logs');
        const q = query(auditCol, orderBy('timestamp_utc', 'desc'), limit(100));
        return (collectionData(q, { idField: 'id' }) as Observable<AuditLog[]>).pipe(
          catchError((err) => {
            console.warn('[AuditService] Fallo al leer /audit_logs, usando logs locales:', err);
            return this.mockLogs$.asObservable();
          })
        );
      } catch (err) {
        console.warn('[AuditService] Firestore no inicializado para auditoría:', err);
      }
    }
    return this.mockLogs$.asObservable();
  }

  async logEvent(params: {
    action: string;
    target_id: string;
    previous_state?: Record<string, any> | null;
    new_state?: Record<string, any> | null;
    executor?: { uid: string; email: string };
  }): Promise<string> {
    const ip = await this.detectClientIp();
    const currentUser = this.authService.currentUser();
    const executor_uid = params.executor?.uid || currentUser?.uid || 'SYSTEM';
    const executor_email = params.executor?.email || currentUser?.email || 'system@sistema.local';

    const logEntry: Omit<AuditLog, 'id'> = {
      timestamp_utc: new Date().toISOString(),
      executor_uid,
      executor_email,
      ip_address: ip,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      action: params.action,
      target_id: params.target_id,
      previous_state: params.previous_state ?? null,
      new_state: params.new_state ?? null
    };

    if (this.firestore) {
      try {
        const auditCol = collection(this.firestore, 'audit_logs');
        const docRef = await addDoc(auditCol, logEntry);
        return docRef.id;
      } catch (err) {
        console.warn('[AuditService] No se pudo guardar auditoría en Firestore:', err);
      }
    }

    const localId = 'log_' + Date.now();
    const fullLog: AuditLog = { id: localId, ...logEntry };
    this.mockLogs$.next([fullLog, ...this.mockLogs$.value]);
    return localId;
  }
}
