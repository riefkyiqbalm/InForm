/**
 * lib/utils/error.ts
 * API and error handling utilities.
 *
 * FIX: getAuthToken / setAuthToken / clearAuthToken previously used
 * localStorage, which (a) throws in SSR/middleware, (b) is inconsistent with
 * AuthContext which stores the token in a cookie under "bgai_auth_token".
 * Replaced with js-cookie so both sides read the same value.
 */

import Cookies from "js-cookie";

// ── Cookie key — must match AuthContext.tsx ───────────────────────────────────
const AUTH_TOKEN_KEY = "_auth_token";

const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 7,
  path: "/",
  sameSite: "Lax",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type ErrorType = "validation" | "auth" | "network" | "server" | "unknown";

export interface ApiError {
  type: ErrorType;
  message: string;
  code?: string;
  status?: number;
}

// ── Error parsing ─────────────────────────────────────────────────────────────

export function parseErrorMessage(
  error: unknown,
  defaultMessage = "An error occurred"
): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    if ("message" in error) return String((error as Record<string, unknown>).message);
    if ("error"   in error) return String((error as Record<string, unknown>).error);
  }
  return defaultMessage;
}

export function getErrorType(error: unknown): ErrorType {
  if (error instanceof Error) {
    const m = error.message;
    if (m.includes("401") || m.includes("Unauthorized")) return "auth";
    if (m.includes("validation") || m.includes("required")) return "validation";
    if (m.includes("Network") || m.includes("fetch"))      return "network";
    if (m.includes("5"))                                   return "server";
  }
  return "unknown";
}

export function getErrorTypeByStatus(status: number): ErrorType {
  if (status === 401 || status === 403) return "auth";
  if (status >= 400 && status < 500)   return "validation";
  if (status >= 500)                   return "server";
  return "unknown";
}

export function getErrorMessageByStatus(status: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Unauthorized. Please log in again.",
    403: "Access denied. You don't have permission.",
    404: "Resource not found.",
    409: "Conflict. This resource may already exist.",
    422: "Invalid data. Please check your input.",
    429: "Too many requests. Please try again later.",
    500: "Server error. Please try again later.",
    502: "Bad gateway. Please try again later.",
    503: "Service unavailable. Please try again later.",
    504: "Gateway timeout. Please try again later.",
  };
  return messages[status] ?? "An error occurred. Please try again.";
}

export async function handleAPIError(response: Response): Promise<ApiError> {
  const status = response.status;
  try {
    const data = await response.json();
    return {
      type:    getErrorTypeByStatus(status),
      message: data.message ?? data.error ?? getErrorMessageByStatus(status),
      code:    data.code,
      status,
    };
  } catch {
    return { type: getErrorTypeByStatus(status), message: getErrorMessageByStatus(status), status };
  }
}

export function formatErrorForLogging(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}\n${error.stack ?? ""}`;
  return JSON.stringify(error);
}

export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, formatErrorForLogging(error));
  }
}

// ── Auth token helpers (cookie-based) ─────────────────────────────────────────
// These read/write the same cookie that AuthContext uses so every part of the
// app sees the same token regardless of which helper it calls.

/** Read the auth token from the cookie. Returns null if absent or in SSR. */
export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null; // SSR guard
  return Cookies.get(AUTH_TOKEN_KEY) ?? null;
}

/** Write the auth token cookie (7 days, path=/, SameSite=Lax). */
export function setAuthToken(token: string): void {
  Cookies.set(AUTH_TOKEN_KEY, token, COOKIE_OPTS);
}

/** Delete the auth token cookie. */
export function clearAuthToken(): void {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
}

// ── Authenticated fetch ───────────────────────────────────────────────────────

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const err = await handleAPIError(response);
      throw new Error(err.message);
    }
    return response;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Network request failed");
  }
}