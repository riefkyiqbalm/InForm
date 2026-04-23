"use client";
// context/ChatContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import type { ChatContextType, ChatMessage, ChatSession } from "@/types";
import type { InterruptedMessage } from "@/components/chats/interruptedNotif";

export interface SendMessageArgs {
  text:       string;
  signal?:    AbortSignal;
  sessionId?: string;
}

// ── Cookie helpers ─────────────────────────────────────────────────────────────
function getAuthToken(): string | undefined {
  return Cookies.get("_auth_token");
}
function getUserId(): string | null {
  try {
    const raw = Cookies.get("_auth_user");
    if (!raw) return null;
    return (JSON.parse(raw) as { id?: string }).id ?? null;
  } catch {
    return null;
  }
}
function authHeaders(token?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── URL builders ──────────────────────────────────────────────────────────────
const SESSIONS    = "/api/chat/sessions";
const sessionUrl  = (id: string) => `${SESSIONS}/${id}`;
const messagesUrl = (id: string) => `${SESSIONS}/${id}/messages`;

// ── Context type (extend your existing ChatContextType in @/types) ────────────
interface ExtendedChatContextType extends ChatContextType {
  /** Set when the last sendMessage was aborted by the user */
  abortedMessage:    InterruptedMessage | null;
  /** Clear the aborted-message banner */
  clearAborted:      () => void;
  /** Re-send the aborted message (called by the Retry button) */
  retryMessage:      (text: string) => Promise<void>;
}

const ChatContext = createContext<ExtendedChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions,        setSessions]        = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [loadingSessionId,setLoadingSessionId]= useState<string | null>(null);
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  // ── NEW: tracks the last interrupted message so the UI can offer retry ─────
  const [abortedMessage, setAbortedMessage] = useState<InterruptedMessage | null>(null);

  const router     = useRouter();
  const clearError = useCallback(() => setError(null), []);
  const clearAborted = useCallback(() => setAbortedMessage(null), []);

  // ── Load sessions on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchSessions = async () => {
      const token = getAuthToken();
      if (!token) {setSessions([]); return};
      try {
        const res = await fetch(SESSIONS, { headers: authHeaders(token) });
        if (res.ok) {
          const data   = await res.json();
          const sorted = sortSessions(data.sessions ?? []);
          setSessions(sorted);
          if (sorted.length > 0) setActiveSessionId(sorted[0].id);
        }
      } catch (err) {
        console.error("[ChatContext] fetchSessions:", err);
      }
    };
    fetchSessions();
  }, []);

  // ── loadSession ───────────────────────────────────────────────────────────
  const loadSession = useCallback(async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(sessionUrl(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions((prev) =>
          sortSessions(prev.map((s) => (s.id === id ? data.session : s)))
        );
      }
    } catch (err) {
      console.error("[ChatContext] loadSession:", err);
    }
  }, []);

  useEffect(() => {
    if (activeSessionId) loadSession(activeSessionId);
  }, [activeSessionId, loadSession]);

  // ── createSession ─────────────────────────────────────────────────────────
  const createSession = useCallback(async (): Promise<string> => {
    const token = getAuthToken();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(SESSIONS, {
        method:  "POST",
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data       = await res.json();
      const newSession = data.session as ChatSession;
      
      setSessions((prev) => sortSessions([newSession, ...prev]));
      setActiveSessionId(newSession.id);
      router.push(`/chat/${newSession.id}`);
      
      // FIX: Return the ID so it matches the ExtendedChatContextType signature
      return newSession.id; 
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membuat sesi";
      setError(msg);
      throw err; // TypeScript knows thrown errors are valid in a Promise
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  // ── deleteSession ─────────────────────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId: string) => {
    const token = getAuthToken();
    const res   = await fetch(sessionUrl(sessionId), {
      method:  "DELETE",
      headers: authHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Gagal menghapus sesi (${res.status})`);
    }
    const { nextSessionId } = (await res.json()) as {
      success:       boolean;
      nextSessionId: string | null;
    };
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (nextSessionId) {
      setActiveSessionId(nextSessionId);
      router.push(`/chat/${nextSessionId}`);
    } else {
      const userId = getUserId();
      setActiveSessionId("");
      router.push(userId ? `/chat/${userId}` : "/chat");
    }
  }, [router]);

  // ── renameSession ─────────────────────────────────────────────────────────
  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    const trimmed  = newTitle.trim();
    if (!trimmed) throw new Error("Judul tidak boleh kosong");
    const token    = getAuthToken();
    const original = sessions.find((s) => s.id === sessionId)?.title ?? trimmed;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed } : s))
    );
    const res = await fetch(sessionUrl(sessionId), {
      method:  "PATCH",
      headers: authHeaders(token),
      body:    JSON.stringify({ title: trimmed }),
    });
    if (!res.ok) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: original } : s))
      );
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Gagal mengganti nama sesi");
    }
    const data = (await res.json()) as { session: { id: string; title: string } };
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: data.session.title } : s))
    );
  }, [sessions]);

  // ── pinSession ────────────────────────────────────────────────────────────
  const pinSession = useCallback(async (sessionId: string) => {
    const token   = getAuthToken();
    const current = sessions.find((s) => s.id === sessionId);
    if (!current) return;
    const isPinned    = Boolean(current.pinnedAt);
    const newPinnedAt = isPinned ? null : new Date().toISOString();
    setSessions((prev) =>
      sortSessions(
        prev.map((s) => (s.id === sessionId ? { ...s, pinnedAt: newPinnedAt } : s))
      )
    );
    const res = await fetch(sessionUrl(sessionId), {
      method:  "PATCH",
      headers: authHeaders(token),
      body:    JSON.stringify({ action: isPinned ? "unpin" : "pin" }),
    });
    if (!res.ok) {
      setSessions((prev) =>
        sortSessions(
          prev.map((s) => (s.id === sessionId ? { ...s, pinnedAt: current.pinnedAt } : s))
        )
      );
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Gagal mengubah pin sesi");
    }
    const data = (await res.json()) as {
      session: { id: string; pinnedAt: string | null };
    };
    setSessions((prev) =>
      sortSessions(
        prev.map((s) =>
          s.id === sessionId ? { ...s, pinnedAt: data.session.pinnedAt } : s
        )
      )
    );
  }, [sessions]);

  // ── setActiveSession ──────────────────────────────────────────────────────
  const setActiveSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      if (prev.some((s) => s.id === sessionId)) setActiveSessionId(sessionId);
      return prev;
    });
  }, []);

  // ── addMessage (optimistic) ───────────────────────────────────────────────
  const addMessage = useCallback(
    (sessionId: string, payload: Omit<ChatMessage, "id" | "createdAt">) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          const msg: ChatMessage = {
            ...payload,
            id:        `${sessionId}_${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          return {
            ...session,
            updatedAt: new Date().toISOString(),
            messages:  [...(session.messages ?? []), msg],
          };
        })
      );
    },
    []
  );

  // ── sendMessage ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async ({ text, signal, sessionId }: SendMessageArgs) => {
      const targetSession = sessionId ?? activeSessionId;
      if (!targetSession || !text.trim()) return;

      const token = getAuthToken();
      setLoadingSessionId(targetSession);

      // ── Optimistic: show user message instantly ──────────────────────────
      const tempId  = `temp-${Date.now()}`;
      const tempMsg: ChatMessage = {
        id:        tempId,
        role:      "USER",
        text,
        sessionId: targetSession,
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSession
            ? { ...s, messages: [...(s.messages ?? []), tempMsg] }
            : s
        )
      );

      try {
        const res = await fetch(messagesUrl(targetSession), {
          method:  "POST",
          headers: authHeaders(token),
          body:    JSON.stringify({ message: text }),
          signal,
        });

        if (!res.ok) {
          // Reload to remove the temp message
          await loadSession(targetSession);
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error ?? "Gagal mengirim pesan");
        }

        const data = await res.json();

        // ── ABORT: route.ts rolled back the user message in Prisma ──────────
        // We receive { aborted: true, originalText } with status 200
        if (data.aborted) {
          // Remove the optimistic temp message from UI
          await loadSession(targetSession);

          // Store the interrupted message so the banner can be shown
          setAbortedMessage({
            text:      data.originalText ?? text,
            sessionId: targetSession,
          });
          return; // caller (handleStop) already set loading to null
        }

        // ── SUCCESS: replace temp message with real DB messages ──────────────
        await loadSession(targetSession);
        // Successful send also clears any stale interrupted banner
        setAbortedMessage(null);

      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Client-side abort fired before the route responded.
          // The route will roll back Prisma on its own.
          await loadSession(targetSession);
          setAbortedMessage({ text, sessionId: targetSession });
          return;
        }
        setError("Gagal mengirim pesan.");
        await loadSession(targetSession);
      } finally {
        setLoadingSessionId(null);
      }
    },
    [activeSessionId, loadSession]
  );

  // ── retryMessage ─────────────────────────────────────────────────────────
  // Called by InterruptedNotif's Retry button.
  // Creates a fresh AbortController (no signal — user chose to retry),
  // clears the interrupted banner, then re-sends via sendMessage.
  const retryMessage = useCallback(
    async (text: string) => {
      if (!abortedMessage) return;
      // Clear the banner first so the UI responds immediately
      setAbortedMessage(null);
      // Re-send — no abort signal so the user can stop it again if needed
      await sendMessage({ text, sessionId: abortedMessage.sessionId });
    },
    [abortedMessage, sendMessage]
  );

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const value: ExtendedChatContextType = {
    sessions,
    activeSessionId,
    activeSession,
    loadingSessionId,
    isLoading,
    error,
    createSession,
    setActiveSession,
    loadSession,
    addMessage,
    sendMessage,
    deleteSession,
    renameSession,
    pinSession,
    clearError,
    // new
    abortedMessage,
    clearAborted,
    retryMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within <ChatProvider>");
  return ctx;
}

// ── Sort helper ────────────────────────────────────────────────────────────────
function sortSessions(list: ChatSession[]): ChatSession[] {
  const pinned = list
    .filter((s) => s.pinnedAt)
    .sort((a, b) => new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime());
  const unpinned = list
    .filter((s) => !s.pinnedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return [...pinned, ...unpinned];
}