/**
 * src/api/firebase/auth.ts
 *
 * Thin wrapper around Firebase Auth (v9+ modular SDK).
 *
 * Per Section 8.1 of the system design doc, screens must never call
 * `firebase/auth` functions directly — they call these helpers instead.
 * That keeps the future FastAPI/JWT migration (Section 9.2) isolated to
 * this file: screens/hooks keep calling `signInWithEmail(...)` etc., only
 * the implementation swaps later.
 *
 * This file contains ONLY auth helper methods. No screens, no navigation,
 * no Firestore writes for role/profile data — those belong to
 * firestore.ts and the `features/auth` screens that will call these
 * helpers (Section 7: role is written to `users/{uid}.role` by the
 * *screen/feature* logic after signup succeeds here, not by this file).
 */

import {
  type User,
  type UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Creates a new user with email + password.
 * Does NOT write any Firestore profile/role document — that is the
 * responsibility of the calling feature code (see Section 7: "On first
 * signup → Role Selection" happens after this resolves).
 */
export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Signs in an existing user with email + password.
 */
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Signs the current user out.
 */
export async function signOutUser(): Promise<void> {
  return signOut(auth);
}

/**
 * Sends a password-reset email to the given address.
 */
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Returns the currently signed-in user, or null if no session exists.
 * Synchronous convenience wrapper around `auth.currentUser` — note that
 * on cold app start this may briefly be null even for a returning user,
 * until Firebase Auth finishes restoring the persisted session. Prefer
 * `subscribeToAuthChanges` below (or an AuthContext built on top of it)
 * to know when auth state has actually resolved.
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribes to auth state changes (sign-in, sign-out, session restored on
 * app launch). Returns an unsubscribe function.
 *
 * Intended consumer: `AuthContext` (src/state/context/AuthContext.tsx),
 * which will call this once and expose `user` / `isLoading` to the rest of
 * the app — this file itself does not manage any React state.
 */
export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
