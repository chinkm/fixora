/**
 * Google OAuth client IDs, read from `EXPO_PUBLIC_*` env vars (see
 * .env.example). These come from Google Cloud Console — see README
 * "Manual configuration steps" for how to create them.
 */
export const GOOGLE_OAUTH_CLIENT_IDS = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
};
