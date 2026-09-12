import type { User as FirebaseUser } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

import * as authApi from '../../api/firebase/auth';
import * as firestoreApi from '../../api/firebase/firestore';
import type { UserRole, AuthProviderType } from '../../types/user';

interface AuthContextValue {
  /** The raw Firebase user object, or null if signed out. */
  user: FirebaseUser | null;
  /** The role stored in Firestore (`users/{uid}.role`), or null until known. */
  role: UserRole | null;
  /** True while the initial session check or any auth request is in flight. */
  isLoading: boolean;
  /** True once the initial `onAuthStateChanged` bootstrap has resolved. */
  isInitialized: boolean;
  isAuthenticated: boolean;
  /**
   * True when the user is signed in but has no role document yet — happens
   * for brand-new Google/Phone sign-ins, which route to RoleSelection.
   */
  needsRoleSelection: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** Used by Phone/Google flows after Firebase auth succeeds but before a role exists. */
  completeRoleSelection: (role: UserRole) => Promise<void>;
  /** Used after any out-of-band auth (phone/google) so Context picks up the new user + role. */
  refreshSession: () => Promise<void>;
  
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Bootstrap: subscribe to Firebase's persisted session on mount.
  useEffect(() => {
    const unsubscribe = authApi.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const fetchedRole = await firestoreApi.getUserRole(firebaseUser.uid).catch(() => null);
        setRole(fetchedRole);
      } else {
        setRole(null);
      }
      setIsInitialized(true);
    });
    return unsubscribe;
  }, []);

  
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const firebaseUser = await authApi.signInWithEmail(email, password);
      const fetchedRole = await firestoreApi.getUserRole(firebaseUser.uid);
      setUser(firebaseUser);
      setRole(fetchedRole);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, selectedRole: UserRole) => {
    setIsLoading(true);
    try {
      const firebaseUser = await authApi.signUpWithEmail(email, password);
      await firestoreApi.createUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        phone: firebaseUser.phoneNumber,
        displayName: firebaseUser.displayName,
        role: selectedRole,
        authProvider: 'email',
        photoURL: firebaseUser.photoURL,
      });
      setUser(firebaseUser);
      setRole(selectedRole);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.signOut();
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(email);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeRoleSelection = useCallback(
    async (selectedRole: UserRole) => {
      if (!user) throw new Error('No authenticated user to assign a role to.');
      setIsLoading(true);
      try {
        const inferredProvider: AuthProviderType = user.phoneNumber ? 'phone' : 'google';
        await firestoreApi.createUserProfile({
          uid: user.uid,
          email: user.email,
          phone: user.phoneNumber,
          displayName: user.displayName,
          role: selectedRole,
          authProvider: inferredProvider,
          photoURL: user.photoURL,
        });
        setRole(selectedRole);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const refreshSession = useCallback(async () => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const fetchedRole = await firestoreApi.getUserRole(currentUser.uid).catch(() => null);
      setRole(fetchedRole);
    } else {
      setRole(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isLoading,
      isInitialized,
      isAuthenticated: !!user,
      needsRoleSelection: !!user && role === null,
      signIn,
      signUp,
      signOut,
      resetPassword,
      completeRoleSelection,
      refreshSession,
    }),
    [
      user,
      role,
      isLoading,
      isInitialized,
      signIn,
      signUp,
      signOut,
      resetPassword,
      completeRoleSelection,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Internal hook — prefer importing `useAuth` from `src/hooks/useAuth.ts`. */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}
