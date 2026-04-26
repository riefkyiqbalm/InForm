// features/AuthContext.tsx — Plasmo sidepanel
// Auth API lives on Next.js (NEXTJS_BASE), not Flask.
// This context ONLY listens to storage/cookies and messages. 
// It does NOT perform login directly (that happens in the website tab).

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Role, User, AuthContextType } from "@sharedUI/types";

// ── Env vars ──────────────────────────────────────────────────────────────────
const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000";

// ── Storage keys ──────────────────────────────────────────────────────────────
const KEY_TOKEN = "_auth_token";
const KEY_USER  = "_auth_user";

// ── chrome.storage.local helpers (Type-Safe) ─────────────────────────────────
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
    // FIX: Explicitly check existence and cast to string
    const token = result[KEY_TOKEN];
    return (typeof token === 'string' && token.length > 0) ? token : null;
  } catch {
    return null;
  }
}

async function storageGetUser(): Promise<User | null> {
  try {
    const result = await chrome.storage.local.get(KEY_USER);
    // FIX: Explicitly check existence and cast
    const raw = result[KEY_USER];
    if (typeof raw !== 'string' || !raw) return null;
    
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// ── Cookie reader ─────────────────────────────────────────────────────────────
async function cookieGetToken(): Promise<string | null> {
  try {
    const cookie = await chrome.cookies.get({
      url:  NEXTJS_BASE,
      name: KEY_TOKEN,
    });
    // FIX: Optional chaining and null coalescing
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
    try {
      return JSON.parse(decodeURIComponent(cookie.value)) as User;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

// ── Resolve token ───────────────────────────────────────────────────────────
async function resolveToken(): Promise<{ token: string | null; user: User | null }> {
  // 1. Try chrome.storage.local
  const storedToken = await storageGetToken();
  if (storedToken) {
    const storedUser = await storageGetUser();
    return { token: storedToken, user: storedUser };
  }

  // 2. Fallback: browser cookie
  const cookieToken = await cookieGetToken();
  if (cookieToken) {
    const cookieUser = await cookieGetUser();
    if (cookieUser) {
      await storageSave(cookieToken, cookieUser).catch(() => {});
    } else {
      await chrome.storage.local.set({ [KEY_TOKEN]: cookieToken }).catch(() => {});
    }
    return { token: cookieToken, user: cookieUser };
  }

  return { token: null, user: null };
}

// ── Normalize User ───────────────────────────────────────────────────────────
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
  signInWithOIDC: async () => {},
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
    // Optional: Clear cookies if extension has permission
    chrome.cookies.remove({ url: NEXTJS_BASE, name: KEY_TOKEN }).catch(() => {});
    chrome.cookies.remove({ url: NEXTJS_BASE, name: KEY_USER }).catch(() => {});
  }, []);

  // ── OIDC Sign In (Opens Website Tab) ──────────────────────────────────────
  const signInWithOIDC = useCallback(async () => {
    // Just open the website login page. 
    // The background script or cookie listener will handle the rest.
    await chrome.tabs.create({ url: `${NEXTJS_BASE}/login` });
  }, []);

  // ── Validate Session ──────────────────────────────────────────────────────
  const validateSession = useCallback(async (tokenOverride?: string | null) => {
    let token: string | null = null;
    let cachedUser: User | null = null;

    if (tokenOverride) {
      token = tokenOverride;
      cachedUser = await storageGetUser();
    } else {
      const resolved = await resolveToken();
      token = resolved.token;
      cachedUser = resolved.user;
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (cachedUser) setUser(cachedUser);

    try {
      const res = await fetch(`${NEXTJS_BASE}/api/auth/me`, {
        headers: bearerHeaders(token),
      });

      if (!res.ok) {
        logout();
        return;
      }

      const dbUser = await res.json() as Record<string, unknown>;
      const fresh  = normalizeUser(dbUser);
      await storageSave(token, fresh);
      setUser(fresh);
    } catch (err) {
      console.warn("[AuthContext] Network error, keeping cached user", err);
      if (!cachedUser) {
        // Minimal fallback if we have token but no user data
        setUser({ 
          id: "", name: "", email: "", image: "", 
          contact: "", institution: "", role: "USER", createdAt: "" 
        });
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // ── On Mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // ── Listen for Messages from Background ───────────────────────────────────
  useEffect(() => {
    const handler = (
      message: { type?: string; token?: string; user?: Record<string, unknown> },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (r: unknown) => void
    ) => {
      if (!message?.type) return false;

      if (message.type === "_AUTH_LOGIN") {
        const { token, user: rawUser } = message;
        if (token && typeof token === 'string') {
          if (rawUser && typeof rawUser === 'object') {
            const u = normalizeUser(rawUser);
            storageSave(token, u).then(() => {
              setUser(u);
              setLoading(false);
            });
          } else {
            validateSession(token);
          }
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
        const t = message.token;
        validateSession(typeof t === 'string' ? t : null);
        sendResponse({ ok: true });
        return true;
      }

      return false;
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [logout, validateSession]);

  // ── Dummy Functions (Handled by Website) ──────────────────────────────────
  // These are present to satisfy the interface but don't perform actions here
  const login = useCallback(async (_email: string, _password: string) => {
    throw new Error("Login must be performed on the website.");
  }, []);

  const register = useCallback(async (_email: string, _password: string, _name: string) => {
    throw new Error("Registration must be performed on the website.");
  }, []);

  const forgotPassword = useCallback(async (_email: string) => {
    throw new Error("Password reset must be performed on the website.");
  }, []);

  const resetPassword = useCallback(async (_token: string, _newPassword: string) => {
    throw new Error("Password reset must be performed on the website.");
  }, []);

  const changePassword = useCallback(async (_current: string, _newPass: string) => {
    throw new Error("Profile changes must be performed on the website.");
  }, []);

  const changeEmail = useCallback(async (_newEmail: string, _password: string) => {
    throw new Error("Email changes must be performed on the website.");
    return "";
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
      signInWithOIDC,
    }),
    [user, loading, login, register, logout, forgotPassword, resetPassword, changePassword, changeEmail, signInWithOIDC]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}