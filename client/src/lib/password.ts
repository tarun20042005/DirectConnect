/**
 * Validate password strength requirements
 * Must contain: uppercase, lowercase, special character, and be at least 8 characters
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
  hasMinLength: boolean;
} {
  return {
    isValid:
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
      password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasMinLength: password.length >= 8,
  };
}

/**
 * Get password strength error message
 */
export function getPasswordError(password: string): string {
  const validation = validatePasswordStrength(password);

  if (!validation.hasMinLength) {
    return "Password must be at least 8 characters";
  }
  if (!validation.hasUppercase) {
    return "Password must contain at least one uppercase letter (A-Z)";
  }
  if (!validation.hasLowercase) {
    return "Password must contain at least one lowercase letter (a-z)";
  }
  if (!validation.hasSpecialChar) {
    return "Password must contain at least one special character (!@#$%^&*)";
  }

  return "";
}
