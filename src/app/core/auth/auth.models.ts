export interface CustomUserClaims {
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
  claims: CustomUserClaims;
}
