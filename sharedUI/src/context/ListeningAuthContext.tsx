"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Role, User, AuthContextType } from "@sharedUI/types";
import Cookies from "js-cookie";

/**
 * ── PERBAIKAN IMPOR ──
 * Pastikan file SharedAuthContext.tsx sudah ada di folder yang sama 
 * atau gunakan alias @sharedUI jika sudah terkonfigurasi di tsconfig.
 */
import { SharedAuthContext } from "@sharedUI/context/SharedAuthContext";

const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000";
const KEY_TOKEN = "_auth_token";
const KEY_USER  = "_auth_user";
const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome.storage;

// Helpers untuk menyimpan data ke storage ekstensi
async function storageSave(token: string, user: User): Promise<void> {
  if (IS_EXTENSION) {
    await chrome.storage.local.set({ [KEY_TOKEN]: token, [KEY_USER]: JSON.stringify(user) });
  }
}

async function storageClear(): Promise<void> {
  if (IS_EXTENSION) {
    await chrome.storage.local.remove([KEY_TOKEN, KEY_USER]);
  } else {
    Cookies.remove(KEY_TOKEN);
    Cookies.remove(KEY_USER); 
  }
}

async function storageGetToken(): Promise<string | null> {
  if (IS_EXTENSION) {
    try {
      const result = await chrome.storage.local.get(KEY_TOKEN);
      return result[KEY_TOKEN] as string || null;
    } catch { return null; }
  }
  return Cookies.get(KEY_TOKEN) || null;
}

async function storageGetUser(): Promise<User | null> {
  if (IS_EXTENSION) {
    try {
      const result = await chrome.storage.local.get(KEY_USER);
      const raw = result[KEY_USER];
      if (typeof raw !== 'string' || !raw) return null;
      return JSON.parse(raw) as User;
    } catch { return null; }
  }
  return null;
}

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

export function ListeningAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    storageClear().catch(console.warn);
    
    if (typeof chrome !== "undefined" && chrome.cookies) {
      chrome.cookies.remove({ url: NEXTJS_BASE, name: KEY_TOKEN }).catch(() => {});
      chrome.cookies.remove({ url: NEXTJS_BASE, name: KEY_USER }).catch(() => {});
    }
  }, []);

  const validateSession = useCallback(async (tokenOverride?: string | null) => {
    const token = tokenOverride || await storageGetToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${NEXTJS_BASE}/api/auth/me`, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      if (!res.ok) {
        logout();
        return;
      }

      const dbUser = await res.json() as Record<string, unknown>;
      const fresh = normalizeUser(dbUser);
      await storageSave(token, fresh);
      setUser(fresh);
    } catch (err) {
      console.error("Session validation failed", err);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Listener untuk pesan dari Website (AuthProvider)
  useEffect(() => {
    if (!IS_EXTENSION) return;

    const handler = (message: any, _sender: any, sendResponse: any) => {
      if (message.type === "_AUTH_LOGIN") {
        validateSession(message.token);
        sendResponse({ ok: true });
      } else if (message.type === "_AUTH_LOGOUT") {
        logout();
        sendResponse({ ok: true });
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, [logout, validateSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login: async () => { window.open(`${NEXTJS_BASE}/login`, '_blank') },
      register: async () => { window.open(`${NEXTJS_BASE}/register`, '_blank') },
      logout,
      forgotPassword: async () => {},
      resetPassword: async () => {},
      changePassword: async () => {},
      changeEmail: async () => "",
      signInWithOIDC: async () => { window.open(`${NEXTJS_BASE}/login`, '_blank') },
    }),
    [user, loading, logout]
  );

  return (
    <SharedAuthContext.Provider value={value}>
      {children}
    </SharedAuthContext.Provider>
  );
}