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
import type { AuthContextType, Role, User } from "@sharedUI/types";
import { signIn, signOut } from "next-auth/react"; // 

const EXTENSION_ID = process.env.NEXT_PUBLIC_InForm_EXTENSION_ID ?? "";

function notifyExtension(type: "_AUTH_LOGIN" | "_AUTH_LOGOUT", payload?: object) {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return;
  if (!EXTENSION_ID || !/^[a-p]{32}$/.test(EXTENSION_ID)) return;
  try {
    chrome.runtime.sendMessage(EXTENSION_ID, { type, ...payload }, () => {
      void chrome.runtime.lastError;
    });
  } catch { /* Ignore */ }
}

const AUTH_USER_KEY  = "_auth_user";
const AUTH_TOKEN_KEY = "_auth_token";

const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 7,
  path: "/",
  sameSite: "Lax",
};

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

const defaultAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  changePassword: async () => {},
  changeEmail: async () => "",
  signInWithOIDC: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuth);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => parseUserCookie());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

const logout = useCallback(async () => {
  setUser(null);
  clearAuthCookies();
  notifyExtension("_AUTH_LOGOUT");
  
  // 1. Sign out from NextAuth (clears the internal session)
  // redirect: false prevents a hard reload, letting us control navigation
  await signOut({ redirect: false }); 
  
  // 2. Navigate to login
  router.push("/login");
}, [router]);

  // ── Validate session (Cookie Fallback) ──────────────────────────────────
  useEffect(() => {
    const validate = async () => {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          logout();
          return;
        }

        const dbUser = await res.json();
        const fresh: User = {
          id: dbUser.id.toString(),
          name: dbUser.name ?? "",
          email: dbUser.email,
          image: dbUser.image ?? "",
          contact: dbUser.contact ?? "",
          institution: dbUser.institution ?? "",
          role: dbUser.role as Role,
          createdAt: dbUser.createdAt,
        };

        saveAuthCookies(token, fresh);
        setUser(fresh);
      } catch (err) {
        console.error("[AuthContext] validate error:", err);
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [logout]);

  // ── Sync Function (Called by SessionSync component) ─────────────────────
  const syncNextAuthSession = useCallback((session: any) => {
    if (session?.user && session.accessToken) {
      const syncedUser: User = {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? "",
        contact: (session.user as any).contact ?? "",
        institution: (session.user as any).institution ?? "",
        role: ((session.user as any).role as Role) || "USER",
        createdAt: new Date().toISOString(),
      };

      saveAuthCookies(session.accessToken, syncedUser);
      setUser(syncedUser);
      notifyExtension("_AUTH_LOGIN", { token: session.accessToken, user: syncedUser });
      setLoading(false);
    } else if (!session) {
      // If NextAuth says no session, but we have a cookie, keep cookie for now 
      // (let the validate effect handle expiration)
      if (!getToken()) {
        setUser(null);
        setLoading(false);
      }
    }
  }, []);

  // Expose sync function via a custom event or context if needed, 
  // but here we will attach it to the window temporarily for the helper component
  // OR better: We create a sub-component pattern in providers.tsx
  
  // For this pattern, we attach the setter to a ref or context accessible by SessionSync
  // But simpler: We just expose a method in the Context Value that SessionSync can call?
  // No, SessionSync is outside the provider in the proposed fix. 
  // Let's use a specialized hook approach inside the Provider.
  
  // Actually, the cleanest way without circular deps is to pass the sync logic 
  // via a Render Prop or a dedicated internal component. 
  // See providers.tsx for the implementation of <SessionSync />

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");

      const userData: User = {
        id: data.user.id.toString(),
        name: data.user.name ?? "",
        email: data.user.email,
        image: data.user.image ?? "",
        contact: data.user.contact ?? "",
        institution: data.user.institution ?? "",
        role: data.user.role as Role,
        createdAt: data.user.createdAt,
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

  const register = useCallback(async (email: string, password: string, name: string) => {
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
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("[AuthContext] register error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/forgot_password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Gagal mengirim email reset");
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const res = await fetch("/api/auth/reset_password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Reset kata sandi gagal");
    router.push("/login?success=password_reset");
  }, [router]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const res = await fetch("/api/auth/change_password", {
      method: "POST", headers: bearerHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Gagal mengubah kata sandi");
  }, []);

  const changeEmail = useCallback(async (newEmail: string, password: string): Promise<string> => {
    const res = await fetch("/api/auth/change_email", {
      method: "POST", headers: bearerHeaders(),
      body: JSON.stringify({ newEmail, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Gagal mengubah email");
    router.push(`/verify-email?email=${encodeURIComponent(newEmail)}`);
    return data.message ?? "";
  }, [router]);

const signInWithOIDC = useCallback(async () => {
  setLoading(true);
  try {
    // This triggers the NextAuth flow for the 'google' provider
    await signIn("google", { 
      callbackUrl: "/chat" // Redirect here after successful login
    });
  } catch (error) {
    console.error("[AuthContext] Google Sign In error:", error);
    setLoading(false);
    throw error;
  }
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
      // Internal sync method exposed for the SessionSync component
      _syncSession: syncNextAuthSession as any, 
    }),
    [user, loading, login, register, logout, forgotPassword, resetPassword, changePassword, changeEmail, signInWithOIDC, syncNextAuthSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Add _syncSession to the type definition temporarily or cast it
interface ExtendedAuthContextType extends AuthContextType {
  _syncSession?: (session: any) => void;
}

export function useAuth() {
  const ctx = useContext(AuthContext) as ExtendedAuthContextType;
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}