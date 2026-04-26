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
import { signIn, signOut as nextAuthSignOut, useSession, SessionProvider } from "next-auth/react";
import type { AuthContextType, Role, User } from "@sharedUI/types";

// ── InForm Extension bridge ───────────────────────────────────────────────────
const EXTENSION_ID = process.env.NEXT_PUBLIC_INFORM_EXTENSION_ID ?? "";

function notifyExtension(type: "_AUTH_LOGIN" | "_AUTH_LOGOUT", payload?: object) {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return;
  if (!EXTENSION_ID || !/^[a-p]{32}$/.test(EXTENSION_ID)) {
    console.debug("[InForm] Extension ID not set or invalid — skipping notify");
    return;
  }
  try {
    chrome.runtime.sendMessage(EXTENSION_ID, { type, ...payload }, () => {
      void chrome.runtime.lastError;
    });
  } catch {
    // Ignore
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_USER_KEY  = "_auth_user";
const AUTH_TOKEN_KEY = "_auth_token";

const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires:  7,
  path:     "/",
  sameSite: "Lax",
};

// ── Cookie helpers ────────────────────────────────────────────────────────────
function saveAuthCookies(token: string, user: User) {
  Cookies.set(AUTH_TOKEN_KEY, token, COOKIE_OPTS);
  Cookies.set(AUTH_USER_KEY, JSON.stringify(user), COOKIE_OPTS);
}

function clearAuthCookies() {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  Cookies.remove(AUTH_USER_KEY, { path: "/" });
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
  signInWithOIDC:  async () => {}, // Added OIDC method
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

// ── Internal Provider Component ──────────────────────────────────────────────
function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(() => parseUserCookie());
  const [loading, setLoading] = useState(true);
  const router                = useRouter();
  
  // Hook into NextAuth session
  const { data: session, status: sessionStatus } = useSession();

  // ── Sync NextAuth Session to Custom Cookies ───────────────────────────────
  useEffect(() => {
    if (sessionStatus === "authenticated" && session) {
      // Extract data from NextAuth session
      // We assume your NextAuth callback puts the backend JWT in session.accessToken
      const token = session.accessToken as string; 
      
      if (token && !getToken()) { // Only sync if we don't already have a token
        const userData: User = {
          id:          session.user?.id || "",
          name:        session.user?.name || "",
          email:       session.user?.email || "",
          image:       session.user?.image || "",
          contact:     "", // Map from session if available
          institution: "", // Map from session if available
          role:        "USER" as Role, // Default or map from session
          createdAt:   new Date().toISOString(),
        };

        saveAuthCookies(token, userData);
        setUser(userData);
        notifyExtension("_AUTH_LOGIN", { token, user: userData });
        
        // Optional: Redirect after successful OIDC login if needed
        // router.push(`/chat/${userData.id}`); 
      }
    } else if (sessionStatus === "unauthenticated") {
      // If NextAuth says logged out, ensure local state is clean
      if (user) {
        setUser(null);
        clearAuthCookies();
        notifyExtension("_AUTH_LOGOUT");
      }
    }
    
    if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  // ── Validate existing cookie session on mount (if no NextAuth session) ────
  useEffect(() => {
    if (sessionStatus === "authenticated") return; // Skip if NextAuth handled it

    const validate = async () => {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (!token) { 
        if (sessionStatus !== "loading") setLoading(false); 
        return; 
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) { 
          // Token invalid, force logout
          clearAuthCookies();
          setUser(null);
          notifyExtension("_AUTH_LOGOUT");
          if (sessionStatus !== "loading") setLoading(false);
          return; 
        }

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
      } finally {
        if (sessionStatus !== "loading") setLoading(false);
      }
    };

    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    clearAuthCookies();
    notifyExtension("_AUTH_LOGOUT");
    if (session) await nextAuthSignOut({ redirect: false });
    router.push("/login");
  }, [router, session]);

  // ── Login (Credentials) ───────────────────────────────────────────────────
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
      notifyExtension("_AUTH_LOGIN", { token: data.token, user: userData });
      router.push(`/chat/${userData.id}`);
    } catch (err) {
      console.error("[AuthContext] login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ── SignIn with OIDC ──────────────────────────────────────────────────────
const signInWithOIDC = useCallback(async () => {
  setLoading(true);
  try {
    await signIn("google", { callbackUrl: "/chat" });
  } catch (error) {
    console.error("[AuthContext] Google Sign In error:", error);
    setLoading(false);
    throw error;
  }
}, []);

const signOut = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Clear local state and cookies immediately
      setUser(null);
      clearAuthCookies();
      notifyExtension("_AUTH_LOGOUT");

      // 2. Call NextAuth signOut to clear the server session
      // redirect: false prevents a full page reload, keeping it smooth
      await nextAuthSignOut({ redirect: false });
      
      // 3. Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("[AuthContext] Sign Out error:", error);
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Pendaftaran gagal");
      }

      // Optional: Auto-login after register or redirect to verify email
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
      signInWithOIDC,
    }),
    [user, loading, login, register, logout,
     forgotPassword, resetPassword, changePassword, changeEmail, signInWithOIDC]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Main Exported Provider (Wraps with NextAuth SessionProvider) ────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </SessionProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}