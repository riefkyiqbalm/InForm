"use client";
// components/chats/InterruptedNotif.tsx
//
// Shown inside ChatInputPanel when the user stopped a running generation.
// Displays the interrupted message text and offers a Retry button.

import React, { useState } from "react";
import Icon from "../IconStyles";

export interface InterruptedMessage {
  /** The user text that was aborted — used to pre-fill retry */
  text: string;
  /** Session the message belongs to */
  sessionId: string;
}

interface InterruptedNotifProps {
  interrupted: InterruptedMessage;
  /** Called when the user clicks Retry — parent re-sends the message */
  onRetry:  (text: string) => Promise<void>;
  /** Called when the user dismisses the banner */
  onDismiss: () => void;
}

export default function InterruptedNotif({
  interrupted,
  onRetry,
  onDismiss,
}: InterruptedNotifProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await onRetry(interrupted.text);
      // parent will clear the interrupted state on success
    } catch {
      // parent handles errors; just reset local loading state
      setRetrying(false);
    }
  };

  // Truncate long messages so the banner stays compact
  const preview =
    interrupted.text.length > 80
      ? interrupted.text.slice(0, 80).trimEnd() + "…"
      : interrupted.text;

  return (
    <div style={S.wrapper}>
      {/* ── Left: icon + text ─────────────────────────────────────────────── */}
      <div style={S.left}>
        <span style={S.iconWrap}>
          <Icon name="warning" size={16} invert={false} />
        </span>
        <div style={S.textBlock}>
          <span style={S.label}>Respons dihentikan</span>
          <span style={S.preview}>&ldquo;{preview}&rdquo;</span>
        </div>
      </div>

      {/* ── Right: retry + dismiss ────────────────────────────────────────── */}
      <div style={S.actions}>
        <button
          style={{ ...S.retryBtn, ...(retrying ? S.retryBtnLoading : {}) }}
          onClick={handleRetry}
          disabled={retrying}
          type="button"
        >
          {retrying ? (
            <>
              <Icon name="loading" size={14} className="animate-spin" />
              <span>Mengirim ulang…</span>
            </>
          ) : (
            <>
              <Icon name="forward" size={14} />
              <span>Coba lagi</span>
            </>
          )}
        </button>

        <button
          style={S.dismissBtn}
          onClick={onDismiss}
          type="button"
          aria-label="Tutup notifikasi"
          disabled={retrying}
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  wrapper: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    gap:            "12px",
    padding:        "10px 14px",
    marginBottom:   "10px",
    borderRadius:   "12px",
    background:     "rgba(245, 200, 66, 0.08)",
    border:         "1px solid rgba(245, 200, 66, 0.25)",
    animation:      "fadeUp 0.25s ease-out",
  },
  left: {
    display:    "flex",
    alignItems: "flex-start",
    gap:        "10px",
    minWidth:   0,
    flex:       1,
  },
  iconWrap: {
    flexShrink:   0,
    marginTop:    "1px",
    color:        "#f5c842",
  },
  textBlock: {
    display:       "flex",
    flexDirection: "column",
    gap:           "2px",
    minWidth:      0,
  },
  label: {
    fontSize:   "12px",
    fontWeight: 600,
    color:      "#f5c842",
    whiteSpace: "nowrap",
  },
  preview: {
    fontSize:     "12px",
    color:        "var(--muted)",
    overflow:     "hidden",
    textOverflow: "ellipsis",
    whiteSpace:   "nowrap",
    display:      "block",
  },
  actions: {
    display:    "flex",
    alignItems: "center",
    gap:        "6px",
    flexShrink: 0,
  },
  retryBtn: {
    display:        "flex",
    alignItems:     "center",
    gap:            "5px",
    padding:        "6px 12px",
    borderRadius:   "8px",
    border:         "none",
    background:     "linear-gradient(135deg, var(--teal), #0080cc)",
    color:          "#fff",
    fontSize:       "12px",
    fontWeight:     600,
    cursor:         "pointer",
    whiteSpace:     "nowrap",
    transition:     "opacity 0.2s",
  },
  retryBtnLoading: {
    opacity:  0.7,
    cursor:   "not-allowed",
  },
  dismissBtn: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    width:          "26px",
    height:         "26px",
    borderRadius:   "6px",
    border:         "none",
    background:     "transparent",
    color:          "var(--muted)",
    cursor:         "pointer",
    transition:     "background 0.15s",
  },
};