// shared-ui/src/context/ChatContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ChatSession, InterruptedMessage, SendMessageArgs, ChatContextType, ChatMessage } from "../types";
import Cookies from "js-cookie";
import { useAuth } from "./SharedAuthContext";

const KEY_TOKEN = "_auth_token";
// Determine environment
const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome.storage;
const NEXTJS_BASE = process.env.NEXT_PUBLIC_NEXTJS_BASE ?? (process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000");

// --- Token Retrieval (Polyfill for Web vs Extension) ---

async function getToken(): Promise<string | null> {
  if (IS_EXTENSION) {
    try {
      const result = await chrome.storage.local.get(KEY_TOKEN);
      return result[KEY_TOKEN] as string || null;
    } catch (err) {
      console.error("[ChatContext] Error reading token:", err);
      return null;
    }
  } else {
    // WEBSITE: Ambil token dari cookie '_auth_token'
    const token = Cookies.get("_auth_token"); 
    
    if (!token) {
      console.warn("[ChatContext] No token found in cookies.");
    }
    return token || null;
  }
}

function authHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

const SESSIONS = `${NEXTJS_BASE}/api/chat/sessions`;
const sessionUrl = (id: string) => `${NEXTJS_BASE}/api/chat/sessions/${id}`;
const messagesUrl = (id: string) => `${NEXTJS_BASE}/api/chat/sessions/${id}/messages`;

export interface ExtendedChatContextType extends ChatContextType {
  createSession: () => Promise<string>;
}

const ChatContext = createContext<ExtendedChatContextType | undefined>(undefined);

function sortSessions(list: ChatSession[]): ChatSession[] {
  const pinned = list.filter((s) => s.pinnedAt).sort((a, b) => new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime());
  const unpinned = list.filter((s) => !s.pinnedAt).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return [...pinned, ...unpinned];
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortedMessage, setAbortedMessage] = useState<InterruptedMessage | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearAborted = useCallback(() => setAbortedMessage(null), []);
  const {user, isAuthenticated} = useAuth();

  // ── Load sessions on mount ─────────────────────────────────────────────────
  useEffect(() => {
    /**
     * GUARD CLAUSE:
     * Jika user tidak terautentikasi, kita langsung berhenti dan mengosongkan sesi.
     * Ini mencegah request 401 Unauthorized ke terminal Next.js saat logout.
     */
    if (!isAuthenticated || !user) {
      setSessions([]);
      return;
    }

    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        // Pemanggilan API tanpa placeholder { ... }
        const response = await fetch("/api/chat/sessions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        } else if (response.status === 401) {
          // Jika ternyata token tidak valid, kosongkan sesi secara diam-diam
          setSessions([]);
        }
      } catch (error) {
        console.error("Gagal mengambil sesi chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [isAuthenticated, user]);

  // ── loadSession ────────────────────────────────────────────────────────────
  const loadSession = useCallback(async (id: string) => {
    const token = await getToken();
    try {
      const res = await fetch(sessionUrl(id), { headers: authHeaders(token) });
      if (res.ok) {
        const data = await res.json() as { session: ChatSession };
        setSessions((prev) => sortSessions(prev.map((s) => (s.id === id ? data.session : s))));
      }
    } catch (err) {
      console.error("[ChatContext] loadSession:", err);
    }
  }, []);

  useEffect(() => {
    if (activeSessionId) loadSession(activeSessionId);
  }, [activeSessionId, loadSession]);

  // ── createSession ──────────────────────────────────────────────────────────
  const createSession = useCallback(async (): Promise<string> => {
    const token = await getToken();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(SESSIONS, {
        method: "POST",
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json() as { session: ChatSession };
      const newSession = data.session;
      
      setSessions((prev) => sortSessions([newSession, ...prev]));
      setActiveSessionId(newSession.id);
      return newSession.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat sesi");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── deleteSession ──────────────────────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId: string) => {
    const token = await getToken();
    const res = await fetch(sessionUrl(sessionId), { method: "DELETE", headers: authHeaders(token) });
    if (!res.ok) throw new Error("Gagal menghapus sesi");
    
    const body = await res.json() as { nextSessionId: string | null };
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setActiveSessionId(body.nextSessionId ?? "");
  }, []);

  // ── renameSession ──────────────────────────────────────────────────────────
  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) throw new Error("Judul kosong");
    const token = await getToken();
    
    // Optimistic update
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed } : s)));
    
    const res = await fetch(sessionUrl(sessionId), {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ title: trimmed }),
    });
    
    if (!res.ok) {
      // Revert on error
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: sessions.find(x=>x.id===sessionId)?.title || trimmed } : s)));
      throw new Error("Gagal rename");
    }
  }, [sessions]);

  // ── pinSession ─────────────────────────────────────────────────────────────
  const pinSession = useCallback(async (sessionId: string) => {
    const token = await getToken();
    const current = sessions.find((s) => s.id === sessionId);
    if (!current) return;
    
    const newPinnedAt = current.pinnedAt ? null : new Date().toISOString();
    setSessions((prev) => sortSessions(prev.map((s) => (s.id === sessionId ? { ...s, pinnedAt: newPinnedAt } : s))));
    
    const res = await fetch(sessionUrl(sessionId), {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ action: current.pinnedAt ? "unpin" : "pin" }),
    });
    
    if (!res.ok) throw new Error("Gagal pin");
  }, [sessions]);

  const setActiveSession = useCallback((sessionId: string) => {
    if (sessions.some((s) => s.id === sessionId)) setActiveSessionId(sessionId);
  }, [sessions]);

  // ── addMessage ─────────────────────────────────────────────────────────────
  const addMessage = useCallback((sessionId: string, payload: Omit<ChatMessage, "id" | "createdAt">) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const msg: ChatMessage = { ...payload, id: `${sessionId}_${Date.now()}`, createdAt: new Date().toISOString() };
        return { ...session, updatedAt: new Date().toISOString(), messages: [...(session.messages ?? []), msg] };
      })
    );
  }, []);

  // ── sendMessage ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async ({ text, signal, sessionId, attachments }: SendMessageArgs) => {
    const targetSession = sessionId ?? activeSessionId;
    if (!targetSession) return;

    const hasAttachments = attachments && attachments.length > 0;
    if (!text.trim() && !hasAttachments) return;

    const token = await getToken();
    setLoadingSessionId(targetSession);

    let displayText = text;
    if (hasAttachments) {
      const fileNames = attachments.map((f: any) => f.name).join(", ");
      displayText = text.trim() ? `${text}\n\n📎 ${fileNames}` : `📎 ${fileNames}`;
    }

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      text: displayText,
      sessionId: targetSession,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) =>
      prev.map((s) => s.id === targetSession ? { ...s, messages: [...(s.messages ?? []), tempMsg] } : s)
    );

    try {
      const body: any = { message: text };
      if (hasAttachments) body.attachments = attachments;

      const res = await fetch(messagesUrl(targetSession), {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(body),
        signal,
      });

      if (!res.ok) throw new Error("Gagal kirim pesan");
      
      const data = await res.json() as { aborted?: boolean; originalText?: string };
      if (data.aborted) {
        setAbortedMessage({ text: data.originalText ?? text, sessionId: targetSession });
        return;
      }
      await loadSession(targetSession);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setAbortedMessage({ text, sessionId: targetSession });
        return;
      }
      setError("Gagal mengirim pesan.");
      await loadSession(targetSession);
    } finally {
      setLoadingSessionId(null);
    }
  }, [activeSessionId, loadSession]);

  const retryMessage = useCallback(async (text: string) => {
    if (!abortedMessage) return;
    setAbortedMessage(null);
    await sendMessage({ text, sessionId: abortedMessage.sessionId });
  }, [abortedMessage, sendMessage]);

  const activeSession = useMemo(() => sessions.find((s) => s.id === activeSessionId) ?? null, [sessions, activeSessionId]);

  const value: ExtendedChatContextType = {
    sessions, activeSessionId, activeSession, loadingSessionId, isLoading, error, abortedMessage,
    createSession, setActiveSession, loadSession, addMessage, sendMessage, deleteSession, 
    renameSession, pinSession, clearError, clearAborted, retryMessage, setLoadingSessionId
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within <ChatProvider>");
  return ctx;
}