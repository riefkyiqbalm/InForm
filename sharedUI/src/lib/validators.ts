/**
 * Form and input validation utilities
 * Extracted from components: LoginForm, RegisterForm, ChatInput, etc.
 */

/**
 * Validates email format using regex
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password meets minimum requirements
 * @param password - Password to validate
 * @param minLength - Minimum length required (default: 6)
 * @returns True if password meets requirements
 */
export function validatePassword(password: string, minLength: number = 6): boolean {
  return password.length >= minLength;
}

/**
 * Validates that two passwords match
 * @param password - First password
 * @param confirmPassword - Second password to compare
 * @returns True if passwords match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword;
}

/**
 * Validates required field is not empty
 * @param value - Value to check
 * @returns True if value is not empty/null/undefined
 */
export function validateRequired(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/**
 * Checks password strength and returns score (0-4)
 * @param password - Password to check
 * @returns Strength score: 0=weak, 1=fair, 2=good, 3=strong, 4=very strong
 */
export function checkPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

/**
 * Gets password strength level as string
 * @param password - Password to evaluate
 * @returns Strength level: "Weak", "Fair", "Good", "Strong", or "Very Strong"
 */
export function getPasswordStrengthLabel(password: string): string {
  const score = checkPasswordStrength(password);
  const labels = ["Lemah", "Cukup", "Cukup", "Kuat", "Sangat Kuat"];
  return labels[score];
}

/**
 * Gets password strength color for visual feedback
 * @param password - Password to evaluate
 * @returns Color value for strength indicator
 */
export function getPasswordStrengthColor(password: string): string {
  const score = checkPasswordStrength(password);
  const colors = [
    "transparent",
    "#ff4d6d", // red - weak
    "#f5c842", // yellow - fair
    "#00d4c8", // teal - good
    "#3dffa0", // green - very strong
  ];
  return colors[score];
}

/**
 * Validates username format (alphanumeric and underscore, 3-20 chars)
 * @param username - Username to validate
 * @returns True if username meets requirements
 */
export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates phone number (basic format)
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Trims and validates non-empty string
 * @param value - Value to validate
 * @returns Trimmed value if valid, empty string otherwise
 */
export function sanitizeInput(value: string): string {
  return value.trim();
}

/**
 * Validates multiple fields at once
 * @param fields - Object with field names as keys and values to validate
 * @returns Object with validation results for each field
 */
export function validateFormFields(
  fields: Record<string, any>
): Record<string, boolean> {
  const results: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    results[key] = validateRequired(value);
  }
  return results;
}
