import type { ApplicationVerifier } from 'firebase/auth';
import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { firebaseConfig } from '../../../api/firebase/config';

/**
 * IMPORTANT CONTEXT:
 * `expo-firebase-recaptcha` (the package that used to solve this) was
 * removed by Expo as of SDK 48 — see
 * https://github.com/expo/expo-firebase-recaptcha (archived/deprecated).
 * Expo's current official recommendation for phone auth is
 * `@react-native-firebase/auth`, but that requires custom native code and
 * therefore a custom EAS dev-client build — it will NOT run in Expo Go.
 *
 * Since this project must stay on the Firebase JS (modular) SDK and run in
 * Expo Go (per current requirements), this component re-implements the same
 * approach `expo-firebase-recaptcha` used: an invisible Google reCAPTCHA is
 * solved inside a hidden WebView running the Firebase *compat* SDK (loaded
 * from CDN, isolated from our RN JS bundle), and the resulting token is
 * relayed back over `postMessage`. That token satisfies the
 * `ApplicationVerifier` interface Firebase's `signInWithPhoneNumber` expects.
 *
 * This needs to be verified against a real device/Firebase project before
 * shipping — WebView-based reCAPTCHA flows are fiddly and Google may change
 * behavior. Treat this as a working starting point, not a guarantee.
 */

export interface PhoneRecaptchaVerifierHandle extends ApplicationVerifier {
  type: 'recaptcha';
}

function buildHtml(config: typeof firebaseConfig): string {
  return `
<!DOCTYPE html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin:0;padding:0;">
    <div id="recaptcha-container"></div>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
    <script>
      const firebaseConfig = ${JSON.stringify(config)};
      firebase.initializeApp(firebaseConfig);

      let verifier = null;

      function post(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }

      function runVerification() {
        try {
          verifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            size: 'invisible',
            callback: function (token) {
              post({ type: 'success', token: token });
            },
            'expired-callback': function () {
              post({ type: 'error', error: 'reCAPTCHA expired. Please try again.' });
            },
          });
          verifier
            .verify()
            .then(function (token) {
              post({ type: 'success', token: token });
            })
            .catch(function (err) {
              post({ type: 'error', error: err && err.message ? err.message : String(err) });
            });
        } catch (err) {
          post({ type: 'error', error: err && err.message ? err.message : String(err) });
        }
      }

      document.addEventListener('message', function (event) {
        if (event.data === 'verify') runVerification();
      });
      window.addEventListener('message', function (event) {
        if (event.data === 'verify') runVerification();
      });
    </script>
  </body>
</html>`;
}

/**
 * Renders a (visually hidden) WebView and exposes `verify()` on its ref,
 * matching Firebase's `ApplicationVerifier` interface so it can be passed
 * straight into `startPhoneSignIn(phoneNumber, verifierRef.current)`.
 */
export const PhoneRecaptchaVerifier = forwardRef<PhoneRecaptchaVerifierHandle>((_props, ref) => {
  const webviewRef = useRef<WebView>(null);
  const pendingRef = useRef<{
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  } | null>(null);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (!pendingRef.current) return;
      if (data.type === 'success') {
        pendingRef.current.resolve(data.token);
      } else {
        pendingRef.current.reject(new Error(data.error ?? 'reCAPTCHA verification failed.'));
      }
      pendingRef.current = null;
    } catch {
      pendingRef.current?.reject(new Error('Unexpected reCAPTCHA response.'));
      pendingRef.current = null;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      type: 'recaptcha' as const,
      verify: () =>
        new Promise<string>((resolve, reject) => {
          pendingRef.current = { resolve, reject };
          webviewRef.current?.postMessage('verify');
        }),
    }),
    []
  );

  return (
    <View style={styles.hidden} pointerEvents="none">
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: buildHtml(firebaseConfig) }}
        onMessage={handleMessage}
        javaScriptEnabled
      />
    </View>
  );
});

PhoneRecaptchaVerifier.displayName = 'PhoneRecaptchaVerifier';

const styles = StyleSheet.create({
  // Kept mounted (1x1) rather than unmounted so the reCAPTCHA script survives
  // across verify() calls; a fully hidden webview can be throttled by iOS.
  hidden: { width: 1, height: 1, opacity: 0 },
});
