import { useCallback, useEffect, useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { signInWithGoogleIdToken, toFriendlyAuthErrorMessage } from '../../../api/firebase/auth';

interface GoogleClientIds {
  iosClientId?: string;
  androidClientId?: string;
  webClientId: string;
}

export function useGoogleSignIn(clientIds: GoogleClientIds) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: clientIds.webClientId,
      iosClientId: clientIds.iosClientId,
    });
  }, [clientIds.webClientId, clientIds.iosClientId]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setIsSigningIn(true);

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        setError('Google sign-in did not return an ID token. Please try again.');
        return;
      }

      await signInWithGoogleIdToken(idToken);
    } catch (err) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.IN_PROGRESS) {
          setError('Google sign-in is already in progress.');
          return;
        }

        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setError('Google Play Services is not available on this device.');
          return;
        }
      }

      setError(toFriendlyAuthErrorMessage(err));
    } finally {
      setIsSigningIn(false);
    }
  }, [clientIds.webClientId, clientIds.iosClientId]);

  return {
    signInWithGoogle,
    isReady: true,
    isSigningIn,
    error,
  };
}
