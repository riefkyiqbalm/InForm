// features/AuthContext.tsx — Plasmo sidepanel
// Auth API lives on Next.js (NEXTJS_BASE), not Flask.
// Flask handles only AI/chat.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Role, User, AuthContextType } from "~types";

// ── Env vars ──────────────────────────────────────────────────────────────────
const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000";

// ── Storage keys — must match exactly what the website stores ─────────────────
const KEY_TOKEN = "_auth_token";
const KEY_USER  = "_auth_user";

// ── chrome.storage.local helpers ──────────────────────────────────────────────
async function storageSave(token: string, user: User): Promise<void> {
  await chrome.storage.local.set({
    [KEY_TOKEN]: token,
    [KEY_USER]:  JSON.stringify(user),
  });
}

async function storageClear(): Promise<void> {
  await chrome.storage.local.remove([KEY_TOKEN, KEY_USER]);
}

async function storageGetToken(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get(KEY_TOKEN);
    return (result[KEY_TOKEN] as string) || null;
  } catch {
    return null;
  }
}

async function storageGetUser(): Promise<User | null> {
  try {
    const result = await chrome.storage.local.get(KEY_USER);
    const raw = result[KEY_USER] as string | undefined;
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// ── Cookie reader ─────────────────────────────────────────────────────────────
// Reads _auth_token directly from browser cookies via chrome.cookies API.
// This works because the extension has host_permissions for localhost:3000.
// This is the FALLBACK when chrome.storage.local is empty (first open after
// browser restart, or before the website has sent the LOGIN message).
async function cookieGetToken(): Promise<string | null> {
  try {
    const cookie = await chrome.cookies.get({
      url:  NEXTJS_BASE,
      name: KEY_TOKEN,
    });
    return cookie?.value ?? null;
  } catch {
    return null;
  }
}

async function cookieGetUser(): Promise<User | null> {
  try {
    const cookie = await chrome.cookies.get({
      url:  NEXTJS_BASE,
      name: KEY_USER,
    });
    if (!cookie?.value) return null;
    // Cookie value may be URI-encoded
    return JSON.parse(decodeURIComponent(cookie.value)) as User;
  } catch {
    return null;
  }
}

// ── Resolve token from any available source ───────────────────────────────────
// Priority: chrome.storage.local → browser cookie
async function resolveToken(): Promise<{ token: string | null; user: User | null }> {
  // 1. Try chrome.storage.local (set by background.ts on LOGIN message)
  const storedToken = await storageGetToken();
  if (storedToken) {
    const storedUser = await storageGetUser();
    return { token: storedToken, user: storedUser };
  }

  // 2. Fallback: read directly from browser cookie (set by Next.js)
  const cookieToken = await cookieGetToken();
  if (cookieToken) {
    const cookieUser = await cookieGetUser();
    // Sync into chrome.storage.local so next open is faster
    if (cookieUser) {
      await storageSave(cookieToken, cookieUser).catch(() => {});
    } else {
      await chrome.storage.local.set({ [KEY_TOKEN]: cookieToken }).catch(() => {});
    }
    return { token: cookieToken, user: cookieUser };
  }

  return { token: null, user: null };
}

// ── Normalize raw API response → User ─────────────────────────────────────────
function normalizeUser(raw: Record<string, unknown>): User {
  return {
    id:          String(raw.id ?? ""),
    name:        (raw.name        as string) ?? "",
    email:       (raw.email       as string) ?? "",
    image:       (raw.image       as string) ?? "",
    contact:     (raw.contact     as string) ?? "",
    institution: (raw.institution as string) ?? "",
    role:        ((raw.role       as Role)   ?? "USER"),
    createdAt:   (raw.createdAt   as string) ?? new Date().toISOString(),
  };
}

function bearerHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${token}`,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
const defaultAuth: AuthContextType = {
  user:           null,
  isAuthenticated: false,
  loading:        true,
  login:          async () => {},
  register:       async () => {},
  logout:         () => {},
  forgotPassword: async () => {},
  resetPassword:  async () => {},
  changePassword: async () => {},
  changeEmail:    async () => "",
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    storageClear();
  }, []);

  // ── Validate session ──────────────────────────────────────────────────────
  const validateSession = useCallback(async (tokenOverride?: string | null) => {
    // Resolve token — checks chrome.storage.local then browser cookie
    const { token, user: cachedUser } = tokenOverride
      ? { token: tokenOverride, user: await storageGetUser() }
      : await resolveToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Show cached user immediately so UI doesn't flash
    if (cachedUser) setUser(cachedUser);

    try {
      // Auth API is on Next.js, not Flask
      const res = await fetch(`${NEXTJS_BASE}/api/auth/me`, {
        headers: bearerHeaders(token),
      });

      if (!res.ok) {
        // Token invalid or expired
        logout();
        return;
      }

      const dbUser = await res.json() as Record<string, unknown>;
      const fresh  = normalizeUser(dbUser);
      await storageSave(token, fresh);
      setUser(fresh);
    } catch {
      // Network error (backend down) — keep cached user, don't log out
      if (cachedUser) setUser(cachedUser);
      else if (token) {
        // We have a token but no user data — set a minimal authenticated state
        // so the user isn't bounced to NetworkGuard just because Next.js is slow
        setUser({ id: "", name: "", email: "", image: "", contact: "", institution: "", role: "USER", createdAt: "" });
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // ── Listen for messages forwarded by background.ts ────────────────────────
  useEffect(() => {
    const handler = (
      message: { type?: string; token?: string; user?: Record<string, unknown> },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (r: unknown) => void
    ) => {
      if (!message?.type) return false;

      if (message.type === "_AUTH_LOGIN") {
        const { token, user: rawUser } = message;
        if (token && rawUser) {
          const u = normalizeUser(rawUser);
          storageSave(token, u).then(() => {
            setUser(u);
            setLoading(false);
          });
        } else if (token) {
          validateSession(token);
        }
        sendResponse({ ok: true });
        return true;
      }

      if (message.type === "_AUTH_LOGOUT") {
        logout();
        sendResponse({ ok: true });
        return true;
      }

      if (message.type === "_AUTH_REFRESH") {
        validateSession(message.token ?? null);
        sendResponse({ ok: true });
        return true;
      }

      return false;
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [logout, validateSession]);

  // ── Login (sidepanel form — calls Next.js) ────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`${NEXTJS_BASE}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json() as { error?: string; token?: string; user?: Record<string, unknown> };
      if (!res.ok) throw new Error(data.error ?? "Login gagal");

      const u = normalizeUser(data.user!);
      await storageSave(data.token!, u);
      setUser(u);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${NEXTJS_BASE}/api/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Pendaftaran gagal");
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Forgot password ───────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch(`${NEXTJS_BASE}/api/auth/forgot_password`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(data.error ?? "Gagal mengirim email reset");
    }
  }, []);

  // ── Reset password ────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const res = await fetch(`${NEXTJS_BASE}/api/auth/reset_password`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, password: newPassword }),
    });
    const data = await res.json().catch(() => ({})) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Reset kata sandi gagal");
  }, []);

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const token = await storageGetToken();
    if (!token) throw new Error("Tidak terautentikasi");
    const res = await fetch(`${NEXTJS_BASE}/api/auth/change_password`, {
      method:  "POST",
      headers: bearerHeaders(token),
      body:    JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({})) as { error?: string };
    if (!res.ok) throw new Error(data.error ?? "Gagal mengubah kata sandi");
  }, []);

  // ── Change email ──────────────────────────────────────────────────────────
  const changeEmail = useCallback(async (newEmail: string, password: string): Promise<string> => {
    const token = await storageGetToken();
    if (!token) throw new Error("Tidak terautentikasi");
    const res = await fetch(`${NEXTJS_BASE}/api/auth/change_email`, {
      method:  "POST",
      headers: bearerHeaders(token),
      body:    JSON.stringify({ newEmail, password }),
    });
    const data = await res.json().catch(() => ({})) as { error?: string; message?: string };
    if (!res.ok) throw new Error(data.error ?? "Gagal mengubah email");
    return data.message ?? "";
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      changeEmail,
    }),
    [user, loading, login, register, logout, forgotPassword, resetPassword, changePassword, changeEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}