// components/chats/ChatInputPanel.tsx
import React, { useState } from "react"
import type { InputMode } from "~types"
import AttachFile from "~components/buttons/AttachButton"
import SendButton from "~components/buttons/SendButton"
import StopButton from "~components/buttons/StopButton"
import InterruptedNotif from "~components/chats/interruptedNotif"
import type { InterruptedMessage } from "~components/chats/interruptedNotif"
import FileMetadataPreview from "~components/FileMetadataPreview"
import type { StoredDoc } from "~components/SettingsModal"

interface ChatInputPanelProps {
  input: string
  onInput: (value: string) => void
  inputMode: InputMode
  onModeChange: (mode: InputMode) => void
  isCurrentLoading: boolean
  onSend: () => void // Ditambah param opsional
  onStop: () => void
  onFileUpload: (file: File) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onResizeTextarea: () => void
  disabled?: boolean
  isOpen: boolean
  interruptedMessage: InterruptedMessage | null
  onRetry: (text: string) => Promise<void>
  onDismissInterrupt: () => void
  pendingFiles: StoredDoc[]              // State dari parent
  setPendingFiles: React.Dispatch<React.SetStateAction<StoredDoc[]>>
}

export default function ChatInputPanel(props: ChatInputPanelProps) {
  
  const handleAttachAction = (type: InputMode, docs?: StoredDoc[]) => {
    if (docs && docs.length > 0) {
      props.setPendingFiles((prev) => [...prev, ...docs]);
    }
    // Tetap jalankan mode change jika diperlukan
    props.onModeChange(type)
  }

  const handleRemoveFile = (index: number) => {
    props.setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }
  // const handleSendInternal = () => {
  //   if (props.isCurrentLoading) return
  //   // Kirim beserta lampiran jika ada
  //   props.onSend(pendingFiles)
  //   setPendingFiles([]) // Bersihkan setelah kirim
  // }


  return (
    <div style={S.container}>
      <div style={S.centerContainer}>

        {props.interruptedMessage && (
          <InterruptedNotif
            interrupted={props.interruptedMessage}
            onRetry={props.onRetry}
            onDismiss={props.onDismissInterrupt}
          />
        )}

        <div style={S.chatBox}>
          {/* Preview Metadata File di atas Textarea */}
          <FileMetadataPreview
            files={props.pendingFiles.map(f => ({ name: f.name, type: f.type, size: f.size }))}
            onRemove={handleRemoveFile} // Oper fungsi hapus ke sini
          />

          <textarea
            ref={props.textareaRef}
            value={props.input}
            onChange={(e) => {
              props.onInput(e.target.value)
              props.onResizeTextarea()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                props.onSend();
              } else {
                props.onKeyDown(e)
              }
            }}
            placeholder="Tanyakan sesuatu..."
            style={S.textarea}
            disabled={props.disabled}
          />

          <div style={S.actionButtons}>
            <AttachFile
              actions={["document", "foto", "video"]}
              onAction={handleAttachAction}
              align="left"
              disabled={props.disabled || props.isCurrentLoading}
            />

            <div style={{ marginLeft: "auto" }}>
              {props.isCurrentLoading ? (
                <StopButton onClick={props.onStop} />
              ) : (
                <SendButton
                  onClick={props.onSend}
                  disabled={props.disabled || (!props.input.trim() && props.pendingFiles.length === 0)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  inputAreaWrapper: {
    width: "100%",
    background: "linear-gradient(to top, var(--bg,#0d1117) 80%, transparent)",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  centerContainer: {
    width: "100%",
    maxWidth: 600,
    display: "flex",
    flexDirection: "column",
    padding: "10px 20px 20px",
    pointerEvents: "auto",
    margin: "0 auto"
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
  chatBox: {
    background: "var(--card)",
    border: "1px solid var(--border,#30363d)",
    borderRadius: 16,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    width: "100%",
    resize: "none",
    border: "none",
    padding: "4px 8px",
    background: "transparent",
    color: "var(--text,#e6edf3)",
    fontFamily: "var(--font-head,'DM Sans',system-ui,sans-serif)",
    fontSize: 15,
    outline: "none",
    lineHeight: 1.5,
    minHeight: 24,
    maxHeight: 200,
    overflowY: "auto",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    padding: "0 4px",
  },
  actionButtons: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minHeight: 42,
  },
  footerHint: {
    marginTop: 12,
    color: "var(--muted,#8b949e)",
    fontSize: 12,
    textAlign: "center",
  },
}