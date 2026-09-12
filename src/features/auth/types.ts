import type { UserRole } from '../../types/user';

/**
 * Params for every screen in AuthNavigator's stack (shown while signed out).
 * RoleSelectionScreen is NOT part of this stack — RootNavigator renders it
 * directly once a user is authenticated but has no role yet (new
 * Phone/Google sign-ins), since it needs no navigation params.
 */
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  PhoneSignIn: undefined;
  PhoneOtpVerify: { verificationId: string; phoneNumber: string };
};

/** Generic shape for a field-level validation error map used by auth forms. */
export type FormErrors<T extends string> = Partial<Record<T, string>>;

export interface SignUpFormFields {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | null;
}
