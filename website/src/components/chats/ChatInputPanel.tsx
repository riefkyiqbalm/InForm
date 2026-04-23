"use client";
// components/chats/ChatInputPanel.tsx

import React from "react";
import { InputMode } from "@/types";
import AttachFile from "../buttons/AttachButton";
import SendButton from "../buttons/SendButton";
import StopButton from "@/components/buttons/StopButton";
import InterruptedNotif, {
  type InterruptedMessage,
} from "@/components/chats/interruptedNotif";

interface ChatInputPanelProps {
  input: string;
  onInput: (value: string) => void;
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  isCurrentLoading: boolean;
  onSend: () => void;
  onStop: () => void;
  onFileUpload: (file: File) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onResizeTextarea: () => void;
  disabled?: boolean;
  isOpen: boolean;
  interruptedMessage: InterruptedMessage | null;
  onRetry: (text: string) => Promise<void>;
  onDismissInterrupt: () => void;
}

export default function ChatInputPanel({
  input,
  onInput,
  inputMode,
  isCurrentLoading,
  onSend,
  onStop,
  onFileUpload,
  onKeyDown,
  textareaRef,
  onResizeTextarea,
  disabled = false,
  interruptedMessage,
  onRetry,
  onDismissInterrupt,
  isOpen,
}: ChatInputPanelProps) {
  if (!isOpen) return null;

  return (
    <div style={S.inputAreaWrapper}>
      {/* Container ini yang membuat form berada tepat di tengah */}
      <div style={S.centerContainer}>
        
        {inputMode !== "text" && (
          <div
            style={S.dropZone}
            onClick={() => document.getElementById("file-up")?.click()}
          >
            <span>☁️ Klik untuk upload {inputMode}</span>
          </div>
        )}

        <input
          id="file-up"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload(file);
          }}
        />

        {/* ── Interrupted banner ────────────────────────────────────────── */}
        {interruptedMessage && !isCurrentLoading && (
          <InterruptedNotif
            interrupted={interruptedMessage}
            onRetry={onRetry}
            onDismiss={onDismissInterrupt}
          />
        )}

        {/* ── Kotak Utama Chat (Input di atas, Tombol di bawah) ─────────── */}
        <div style={S.chatBox}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              onInput(e.target.value);
              onResizeTextarea();
            }}
            onKeyDown={onKeyDown}
            placeholder="Tanyakan sesuatu..."
            rows={1}
            style={S.textarea}
            disabled={isCurrentLoading || disabled}
          ></textarea>

          <div style={S.ButtonContainer}>
            <AttachFile
              actions={["text", "foto", "video", "document"]}
              onAction={(type) => document.getElementById("file-up")?.click()}
              align="left"
            />
            <div style={S.actionButtons}>
              {/* Logika memunculkan tombol: */}
              {isCurrentLoading ? (
                <StopButton onClick={onStop} />
              ) : input.trim().length > 0 ? (
                // SendButton HANYA muncul jika input tidak kosong
                <div className="animate-fade-up">
                  <SendButton onClick={onSend} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div style={S.footerHint}>
          inForm · AI Bisa Salah Harap Cek Kembali.{" "}
          <a href="/terms" style={{ color: "var(--teal)" }}>
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  // Wrapper terluar untuk background gradient dan centering
  inputAreaWrapper: {
    width: "100%",
    padding: "10px 20px 20px 20px",
    background: "linear-gradient(to top, var(--bg) 80%, transparent)",
    display: "flex",
    justifyContent: "center", // Mendorong kotak ke tengah layar
  },
  // Membatasi lebar chat agar tidak full-width di monitor besar
  centerContainer: {
    width: "80%",
    maxWidth: "800px", 
    display: "flex",
    flexDirection: "column",
  },
  dropZone: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px dashed var(--border)",
    marginBottom: 12,
    cursor: "pointer",
    textAlign: "center",
    color: "var(--muted)",
  },
  // chatBox menggabungkan textarea dan button di dalam satu border
  chatBox: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "10px",
    display: "flex",
    flexDirection: "column", // Textarea di atas, Button di bawah
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  textarea: {
    width: "100%",
    resize: "none",
    border: "none",
    padding: "4px 8px",
    background: "transparent",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: "15px",
    outline: "none",
    lineHeight: 1.5,
    minHeight: "24px",
    maxHeight: "200px", // Textarea akan berhenti memanjang di 200px (lalu muncul scroll)
    overflowY: "auto",
  },
  ButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px", // Memberi jarak antara tulisan dan baris tombol
    padding: "0 4px",
  },
  actionButtons: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minHeight: "42px", // Menjaga ruang agar tidak loncat saat tombol send hilang/muncul
  },
  footerHint: {
    marginTop: 12,
    color: "var(--muted)",
    fontSize: 12,
    textAlign: "center",
  },
};