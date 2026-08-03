/**
 * src/api/firebase/firestore.ts
 *
 * Reusable, generic Firestore helpers (v9+ modular SDK).
 *
 * Per Section 8.1 of the system design doc: "All Firestore reads/writes go
 * through a thin wrapper in src/api/firebase/ — screens never call
 * firestore() directly." These helpers are intentionally generic (typed by
 * the caller via <T>) rather than hardcoded per-collection (e.g. no
 * `getJob()` / `getUser()` here) — domain-specific functions belong in each
 * feature module (e.g. `features/seeker/jobRequest/api.ts` calling
 * `getDocument<Job>('jobs', jobId)`), keeping this file reusable across all
 * collections listed in Section 4 (users, providerProfiles, jobs, chats,
 * reviews, ai_usage, notifications).
 *
 * No business/domain logic lives here — no quota checks, no role checks,
 * no aggregation. Just CRUD + subscription primitives.
 */

import {
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from './firebase';

/**
 * Fetches a single document by collection path + id.
 * Returns null if it does not exist (never throws for a missing doc).
 */
export async function getDocument<T = DocumentData>(
  collectionPath: string,
  docId: string,
): Promise<T | null> {
  const snapshot = await getDoc(doc(firestore, collectionPath, docId));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
}

/**
 * Creates or overwrites a document at a known id.
 * Use `merge: true` to patch specific fields without clobbering the rest
 * of the document (maps to Firestore's `setDoc(..., { merge: true })`).
 */
export async function setDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  docId: string,
  data: T,
  options: { merge?: boolean } = {},
): Promise<void> {
  await setDoc(doc(firestore, collectionPath, docId), data, { merge: options.merge ?? false });
}

/**
 * Creates a new document with an auto-generated id (e.g. a new job or
 * notification). Returns the generated id.
 */
export async function addDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  data: T,
): Promise<string> {
  const ref = await addDoc(collection(firestore, collectionPath), data);
  return ref.id;
}

/**
 * Partially updates an existing document. Throws if the document does not
 * exist (this is Firestore's default `updateDoc` behavior) — callers that
 * want create-or-update semantics should use `setDocument` with
 * `merge: true` instead.
 */
export async function updateDocument<T extends Record<string, unknown>>(
  collectionPath: string,
  docId: string,
  data: Partial<T>,
): Promise<void> {
  await updateDoc(doc(firestore, collectionPath, docId), data as DocumentData);
}

/**
 * Deletes a document by collection path + id.
 */
export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  await deleteDoc(doc(firestore, collectionPath, docId));
}

/**
 * One-time query against a collection with arbitrary Firestore query
 * constraints (where/orderBy/limit — pass them in from `firebase/firestore`
 * at the call site, e.g. `queryCollection<Job>('jobs', [where('seekerId', '==', uid)])`).
 */
export async function queryCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const snapshot = await getDocs(query(collection(firestore, collectionPath), ...constraints));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

/**
 * Real-time subscription to a single document (e.g. a job's status, or a
 * chat thread's lastMessage). Returns an unsubscribe function — callers
 * MUST call it on unmount to avoid leaking listeners.
 */
export function subscribeToDocument<T = DocumentData>(
  collectionPath: string,
  docId: string,
  callback: (data: T | null) => void,
): Unsubscribe {
  return onSnapshot(doc(firestore, collectionPath, docId), (snapshot) => {
    callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null);
  });
}

/**
 * Real-time subscription to a query (e.g. a job's chat messages ordered by
 * sentAt, or a seeker's list of jobs). Returns an unsubscribe function —
 * callers MUST call it on unmount.
 */
export function subscribeToCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
): Unsubscribe {
  return onSnapshot(query(collection(firestore, collectionPath), ...constraints), (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
  });
}
