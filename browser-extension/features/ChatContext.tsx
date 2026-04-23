// features/ChatContext.tsx — Plasmo sidepanel

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ChatSession, InterruptedMessage, SendMessageArgs, ChatContextType, ChatMessage } from "~types";

const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000";
const KEY_TOKEN   = "_auth_token";

async function getToken(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get(KEY_TOKEN);
    return (result[KEY_TOKEN] as string) || null;
  } catch {
    return null;
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${token}`,
  };
}

const SESSIONS    = `${NEXTJS_BASE}/api/chat/sessions`;
const sessionUrl  = (id: string) => `${NEXTJS_BASE}/api/chat/sessions/${id}`;
const messagesUrl = (id: string) => `${NEXTJS_BASE}/api/chat/sessions/${id}/messages`;

// ── Extended context type with createSession returning the new ID ──────────────
// FIX: createSession now returns string (the new session ID) instead of void.
// This lets handleSend in sidepanel.tsx pass the real ID to sendMessage
// without depending on React state updates being synchronous.
export interface ExtendedChatContextType extends ChatContextType {
  createSession: () => Promise<string>;
}

const ChatContext = createContext<ExtendedChatContextType | undefined>(undefined);

function sortSessions(list: ChatSession[]): ChatSession[] {
  const pinned   = list.filter((s) =>  s.pinnedAt).sort((a, b) => new Date(b.pinnedAt!).getTime() - new Date(a.pinnedAt!).getTime());
  const unpinned = list.filter((s) => !s.pinnedAt).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return [...pinned, ...unpinned];
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions,         setSessions]         = useState<ChatSession[]>([]);
  const [activeSessionId,  setActiveSessionId]  = useState<string>("");
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [isLoading,        setIsLoading]        = useState(false);
  const [error,            setError]            = useState<string | null>(null);
  const [abortedMessage,   setAbortedMessage]   = useState<InterruptedMessage | null>(null);

  const clearError   = useCallback(() => setError(null), []);
  const clearAborted = useCallback(() => setAbortedMessage(null), []);

  // ── Load sessions on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchSessions = async () => {
      const token = await getToken();
      if (!token) {setSessions([]);return;}
      try {
        const res = await fetch(SESSIONS, { headers: authHeaders(token) });
        if (res.ok) {
          const data   = await res.json() as { sessions?: ChatSession[] };
          const sorted = sortSessions(data.sessions ?? []);
          setSessions(sorted);
          if (sorted.length > 0) setActiveSessionId(sorted[0].id);
        } else {
          console.error("[ChatContext] fetchSessions", res.status, await res.text());
        }
      } catch (err) {
        console.error("[ChatContext] fetchSessions:", err);
      }
    };
    fetchSessions();
  }, []);

  // ── loadSession ────────────────────────────────────────────────────────────
  const loadSession = useCallback(async (id: string) => {
    const token = await getToken();
    if (!token) return;
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
  }, [activeSessionId, loadSession,]);

  // ── createSession — FIX: returns the new session ID ───────────────────────
  const createSession = useCallback(async (): Promise<string> => {
    const token = await getToken();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(SESSIONS, {
        method:  "POST",
        headers: authHeaders(token!),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body}`);
      }
      const data       = await res.json() as { session: ChatSession };
      const newSession = data.session;
      setSessions((prev) => sortSessions([newSession, ...prev]));
      setActiveSessionId(newSession.id);
      // Return the ID so callers don't need to wait for React state to update
      return newSession.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membuat sesi";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── deleteSession ──────────────────────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId: string) => {
    const token = await getToken();
    const res   = await fetch(sessionUrl(sessionId), {
      method:  "DELETE",
      headers: authHeaders(token!),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(err.error ?? `Gagal menghapus sesi (${res.status})`);
    }
    const body = await res.json() as { success: boolean; nextSessionId: string | null };
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setActiveSessionId(body.nextSessionId ?? "");
  }, []);

  // ── renameSession ──────────────────────────────────────────────────────────
  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    const trimmed  = newTitle.trim();
    if (!trimmed) throw new Error("Judul tidak boleh kosong");
    const token    = await getToken();
    const original = sessions.find((s) => s.id === sessionId)?.title ?? trimmed;
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed } : s)));
    const res = await fetch(sessionUrl(sessionId), {
      method:  "PATCH",
      headers: authHeaders(token!),
      body:    JSON.stringify({ title: trimmed }),
    });
    if (!res.ok) {
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: original } : s)));
      const err = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(err.error ?? "Gagal mengganti nama sesi");
    }
    const data = await res.json() as { session: { id: string; title: string } };
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: data.session.title } : s)));
  }, [sessions]);

  // ── pinSession ─────────────────────────────────────────────────────────────
  const pinSession = useCallback(async (sessionId: string) => {
    const token   = await getToken();
    const current = sessions.find((s) => s.id === sessionId);
    if (!current) return;
    const isPinned    = Boolean(current.pinnedAt);
    const newPinnedAt = isPinned ? null : new Date().toISOString();
    setSessions((prev) => sortSessions(prev.map((s) => (s.id === sessionId ? { ...s, pinnedAt: newPinnedAt } : s))));
    const res = await fetch(sessionUrl(sessionId), {
      method:  "PATCH",
      headers: authHeaders(token!),
      body:    JSON.stringify({ action: isPinned ? "unpin" : "pin" }),
    });
    if (!res.ok) {
      setSessions((prev) => sortSessions(prev.map((s) => (s.id === sessionId ? { ...s, pinnedAt: current.pinnedAt } : s))));
      const err = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(err.error ?? "Gagal mengubah pin sesi");
    }
    const data = await res.json() as { session: { id: string; pinnedAt: string | null } };
    setSessions((prev) => sortSessions(prev.map((s) => s.id === sessionId ? { ...s, pinnedAt: data.session.pinnedAt } : s)));
  }, [sessions]);

  // ── setActiveSession ───────────────────────────────────────────────────────
  const setActiveSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      if (prev.some((s) => s.id === sessionId)) setActiveSessionId(sessionId);
      return prev;
    });
  }, []);

  // ── addMessage (optimistic) ────────────────────────────────────────────────
  const addMessage = useCallback(
    (sessionId: string, payload: Omit<ChatMessage, "id" | "createdAt">) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          const msg: ChatMessage = { ...payload, id: `${sessionId}_${Date.now()}`, createdAt: new Date().toISOString() };
          return { ...session, updatedAt: new Date().toISOString(), messages: [...(session.messages ?? []), msg] };
        })
      );
    },
    []
  );

  // ── sendMessage ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async ({ text, signal, sessionId, attachments }: SendMessageArgs) => {
      // FIX: use the explicitly passed sessionId first, then fall back to
      // activeSessionId. This prevents the stale-state 404 bug where
      // a freshly created session's ID hasn't propagated to state yet.
      const targetSession = sessionId ?? activeSessionId;

      if (!targetSession) {
        console.error("[ChatContext] sendMessage called with no session ID");
        return;
      }
      
      // FIX Bug 2: Allow sending when there are attachments even if text is empty
      const hasAttachments = attachments && attachments.length > 0;
      if (!text.trim() && !hasAttachments) return;

      const token = await getToken();
      setLoadingSessionId(targetSession);

      // FIX Bug 2: Include attachment info in optimistic user message
      let displayText = text;
      if (hasAttachments) {
        const fileNames = attachments.map((f: any) => f.name).join(", ");
        if (text.trim()) {
          displayText = `${text}\n\n📎 ${fileNames}`;
        } else {
          displayText = `📎 ${fileNames}`;
        }
      }

      // Optimistic user message shown immediately
      const tempMsg: ChatMessage = {
        id:        `temp-${Date.now()}`,
        role:      "USER",
        text:      displayText,
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
        // FIX Bug 1 & Bug 4: Send attachments and use the full text (which may include file info from finalPrompt)
        const body: { message: string; attachments?: any[] } = { message: text };
        if (hasAttachments) {
          body.attachments = attachments;
        }

        const res = await fetch(messagesUrl(targetSession), {
          method:  "POST",
          headers: authHeaders(token!),
          body:    JSON.stringify(body),
          signal,
        });

        if (!res.ok) {
          await loadSession(targetSession);
          const errData = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(errData.error ?? "Gagal mengirim pesan");
        }

        const data = await res.json() as { aborted?: boolean; originalText?: string };

        if (data.aborted) {
          await loadSession(targetSession);
          setAbortedMessage({ text: data.originalText ?? text, sessionId: targetSession });
          return;
        }

        await loadSession(targetSession);
        setAbortedMessage(null);

      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
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

  // ── retryMessage ───────────────────────────────────────────────────────────
  const retryMessage = useCallback(
    async (text: string) => {
      if (!abortedMessage) return;
      setAbortedMessage(null);
      await sendMessage({ text, sessionId: abortedMessage.sessionId });
    },
    [abortedMessage, sendMessage]
  );

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  const value: ExtendedChatContextType = {
    sessions, activeSessionId, activeSession,
    loadingSessionId, isLoading, error, abortedMessage,
    createSession, setActiveSession, loadSession, addMessage,
    sendMessage, deleteSession, renameSession, pinSession,
    clearError, clearAborted, retryMessage, setLoadingSessionId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within <ChatProvider>");
  return ctx;
}