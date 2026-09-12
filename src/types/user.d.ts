/**
 * Shared user & role types.
 * Kept minimal for Milestone 3 (Authentication). Additional fields
 * (profile, ratings, etc.) will be added when the profile module ships.
 */

/** The two roles a person can sign up as. RBAC everywhere keys off this. */
export type UserRole = 'seeker' | 'provider';

/** The Firebase-supported sign-in methods this app implements/plans. */
export type AuthProviderType = 'email' | 'phone' | 'google' | 'facebook';

/**
 * Shape of a document in the Firestore `users` collection.
 * Mirrors system-design section 4 (Firestore Collections).
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL: string | null;
  authProvider: AuthProviderType;
  createdAt: number; // epoch millis, set client-side via Date.now() on write
}

/** Result of any auth operation exposed by the API layer / context. */
export interface AuthResult {
  uid: string;
  isNewUser: boolean;
}
