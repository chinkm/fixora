/**
 * src/api/firebase/storage.ts
 *
 * Reusable Firebase Storage helpers (v9+ modular SDK) for uploading and
 * deleting files — profile photos, job attachment images, AI Camera
 * captures/uploads (Section 4/5.1), chat attachments (chat_messages
 * .attachment_url in the future Postgres schema, Section 3.2).
 *
 * Per Section 8.1, screens never call the Storage SDK directly — they call
 * these helpers. No image-picking, camera, or compression logic lives here;
 * that belongs to the feature/screen (e.g. `features/seeker/aiCamera`),
 * which should hand this file a local file URI and get back a hosted URL.
 */

import {
  type UploadTaskSnapshot,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a file to Firebase Storage and returns its public download URL.
 *
 * `localUri` is a local file URI as produced by expo-image-picker /
 * expo-camera (e.g. `file:///.../photo.jpg`). React Native's Storage SDK
 * cannot upload a file path directly — it needs a Blob, so this fetches the
 * local URI first (this local `fetch` never touches the network; RN's fetch
 * polyfill treats `file://` URIs specially and reads them from disk).
 *
 * @param storagePath Full path in the bucket, e.g. `jobs/{jobId}/attachment.jpg`
 *                     or `users/{uid}/avatar.jpg`. Callers own the naming
 *                     convention/uniqueness (e.g. including a uuid or the
 *                     job/user id) — this helper does not generate paths.
 * @param localUri     Local file URI to upload.
 */
export async function uploadFile(storagePath: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

/**
 * Same as `uploadFile`, but reports progress via `onProgress` (0–100) —
 * useful for a progress bar on larger uploads (e.g. AI Camera photos).
 * Resolves with the public download URL once the upload completes.
 */
export function uploadFileWithProgress(
  storagePath: string,
  localUri: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(localUri)
      .then((response) => response.blob())
      .then((blob) => {
        const storageRef = ref(storage, storagePath);
        const task = uploadBytesResumable(storageRef, blob);

        task.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(percent);
          },
          (error) => reject(error),
          () => {
            getDownloadURL(task.snapshot.ref).then(resolve).catch(reject);
          },
        );
      })
      .catch(reject);
  });
}

/**
 * Deletes a file from Storage by its path in the bucket (not its download
 * URL). Resolves silently if the file does not exist... actually no —
 * Firebase Storage's deleteObject rejects on a missing file, so callers
 * that want "delete if exists" semantics should catch and check
 * `error.code === 'storage/object-not-found'`.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  await deleteObject(ref(storage, storagePath));
}

/**
 * Resolves the current public download URL for an existing storage path.
 * Useful when you've stored the storagePath (not the URL) and need a fresh
 * signed URL — Firebase's download URLs don't expire by default, but this
 * is here for cases where you re-derive them rather than persisting them.
 */
export async function getFileUrl(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath));
}
