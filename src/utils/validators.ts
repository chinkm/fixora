/**
 * Lightweight, dependency-free form validators.
 * Kept generic (not auth-only) since other feature modules will reuse these.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// E.164 format: + followed by 8-15 digits (covers Malaysia +60... and most locales).
const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function isValidPhoneNumber(phone: string): boolean {
  return E164_PHONE_REGEX.test(phone.trim());
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/** Returns a user-friendly message for an empty/invalid email field, or null if valid. */
export function validateEmailField(email: string): string | null {
  if (!isRequired(email)) return 'Email is required.';
  if (!isValidEmail(email)) return 'Enter a valid email address.';
  return null;
}

/** Returns a user-friendly message for an invalid password field, or null if valid. */
export function validatePasswordField(password: string): string | null {
  if (!isRequired(password)) return 'Password is required.';
  if (!isValidPassword(password)) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

/** Returns a user-friendly message if the confirmation doesn't match, or null if valid. */
export function validateConfirmPasswordField(
  password: string,
  confirmPassword: string
): string | null {
  if (!isRequired(confirmPassword)) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}

/** Returns a user-friendly message for an invalid phone field, or null if valid. */
export function validatePhoneField(phone: string): string | null {
  if (!isRequired(phone)) return 'Phone number is required.';
  if (!isValidPhoneNumber(phone)) {
    return 'Enter a valid phone number in international format, e.g. +60123456789.';
  }
  return null;
}

/** Returns a user-friendly message for an invalid OTP code field, or null if valid. */
export function validateOtpField(code: string): string | null {
  if (!isRequired(code)) return 'Enter the code we sent you.';
  if (!/^\d{6}$/.test(code.trim())) return 'Enter the 6-digit code.';
  return null;
}
