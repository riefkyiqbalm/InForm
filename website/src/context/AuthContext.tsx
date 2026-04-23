"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import type { AuthContextType, Role, User } from "@/types";

// ── InForm Extension bridge ───────────────────────────────────────────────────
// The extension ID from chrome://extensions (load unpacked build first).
// In production replace with the published store ID.
const EXTENSION_ID = process.env.NEXT_PUBLIC_INFORM_EXTENSION_ID ?? "";

function notifyExtension(type: "_AUTH_LOGIN" | "_AUTH_LOGOUT", payload?: object) {
  // Guard 1: must be in a browser with the chrome extension API
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return;

  // Guard 2: EXTENSION_ID must look like a real Chrome extension ID (32 a-p chars)
  if (!EXTENSION_ID || !/^[a-p]{32}$/.test(EXTENSION_ID)) {
    console.debug("[InForm] Extension ID not set or invalid — skipping notify");
    return;
  }

  try {
    chrome.runtime.sendMessage(EXTENSION_ID, { type, ...payload }, () => {
      void chrome.runtime.lastError; // swallow "extension not installed" errors
    });
  } catch {
    // sendMessage can throw synchronously if the ID format is wrong — safe to ignore
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_USER_KEY  = "_auth_user";
const AUTH_TOKEN_KEY = "_auth_token";

const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires:  7,
  path:     "/",
  sameSite: "Lax",
  // secure: true  ← uncomment for HTTPS
};

// ── Cookie helpers ────────────────────────────────────────────────────────────
function saveAuthCookies(token: string, user: User) {
  Cookies.set(AUTH_TOKEN_KEY, token,                COOKIE_OPTS);
  Cookies.set(AUTH_USER_KEY,  JSON.stringify(user), COOKIE_OPTS);
}

function clearAuthCookies() {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  Cookies.remove(AUTH_USER_KEY,  { path: "/" });
}

function parseUserCookie(): User | null {
  try {
    const raw = Cookies.get(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function getToken(): string | undefined {
  return Cookies.get(AUTH_TOKEN_KEY);
}

function bearerHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Context defaults ──────────────────────────────────────────────────────────
const defaultAuth: AuthContextType = {
  user:            null,
  isAuthenticated: false,
  loading:         true,
  login:           async () => {},
  register:        async () => {},
  logout:          () => {},
  forgotPassword:  async () => {},
  resetPassword:   async () => {},
  changePassword:  async () => {},
  changeEmail:     async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(() => parseUserCookie());
  const [loading, setLoading] = useState(true);
  const router                = useRouter();
  

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    clearAuthCookies();
    notifyExtension("_AUTH_LOGOUT"); // ← tell extension: user logged out
    router.push("/login");
    // setIsAuthenticated(false);
  }, [router]);
  

  // ── Validate session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const validate = async () => {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) { logout(); return; }

        const dbUser = await res.json();
        const fresh: User = {
          id:          dbUser.id.toString(),
          name:        dbUser.name        ?? "",
          email:       dbUser.email,
          image:       dbUser.image       ?? "",
          contact:     dbUser.contact     ?? "",
          institution: dbUser.institution ?? "",
          role:        dbUser.role as Role,
          createdAt:   dbUser.createdAt,
        };

        Cookies.set(AUTH_USER_KEY, JSON.stringify(fresh), COOKIE_OPTS);
        setUser(fresh);
      } catch (err) {
        console.error("[AuthContext] validate error:", err);
        // Network error — keep cached user, don't redirect
      } finally {
        setLoading(false);
      }
    };

    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");

      const userData: User = {
        id:          data.user.id.toString(),
        name:        data.user.name        ?? "",
        email:       data.user.email,
        image:       data.user.image       ?? "",
        contact:     data.user.contact     ?? "",
        institution: data.user.institution ?? "",
        role:        data.user.role as Role,
        createdAt:   data.user.createdAt,
      };

      saveAuthCookies(data.token, userData);
      setUser(userData);
      notifyExtension("_AUTH_LOGIN", { token: data.token, user: userData }); // ← tell extension: user logged in
      router.push(`/chat/${userData.id}`);
    } catch (err) {
      console.error("[AuthContext] login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email, password, name }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Pendaftaran gagal");
        }

        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } catch (err) {
        console.error("[AuthContext] register error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // ── Forgot password ───────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/forgot_password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Gagal mengirim email reset");
    }
  }, []);

  // ── Reset password ────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const res = await fetch("/api/auth/reset_password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ token, password: newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Reset kata sandi gagal");

    router.push("/login?success=password_reset");
  }, [router]);

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const res = await fetch("/api/auth/change_password", {
        method: "POST", headers: bearerHeaders(),
        body:   JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal mengubah kata sandi");
    },
    []
  );

  // ── Change email ──────────────────────────────────────────────────────────
  const changeEmail = useCallback(async (newEmail: string, password: string) => {
    const res = await fetch("/api/auth/change_email", {
      method: "POST", headers: bearerHeaders(),
      body:   JSON.stringify({ newEmail, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Gagal mengubah email");
    router.push(`/verify-email?email=${encodeURIComponent(newEmail)}`);
    return data.message as string;
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user, loading, isAuthenticated: !!user,
      login, register, logout,
      forgotPassword, resetPassword, changePassword, changeEmail,
    }),
    [user, loading, login, register, logout,
     forgotPassword, resetPassword, changePassword, changeEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}