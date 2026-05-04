import { passwordStrengthColors } from "./tokens";

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string, minLength = 6): boolean {
  return password.length >= minLength;
}

export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function validateRequired(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function checkPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export function getPasswordStrengthLabel(password: string): string {
  const labels = ["Lemah", "Cukup", "Cukup", "Kuat", "Sangat Kuat"];
  return labels[checkPasswordStrength(password)];
}

export function getPasswordStrengthColor(password: string): string {
  return passwordStrengthColors[checkPasswordStrength(password)];
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export function validateURL(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function validatePhone(phone: string): boolean {
  return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
}

export function sanitizeInput(value: string): string {
  return value.trim();
}

export function validateFormFields(
  fields: Record<string, unknown>
): Record<string, boolean> {
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, validateRequired(v as string)])
  );
}
