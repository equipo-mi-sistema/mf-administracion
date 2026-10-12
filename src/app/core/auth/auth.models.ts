export interface CustomUserClaims {
  role_id?: string;
  team_id?: string;
  roles?: string[];
  modules?: string[];
  scope?: string;
  admin?: boolean;
  [key: string]: unknown;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  roleId?: string | null;
  role_id?: string | null;
  teamId?: string | null;
  team_id?: string | null;
  cargo?: string;
  claims: CustomUserClaims;
}
