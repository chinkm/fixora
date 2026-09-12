/**
 * src/api/firebase/auth.ts
 *
 * Thin wrapper around Firebase Authentication.
 *
 * Screens and Context should never call Firebase Auth directly.
 * They should use the functions exported from this file.
 */

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  PhoneAuthProvider,
  type ApplicationVerifier,
  type ConfirmationResult,
  type Unsubscribe,
  type User,
} from 'firebase/auth';

import { auth } from './firebase';

/* -------------------------------------------------------------------------- */
/* Error handling                                                             */
/* -------------------------------------------------------------------------- */

const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use':
    'An account with this email already exists.',
  'auth/invalid-email':
    'That email address looks invalid.',
  'auth/weak-password':
    'Please choose a stronger password.',
  'auth/user-not-found':
    'No account was found with this email.',
  'auth/wrong-password':
    'Incorrect email or password.',
  'auth/invalid-credential':
    'Incorrect email or password.',
  'auth/too-many-requests':
    'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed':
    'Network error. Please check your internet connection.',
  'auth/invalid-phone-number':
    'That phone number looks invalid.',
  'auth/invalid-verification-code':
    'That verification code is incorrect.',
  'auth/code-expired':
    'That verification code has expired. Please request a new one.',
  'auth/popup-closed-by-user':
    'Sign-in was cancelled.',
  'auth/account-exists-with-different-credential':
    'An account already exists with the same email using another sign-in method.',
};

export function toFriendlyAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;

  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  return 'Something went wrong. Please try again.';
}

/* -------------------------------------------------------------------------- */
/* Email & Password                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Creates a Firebase user using email and password.
 *
 * Returns the Firebase User rather than UserCredential because
 * AuthContext works with the authenticated User object.
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return credential.user;
}

/**
 * Signs in an existing user using email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return credential.user;
}

/**
 * Sends a password reset email.
 */
export async function resetPassword(
  email: string
): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/* -------------------------------------------------------------------------- */
/* Phone Number / OTP                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Starts phone-number authentication.
 *
 * `verifier` is the Firebase ApplicationVerifier created by
 * PhoneRecaptchaVerifier.tsx.
 */
export async function startPhoneSignIn(
  phoneNumber: string,
  verifier: ApplicationVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(
    auth,
    phoneNumber.trim(),
    verifier
  );
}

/**
 * Confirms the OTP code returned to the user's phone.
 */
export async function confirmPhoneOtp(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> {
  const credential = await confirmationResult.confirm(
    code.trim()
  );

  return credential.user;
}

/**
 * Creates a phone credential directly from a verification ID
 * and verification code.
 *
 * This is useful for an alternative phone-authentication flow.
 */
export function buildPhoneCredential(
  verificationId: string,
  code: string
) {
  return PhoneAuthProvider.credential(
    verificationId,
    code
  );
}

/* -------------------------------------------------------------------------- */
/* Google Sign-In                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Signs in to Firebase using a Google OAuth ID token.
 *
 * The Google OAuth token is obtained by the Google sign-in
 * layer, then passed here to Firebase.
 */
export async function signInWithGoogleIdToken(
  idToken: string
): Promise<User> {
  const credential =
    GoogleAuthProvider.credential(idToken);

  const result = await signInWithCredential(
    auth,
    credential
  );

  return result.user;
}

/* -------------------------------------------------------------------------- */
/* Authentication session                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Subscribes to Firebase authentication state changes.
 *
 * AuthContext uses this to detect:
 * - existing sessions
 * - login
 * - logout
 * - restored sessions after app restart
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(
    auth,
    callback
  );
}

/**
 * Signs the current Firebase user out.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Returns the currently authenticated Firebase user.
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}