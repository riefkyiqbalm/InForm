"use client";
import React, { createContext, useCallback, useEffect, useMemo, useState, useContext } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import type { AuthContextType, Role, User } from "@sharedUI/types";
import { signIn, signOut, useSession } from "next-auth/react";

/**
 * PENTING: 
 * SharedAuthContext harus berada di folder yang bisa diakses oleh
 * website maupun extension (shared-ui).
 */
import { SharedAuthContext } from "@sharedUI/context/SharedAuthContext";

const EXTENSION_ID = process.env.NEXT_PUBLIC_InForm_EXTENSION_ID ?? "";

// Mengirim pesan ke ekstensi saat status login berubah
function notifyExtension(type: "_AUTH_LOGIN" | "_AUTH_LOGOUT", payload?: object) {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return;
  if (!EXTENSION_ID || !/^[a-p]{32}$/.test(EXTENSION_ID)) return;
  try {
    chrome.runtime.sendMessage(EXTENSION_ID, { type, ...payload }, () => {
      void chrome.runtime.lastError;
    });
  } catch { /* Gagal kirim pesan bisa diabaikan */ }
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
   // Hook ke NextAuth session untuk mendeteksi login Google OIDC
  const { data: session } = useSession();

  // Sinkronisasi session dari NextAuth (Google Login, dsb)
  useEffect(() => {
    if (session?.user && (session as any).accessToken) {
      const syncedUser: User = {
        id: (session.user as any).id ?? session.user.email ?? "",
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? "",
        contact: (session.user as any).contact ?? "",
        institution: (session.user as any).institution ?? "",
        role: ((session.user as any).role as Role) || "USER",
        createdAt: new Date().toISOString(),
      };

      const token = (session as any).accessToken;
      saveAuthCookies(token, syncedUser);
      setUser(syncedUser);
      notifyExtension("_AUTH_LOGIN", { token, user: syncedUser });
      setLoading(false);
    } else if (!session && !getToken()) {
      setUser(null);
      setLoading(false);
    }
  }, [session]);
  const router = useRouter();

  // Fungsi Logout untuk Website
const logout = useCallback(async () => {
  setUser(null);
  clearAuthCookies();
  
  // 1. Hapus user state
  setUser(null);
  
  // 2. Hapus cookie buatan sendiri
  Cookies.remove("_auth_token", { path: "/" });
  Cookies.remove("_auth_user", { path: "/" });

  // 3. Hapus cookie bawaan Next-Auth (Opsional)
  // Nama cookie bisa berbeda jika menggunakan HTTPS (__Host-next-auth.csrf-token)
  const isSecure = window.location.protocol === 'https:';
  const prefix = isSecure ? '__Host-' : '';
  
  Cookies.remove(`${prefix}next-auth.csrf-token`, { path: "/" });
  Cookies.remove(`${prefix}next-auth.callback-url`, { path: "/" });

  // 4. Jalankan signOut resmi
  await signOut({ 
    redirect: true, 
    callbackUrl: "/login" 
  });
}, [router]);

  // Validasi session saat aplikasi dimuat
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

  // Sinkronisasi session dari NextAuth (Google Login, dsb)
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
      if (!getToken()) {
        setUser(null);
        setLoading(false);
      }
    }
  }, []);

  // Login manual (Email/Password)
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

  // Registrasi user baru
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

  // Login via Google (OIDC)
  const signInWithOIDC = useCallback(async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
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
      forgotPassword: async () => {}, // Implementasi sesuai kebutuhan website
      resetPassword: async () => {},
      changePassword: async () => {},
      changeEmail: async () => "",
      signInWithOIDC,
      _syncSession: syncNextAuthSession as any, 
    }),
    [user, loading, login, register, logout, signInWithOIDC, syncNextAuthSession]
  );

  // Menggunakan SharedAuthContext.Provider agar bisa diakses oleh sharedUI
  return <SharedAuthContext.Provider value={value as any}>{children}</SharedAuthContext.Provider>;
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