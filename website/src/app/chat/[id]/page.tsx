"use client";
// app/chat/[id]/page.tsx

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@/context/ChatContext";
import { useToast } from "@/context/ToastContext";

import LeftPanel from "@/components/chats/LeftPanel";
import TopPanel  from "@/components/chats/TopPanel";
import { InputMode, UIMessage } from "@/types";
import dynamic from "next/dynamic";

const ChatAreaTanpaSSR = dynamic(
  () => import("@/components/chats/ChatArea"),
  { ssr: false }
);
const ChatInputPanelTanpaSSR = dynamic(
  () => import("@/components/chats/ChatInputPanel"),
  { ssr: false }
);

export default function ChatPage() {
  const {
    activeSession,
    loadingSessionId,
    sendMessage,
    createSession,
    // ── NEW from updated ChatContext ─────────────────────
    abortedMessage,
    clearAborted,
    retryMessage,
  } = useChat();

  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast }          = useToast();

  const [input,     setInput]     = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");

  const chatEndRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Loading state scoped to the active session only
  const isCurrentLoading = useMemo(
    () => loadingSessionId !== null && loadingSessionId === activeSession?.id,
    [loadingSessionId, activeSession?.id]
  );
    const [isOpen, setIsOpen] = useState(true);

  // Auto-scroll when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isCurrentLoading]);

  // Auto-resize textarea
const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // Sesuaikan nilai ini (200) dengan maxHeight pada S.textarea di ChatInputPanel
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`; 
  };

  // ── Stop ──────────────────────────────────────────────────────────────────
  // Aborts the in-flight fetch.  The route will detect req.signal.aborted,
  // roll back the Prisma write, and return { aborted: true }.
  // ChatContext.sendMessage then sets abortedMessage so the banner shows.
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isCurrentLoading) return;

    if (!activeSession) createSession();

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Clear any stale interrupted banner when the user sends a new message
    clearAborted();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendMessage({ text: input, signal: controller.signal });
    } catch {
      toast("Gagal terhubung ke AI. Pastikan Flask/LM Studio aktif.", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      textareaRef.current?.focus();
      resizeTextarea();
    }, 50);
  };

  const handleFileUpload = (file: File) => {
    setInput(`[File: ${file.name}] Tolong analisis data dari file ini.`);
    setInputMode("text");
    toast(`File "${file.name}" ditambahkan.`, "info");
  };

  // ── Retry handler (wired to InterruptedNotif's button) ────────────────────
  // retryMessage is provided by ChatContext and re-calls sendMessage
  // with the original aborted text and a fresh (no) AbortSignal.
  const handleRetry = async (text: string) => {
    try {
      await retryMessage(text);
    } catch {
      toast("Gagal mengirim ulang. Coba lagi.", "error");
    }
  };

  const messages        = (activeSession?.messages ?? []) as UIMessage[];
  const isWelcomeScreen = messages.length === 0;

  return (
    <div style={S.root}>
      <LeftPanel />

      <main style={S.main}>
        <TopPanel />

        <ChatAreaTanpaSSR
          messages={messages}
          isWelcomeScreen={isWelcomeScreen}
          onSelectSuggestion={handleSelectSuggestion}
          isCurrentLoading={isCurrentLoading}
        />

        <ChatInputPanelTanpaSSR
          input={input}
          onInput={setInput}
          inputMode={inputMode}
          onModeChange={setInputMode}
          isCurrentLoading={isCurrentLoading}
          onSend={handleSend}
          onStop={handleStop}
          onFileUpload={handleFileUpload}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          onResizeTextarea={resizeTextarea}
          // ── interrupted message props ──────────────────────────────────
          interruptedMessage={abortedMessage}
          onRetry={handleRetry}
          onDismissInterrupt={clearAborted}
          isOpen={isOpen}
        />
      </main>

      <style jsx global>{`
        .dot-blink {
          width: 6px;
          height: 6px;
          background-color: var(--teal);
          border-radius: 50%;
          display: inline-block;
          animation: blink 1.4s infinite ease-in-out both;
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.1); }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    display:    "flex",
    height:     "100vh",
    background: "var(--bg)",
    color:      "var(--text)",
    overflow:   "hidden",
  },
  main: {
    flex:          1,
    display:       "flex",
    flexDirection: "column",
    minWidth:      0,
    position:      "relative",
  },
};