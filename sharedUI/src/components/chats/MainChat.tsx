"use client";

import React, { useEffect, useRef, useState } from "react";
import type { InputMode, AttachmentInfo } from "../../types";
import type { StoredDoc } from "../SettingsModal";
import { useChat } from "../../context/ChatContext";
import { useForm, isFillIntent } from "../../context/FormContext";
import { useToast } from "../../context/ToastContext";

import ChatArea from "./ChatArea";
import ChatInputPanel from "./ChatInputPanel";
import LeftPanel from "./LeftPanel";
import TopPanel from "./TopPanel";

// ── Helpers ───────────────────────────────────────────────────────────────
function buildFillReply(filled: number, skipped: string[], total: number, score: number): string {
  if (score === -1) return "❌ Gagal mengisi form. Terjadi kesalahan saat menjalankan auto-fill.";
  if (total === 0) return "⚠️ Tidak ada form yang terdeteksi di halaman aktif.";
  if (filled === 0) return `⚠️ Form terdeteksi (${total} field) namun tidak ada yang berhasil diisi. AI mungkin belum memiliki data yang cocok.`;

  const bar = buildBar(score);
  const skips = skipped.length > 0 ? `\n\n**Field yang dilewati:** ${skipped.join(", ")}` : "";
  const emoji = score >= 80 ? "🎉" : score >= 50 ? "✅" : "⚠️";

  return `${emoji} **Form berhasil diisi!**\n\n${bar} **${score}%** (${filled}/${total} field)${skips}\n\nForm di halaman aktif telah diisi secara otomatis.`;
}

function buildBar(score: number): string {
  const filled = Math.round(score / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

const convertStoredDocsToAttachments = (docs: StoredDoc[]): AttachmentInfo[] => {
  return docs.map((doc) => ({
    id: doc.documentId,
    name: doc.name,
    type: doc.type || 'application/octet-stream',
    size: typeof doc.size === 'string' ? parseFloat(doc.size) || 0 : (doc.size as number),
  }));
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function MainChat() {
  const {
    activeSession, activeSessionId,
    loadingSessionId, sendMessage, setLoadingSessionId,
    createSession, addMessage,
    abortedMessage, clearAborted, retryMessage,
  } = useChat();

  const { toast } = useToast();
  const { isFilling, fillAllNow } = useForm();

  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<StoredDoc[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isCurrentLoading = loadingSessionId !== null;
  const messages = (activeSession?.messages ?? []) as any[];
  const isWelcomeScreen = messages.length === 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isCurrentLoading, isFilling]);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleToggleLeftPanel = () => setIsLeftPanelOpen((p) => !p);

  const handleStop = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && pendingFiles.length === 0) || isCurrentLoading || isFilling) return;

    const filesToSend = [...pendingFiles];
    const attachments = convertStoredDocsToAttachments(filesToSend);
    setInput("");
    setPendingFiles([]);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      try { targetSessionId = await createSession(); }
      catch { toast("Gagal membuat sesi baru.", "error"); return; }
    }

    let finalPrompt = text;
    if (filesToSend.length > 0) {
      const fileInfo = filesToSend.map(f => "[Nama File: " + f.name + "]\nIsi File:\n" + f.type).join("\n\n");
      finalPrompt = text ? `${text}\n\n---\nCatatan untuk AI: Pengguna melampirkan file berikut:\n${fileInfo}` : `Tolong analisis file berikut:\n${fileInfo}`;
    }

    if (isFillIntent(finalPrompt)) {
      clearAborted();
      setLoadingSessionId(targetSessionId);
      const controller = new AbortController();
      abortControllerRef.current = controller;
      sendMessage({ text: finalPrompt, signal: controller.signal, sessionId: targetSessionId, attachments }).catch(() => {});

      const result = await fillAllNow();
      setLoadingSessionId(null);

      if (result === null) {
        addMessage(targetSessionId, {
          role: "ASSISTANT", text: "⏳ AI sedang membaca dan menganalisis form di halaman ini...", sessionId: targetSessionId,
        });
        return;
      }

      const replyText = buildFillReply(result.filled, result.skipped, result.total, result.score);
      addMessage(targetSessionId, { role: "ASSISTANT", text: replyText, sessionId: targetSessionId });
      
      if (result.filled > 0) toast(`+ ${result.filled} field berhasil diisi!`, "success");
      else if (result.total > 0) toast("Form terdeteksi tapi tidak ada field yang terisi.", "warn");
      return;
    }

    clearAborted();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendMessage({ text: finalPrompt, signal: controller.signal, sessionId: targetSessionId, attachments });
    } catch {
      toast("Gagal terhubung ke AI. Pastikan Backend aktif.", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => { textareaRef.current?.focus(); resizeTextarea(); }, 50);
  };

  const handleFileUpload = (file: File) => {
    setInput(`[File: ${file.name}] Tolong analisis data dari file ini.`);
    setInputMode("text");
    toast(`File "${file.name}" ditambahkan.`, "info");
  };

  const handleRetry = async (text: string) => {
    try { await retryMessage(text); }
    catch { toast("Gagal mengirim ulang.", "error"); }
  };

  return (
    <div style={S.root}>
      <LeftPanel isOpen={isLeftPanelOpen} setIsOpen={setIsLeftPanelOpen} onClose={() => setIsLeftPanelOpen(false)} />
      {isLeftPanelOpen && <div style={S.backdrop} onClick={() => setIsLeftPanelOpen(false)} />}

      <main style={S.main}>
        <TopPanel isLeftPanelOpen={isLeftPanelOpen} onToggleLeftPanel={handleToggleLeftPanel} />

        <ChatArea
          messages={messages}
          isWelcomeScreen={isWelcomeScreen}
          onSelectSuggestion={handleSelectSuggestion}
          isCurrentLoading={isCurrentLoading || isFilling}
        />

        <ChatInputPanel
          input={input}
          onInput={setInput}
          inputMode={inputMode}
          onModeChange={setInputMode}
          isCurrentLoading={isCurrentLoading || isFilling}
          onSend={handleSend}
          onStop={handleStop}
          onFileUpload={handleFileUpload}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          onResizeTextarea={resizeTextarea}
          interruptedMessage={abortedMessage}
          onRetry={handleRetry}
          onDismissInterrupt={clearAborted}
          isOpen={!isLeftPanelOpen}
          pendingFiles={pendingFiles}
          setPendingFiles={setPendingFiles}
        />
        <div ref={chatEndRef} />
      </main>

      {/* Menggunakan style standar HTML agar jalan di Extension dan Next.js */}
      <style>{`
        .dot-blink{width:6px;height:6px;background-color:var(--teal,#00d4c8);border-radius:50%;display:inline-block;animation:blink 1.4s infinite ease-in-out both;}
        @keyframes blink{0%,80%,100%{opacity:0.3;transform:scale(0.8)}40%{opacity:1;transform:scale(1.1)}}
        .animate-fade-up{animation:fadeUp 0.5s ease-out;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: { display: "flex", height: "100vh", background: "var(--bg,#0d1117)", color: "var(--text,#e6edf3)", overflow: "hidden", position: "relative" },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" },
  backdrop: { position: "absolute", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(1px)", cursor: "pointer" },
};