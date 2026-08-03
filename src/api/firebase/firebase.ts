/**
 * src/api/firebase/firebase.ts
 *
 * Central Firebase bootstrap file.
 *
 * Responsibilities (and ONLY these):
 *   1. Read Firebase project config from Expo environment variables.
 *   2. Initialize the Firebase App exactly once (safe against Fast Refresh /
 *      re-imports, which would otherwise throw "app already exists").
 *   3. Initialize and export the individual service instances (auth,
 *      firestore, storage, functions) that every other file in
 *      src/api/firebase/ depends on.
 *
 * This file must NOT contain any business logic (no sign-in calls, no
 * queries, no uploads). That logic lives in auth.ts / firestore.ts /
 * storage.ts / functions.ts, which all import their service instance from
 * here. This keeps a single initialization path — per Section 8.1 of the
 * system design doc, screens/features must never touch the Firebase SDK
 * directly, and every other file in this folder must never re-initialize
 * the app or a service on their own.
 */

import {
  type FirebaseApp,
  type FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';
import { type Auth, initializeAuth } from 'firebase/auth';
// @ts-expect-error — known upstream firebase-js-sdk issue, not a bug in this file:
// `getReactNativePersistence` genuinely exists and works at runtime (Metro resolves
// the package's "react-native" export condition correctly), but the "firebase"
// wrapper package's TypeScript declarations don't expose a react-native-specific
// type for the `firebase/auth` subpath the way the underlying `@firebase/auth`
// package does — so `tsc` can't see it even though the JS is really there.
// Tracked upstream: https://github.com/firebase/firebase-js-sdk/issues/9316
// (still open as of the most recent activity I could find). Re-check this once
// you upgrade `firebase` — if it's been fixed, remove the ts-expect-error and this
// comment; if this ever stops being merely a type-only issue, address it then.
import { getReactNativePersistence } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';
import { type Functions, getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 1. Configuration -------------------------------------------------
// All values are read from EXPO_PUBLIC_* environment variables so nothing
// sensitive is hardcoded in source. Expo's CLI inlines EXPO_PUBLIC_* values
// from your local .env file (see .env.example) into the JS bundle at build
// time. None of these values are secret in the traditional sense (they are
// visible in any compiled client bundle), but they still belong in env vars
// so per-environment (dev/staging/prod) Firebase projects can be swapped
// without touching code.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// --- 2. App (singleton) -------------------------------------------------
// getApps().length check guards against re-initializing on Fast Refresh
// or if this module is somehow imported twice.
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// --- 3. Auth -------------------------------------------------------------
// React Native has no browser `window`/`localStorage`, so the web SDK's
// default in-memory/browser persistence won't survive an app restart.
// `initializeAuth` + `getReactNativePersistence(AsyncStorage)` is the
// documented way to persist the auth session across app restarts on RN.
//
// NOTE (flagging this honestly): `getReactNativePersistence` is exported
// from firebase/auth's React Native build via a package.json "react-native"
// export condition. Metro (React Native's bundler) has resolved package.json
// "exports" fields by default since Metro 0.82 / React Native 0.79 — which
// this project's installed React Native 0.86 is well past — so this import
// should resolve correctly out of the box. Expo's own SDK 53 changelog did
// call out @firebase/* packages as having had some rough edges with this
// newer resolution behavior, so if you hit a Metro bundling error on this
// import, the documented escape hatch is setting
// `config.resolver.unstable_enablePackageExports = false` in metro.config.js
// — test this on a real device/simulator before relying on it in production.
//
// `initializeAuth` also throws if called more than once on the same app, so
// this module being the *only* place Auth is initialized (never re-imported
// via a different path) matters.
export const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// --- 4. Firestore ---------------------------------------------------------
export const firestore: Firestore = getFirestore(app);

// --- 5. Storage ------------------------------------------------------------
export const storage: FirebaseStorage = getStorage(app);

// --- 6. Functions ----------------------------------------------------------
// No region is pinned here, which defaults to "us-central1". If your Cloud
// Functions (see /functions) are deployed to a different region, pass it
// explicitly: getFunctions(app, 'asia-southeast1').
export const functions: Functions = getFunctions(app);
