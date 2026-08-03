/**
 * src/api/firebase/functions.ts
 *
 * Client-side wrappers for callable Firebase Cloud Functions.
 *
 * Per Section 1.2 / 8.1 of the system design doc, the two AI features
 * (AI Camera, Text-to-Profile) are NEVER called directly from the client to
 * a third-party AI provider. The client calls a Cloud Function instead:
 *
 *   App → Cloud Function (callable) → checks/increments ai_usage quota
 *        → calls AI provider (Vision API / LLM) → returns result → App
 *
 * This keeps API keys off the client and makes quota enforcement
 * unbypassable (Section 4 design note).
 *
 * IMPORTANT — these are placeholders only:
 *   - The functions below correctly wire up `httpsCallable` (real,
 *     working plumbing), so feature code can start integrating against a
 *     stable typed interface now.
 *   - BUT the corresponding server-side implementations in
 *     /functions/src/aiCamera.ts, /functions/src/textToProfile.ts, and
 *     /functions/src/usageQuota.ts are still empty stubs (Milestone 1) —
 *     calling these today will fail with a Cloud Functions "not found"
 *     error until that server-side logic is implemented in a later
 *     milestone. No AI/vision/LLM logic is implemented here or on the
 *     server yet.
 *   - Request/response shapes below are placeholders and are very likely
 *     to change once the real Cloud Function implementations are written.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// --- AI Camera (seeker feature, Section 5.1) --------------------------------

export interface AiCameraRequest {
  /** Download URL of the already-uploaded image (see storage.ts uploadFile). */
  imageUrl: string;
}

export interface AiCameraResponse {
  /** Placeholder shape — real response will likely include suggested
   * provider categories, confidence scores, etc. Not implemented yet. */
  suggestion: unknown;
}

/**
 * Placeholder wrapper for the `aiCameraSuggest` callable function.
 * Server-side logic (Vision API call + quota check) is not implemented yet.
 */
export async function requestAiCameraSuggestion(
  payload: AiCameraRequest,
): Promise<AiCameraResponse> {
  const callable = httpsCallable<AiCameraRequest, AiCameraResponse>(functions, 'aiCameraSuggest');
  const result = await callable(payload);
  return result.data;
}

// --- Text-to-Profile (provider feature, Section 5.2) ------------------------

export interface TextToProfileRequest {
  /** Raw spoken/typed "About Us" draft text from the provider. */
  rawText: string;
}

export interface TextToProfileResponse {
  /** Placeholder shape — real response will be the LLM-polished profile
   * text. Not implemented yet. */
  polishedText: string;
}

/**
 * Placeholder wrapper for the `textToProfile` callable function.
 * Server-side logic (LLM call + quota check) is not implemented yet.
 */
export async function requestTextToProfilePolish(
  payload: TextToProfileRequest,
): Promise<TextToProfileResponse> {
  const callable = httpsCallable<TextToProfileRequest, TextToProfileResponse>(
    functions,
    'textToProfile',
  );
  const result = await callable(payload);
  return result.data;
}

// --- AI Usage Quota ----------------------------------------------------------
// Per Section 4's design note, quota is checked/incremented server-side
// INSIDE the aiCameraSuggest/textToProfile functions above (as part of the
// same call, inside a Firestore transaction) — not as a separate callable
// the client invokes beforehand. No standalone "checkQuota" wrapper is
// exposed here to avoid implying a client-side check exists; the cached
// usage count shown in the UI (Section 6.1, AIUsageContext) should instead
// come from reading the `ai_usage` document via firestore.ts, kept in sync
// by usageQuota.ts's server-side logic (not yet implemented).
