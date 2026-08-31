import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState, useCallback } from 'react';

import { signInWithGoogleIdToken, toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';

// Required once per app so the OAuth browser session closes/redirects correctly.
WebBrowser.maybeCompleteAuthSession();

interface GoogleClientIds {
  iosClientId?: string;
  androidClientId?: string;
  webClientId: string; // required — used for Expo Go / dev-client "proxy" flow
}

/**
 * Google Sign-In via expo-auth-session.
 *
 * We deliberately do NOT use `@react-native-google-signin/google-signin`
 * here: that library wraps native Android/iOS SDKs and requires a custom
 * EAS dev-client build — it cannot run inside Expo Go. `expo-auth-session`
 * uses a browser-based OAuth flow instead, which works in Expo Go.
 *
 * You must supply OAuth client IDs from Google Cloud Console — see the
 * "Manual configuration steps" section in the project README.
 */
export function useGoogleSignIn(clientIds: GoogleClientIds) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: clientIds.iosClientId,
    androidClientId: clientIds.androidClientId,
    webClientId: clientIds.webClientId,
  });

  useEffect(() => {
    async function handleResponse() {
      if (response?.type !== 'success') return;
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        setError('Google sign-in did not return an ID token. Please try again.');
        return;
      }
      setIsSigningIn(true);
      setError(null);
      try {
        await signInWithGoogleIdToken(idToken);
      } catch (err) {
        setError(toFriendlyAuthErrorMessage(err));
      } finally {
        setIsSigningIn(false);
      }
    }
    handleResponse();
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    await promptAsync();
  }, [promptAsync]);

  return {
    signInWithGoogle,
    isReady: !!request,
    isSigningIn,
    error,
  };
}
