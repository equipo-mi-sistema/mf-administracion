import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  user, 
  getIdTokenResult, 
  User 
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppUser, CustomUserClaims } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth: Auth = inject(Auth);
  private readonly router: Router = inject(Router);

  // Signals de estado reactivo
  readonly currentUser = signal<AppUser | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly authError = signal<string | null>(null);

  // Computed signals
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userClaims = computed<CustomUserClaims>(() => this.currentUser()?.claims ?? {});
  readonly userRoleId = computed<string | null>(() => this.currentUser()?.role_id ?? this.currentUser()?.roleId ?? null);
  readonly userTeamId = computed<string | null>(() => this.currentUser()?.team_id ?? this.currentUser()?.teamId ?? null);
  readonly userRoles = computed<string[]>(() => {
    const roles = (this.currentUser()?.claims.roles as string[]) || [];
    const roleId = this.userRoleId();
    if (roleId && !roles.includes(roleId)) {
      return [roleId, ...roles];
    }
    return roles;
  });
  readonly isSuperAdmin = computed<boolean>(() => {
    const roleId = this.userRoleId();
    return roleId === 'SUPER_ADMIN' || this.userRoles().includes('SUPER_ADMIN');
  });
  readonly userModules = computed<string[]>(() => this.currentUser()?.claims.modules ?? []);
  readonly userScope = computed<string>(() => this.currentUser()?.claims.scope ?? '');

  // Observable nativo de Firebase Auth
  readonly authState$: Observable<User | null> = user(this.auth);

  constructor() {
    this.initAuthStateListener();
  }

  /**
   * Escucha reactivamente los cambios de sesión unificada de Firebase Auth
   * y extrae los Custom Claims del JWT.
   */
  private initAuthStateListener(): void {
    this.authState$.subscribe(async (firebaseUser) => {
      this.isLoading.set(true);
      if (firebaseUser) {
        try {
          const tokenResult = await getIdTokenResult(firebaseUser, false);
          const claims = (tokenResult.claims || {}) as CustomUserClaims;
          const roleId = (claims.role_id || (claims.roles && claims.roles[0]) || null) as string | null;
          const teamId = (claims.team_id || null) as string | null;

          this.currentUser.set({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            roleId,
            role_id: roleId,
            teamId,
            team_id: teamId,
            claims: {
              role_id: roleId || undefined,
              team_id: teamId || undefined,
              roles: (claims['roles'] as string[]) || (roleId ? [roleId] : []),
              modules: (claims['modules'] as string[]) || [],
              scope: (claims['scope'] as string) || '',
              ...claims
            }
          });
        } catch (error) {
          console.error('Error al obtener Custom Claims del usuario:', error);
          this.currentUser.set(null);
        }
      } else {
        this.currentUser.set(null);
      }
      this.isLoading.set(false);
    });
  }

  /**
   * Inicio de sesión exclusivo mediante Google SSO (Popup).
   */
  async loginWithGoogle(): Promise<AppUser | null> {
    this.authError.set(null);
    this.isLoading.set(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const credential = await signInWithPopup(this.auth, provider);
      const tokenResult = await getIdTokenResult(credential.user, true);
      const claims = (tokenResult.claims || {}) as CustomUserClaims;
      const roleId = (claims.role_id || (claims.roles && claims.roles[0]) || null) as string | null;
      const teamId = (claims.team_id || null) as string | null;

      const appUser: AppUser = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL,
        roleId,
        role_id: roleId,
        teamId,
        team_id: teamId,
        claims: {
          role_id: roleId || undefined,
          team_id: teamId || undefined,
          roles: (claims['roles'] as string[]) || (roleId ? [roleId] : []),
          modules: (claims['modules'] as string[]) || [],
          scope: (claims['scope'] as string) || '',
          ...claims
        }
      };

      this.currentUser.set(appUser);
      return appUser;
    } catch (error: any) {
      console.error('Fallo en Google SSO:', error);
      let message = 'Ocurrió un error al iniciar sesión con Google.';
      if (error?.code === 'auth/popup-closed-by-user') {
        message = 'La ventana de inicio de sesión se cerró antes de completar el proceso.';
      } else if (error?.code === 'auth/cancelled-popup-request') {
        message = 'Solicitud de autenticación cancelada.';
      } else if (error?.code === 'auth/network-request-failed') {
        message = 'Error de red. Verifica tu conexión a internet.';
      } else if (error?.message) {
        message = error.message;
      }
      this.authError.set(message);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cierre de sesión y redirección a login.
   */
  async logout(): Promise<void> {
    this.isLoading.set(true);
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
      await this.router.navigate(['/login']);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtiene el token JWT actual (Bearer) para adjuntar en cabeceras de red.
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const activeUser = this.auth.currentUser;
    return activeUser ? await activeUser.getIdToken(forceRefresh) : null;
  }
}
