'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";

import LeftPanel from "@/components/chats/LeftPanel";
import TopPanel from "@/components/chats/TopPanel";
import ChatArea from "@/components/chats/ChatArea";
import ChatInputPanel from "@/components/chats/ChatInputPanel";

import { useChat } from "@/context/ChatContext";
import { useToast } from "@/context/ToastContext";
import { InputMode, UIMessage } from "@/types";

interface ChatContainerProps {
  sessionId?: string;
}

export default function ChatContainer({ sessionId: propSessionId }: ChatContainerProps) {
  const params = useParams();
  const urlSessionId = params.id as string | undefined;
  
  // Prioritas: prop > URL params
  const sessionId = propSessionId || urlSessionId;

  const {
    activeSession,
    loadingSessionId,
    isLoading,
    error,
    loadSession,
    sendMessage,
    clearError,
  } = useChat();

  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Memoized values
  const isCurrentLoading = useMemo(() => 
    loadingSessionId !== null && loadingSessionId === activeSession?.id,
    [loadingSessionId, activeSession?.id]
  );

  const messages = useMemo(() => 
    (activeSession?.messages ?? []) as UIMessage[],
    [activeSession?.messages]
  );

  const isWelcomeScreen = messages.length === 0;
  const isDisabled = isCurrentLoading || isSending || !sessionId;

  // Load session when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  }, [messages, isCurrentLoading]);

  // Auto resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`; // sedikit lebih tinggi
  }, []);

  // Handle send message with better UX
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isDisabled || !sessionId) return;

    setIsSending(true);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      await sendMessage(text, sessionId);
    } catch (err: any) {
      const errorMsg = err?.message || "Gagal mengirim pesan. Silakan coba lagi.";
      toast(errorMsg, "error");
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }, [input, isDisabled, sessionId, sendMessage, toast]);

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
    }, 30);
  };

  const handleFileUpload = (file: File) => {
    setInput(`[File: ${file.name}] Tolong analisis file ini dengan detail.`);
    setInputMode("text");
    toast(`File "${file.name}" siap dianalisis.`, "info");
  };

  // Clear error when component unmounts or session changes
  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError, sessionId]);

  return (
    <div style={S.root}>
      <LeftPanel />

      <main style={S.main}>
        <TopPanel />

        <ChatArea
          messages={messages}
          isWelcomeScreen={isWelcomeScreen}
          onSelectSuggestion={handleSelectSuggestion}
          isCurrentLoading={isCurrentLoading || isSending}
        />

        <ChatInputPanel
          input={input}
          onInput={setInput}
          inputMode={inputMode}
          onModeChange={setInputMode}
          isCurrentLoading={isCurrentLoading || isSending}
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          onResizeTextarea={resizeTextarea}
          disabled={isDisabled}
        />
      </main>

      {/* Global Styles */}
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
          40% { opacity: 1; transform: scale(1.1); }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Styles
const S: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    height: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    position: "relative",
  },
};