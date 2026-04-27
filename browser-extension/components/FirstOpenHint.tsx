// components/FirstOpenHint.tsx
// Shows a one-time hint to drag the panel wider on first open.
// Dismissed permanently via chrome.storage.local.

import React, { useEffect, useState } from "react"

const STORAGE_KEY = "InForm_hint_dismissed"

export default function FirstOpenHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY).then((result) => {
      if (!result[STORAGE_KEY]) setVisible(true)
    })
  }, [])

  const dismiss = () => {
    setVisible(false)
    chrome.storage.local.set({ [STORAGE_KEY]: true })
  }

  if (!visible) return null

  return (
    <div style={S.banner}>
      <span style={S.icon}>↔</span>
      <span style={S.text}>
        Seret tepi kiri panel untuk memperlebar tampilan
        <span style={S.sub}> / Drag the left edge to resize</span>
      </span>
      <button style={S.close} onClick={dismiss} title="Tutup">✕</button>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  banner: {
    display:        "flex",
    alignItems:     "center",
    gap:            10,
    padding:        "8px 14px",
    background:     "rgba(0,212,200,0.08)",
    borderBottom:   "1px solid rgba(0,212,200,0.2)",
    fontSize:       12,
    color:          "var(--teal, #00d4c8)",
    flexShrink:     0,
    animation:      "fadeIn .3s ease",
  },
  icon:  { fontSize: 16, flexShrink: 0 },
  text:  { flex: 1, lineHeight: 1.4 },
  sub:   { color: "var(--muted, #8b949e)" },
  close: {
    background: "none",
    border:     "none",
    color:      "var(--muted, #8b949e)",
    cursor:     "pointer",
    fontSize:   13,
    padding:    "2px 4px",
    flexShrink: 0,
  },
}