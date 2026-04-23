// components/autofill/FillResultBubble.tsx
// Shows fill result as an AI-style chat bubble after form is filled.

import React from "react"
import { useForm } from "~features/FormContext"

export default function FillResultBubble() {
  const { fillResult, isFilling, clearResult } = useForm()

  if (!fillResult && !isFilling) return null

  return (
    <div style={S.wrap}>
      <div style={S.bubble}>

        {isFilling && (
          <div style={S.row}>
            <div style={S.spinner} />
            <span style={S.text}>Mengisi form...</span>
          </div>
        )}

        {fillResult && !isFilling && (
          <>
            <div style={S.row}>
              <span style={{ fontSize: 20 }}>
                {fillResult.score >= 70 ? "🎉" : fillResult.score >= 40 ? "⚠️" : "❌"}
              </span>
              <div>
                <div style={S.title}>
                  {fillResult.score >= 70 ? "Form berhasil diisi!"
                 : fillResult.score >= 40 ? "Form sebagian terisi"
                 : "Gagal mengisi form"}
                </div>
                <div style={S.sub}>
                  {fillResult.filled} dari {fillResult.total} field · skor {fillResult.score}%
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div style={S.barTrack}>
              <div style={{
                ...S.barFill,
                width:      `${fillResult.score}%`,
                background: fillResult.score >= 70 ? "#00d4c8"
                          : fillResult.score >= 40 ? "#f5c842"
                          : "#ff4d6d",
              }} />
            </div>

            {fillResult.skipped.length > 0 && (
              <div style={S.skipped}>
                Field dilewati: {fillResult.skipped.join(", ")}
              </div>
            )}

            <button style={S.dismissBtn} onClick={clearResult}>
              Tutup
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap:   { padding:"4px 16px 4px 48px", marginBottom:4 },
  bubble: {
    background:   "var(--bg2,#161b22)",
    border:       "1px solid var(--border,#30363d)",
    borderRadius: "12px 12px 12px 2px",
    padding:      "14px 16px",
    maxWidth:     380,
  },
  row:     { display:"flex", alignItems:"center", gap:12, marginBottom:10 },
  spinner: { width:16, height:16, border:"2px solid #30363d", borderTop:"2px solid #00d4c8", borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 },
  text:    { fontSize:13, color:"var(--text,#e6edf3)" },
  title:   { fontSize:13, fontWeight:600, color:"var(--text,#e6edf3)" },
  sub:     { fontSize:11, color:"var(--muted,#8b949e)", marginTop:2 },
  barTrack:{ height:5, background:"rgba(255,255,255,0.08)", borderRadius:99, overflow:"hidden", marginBottom:8 },
  barFill: { height:"100%", borderRadius:99, transition:"width .6s ease" },
  skipped: { fontSize:11, color:"#f5c842", marginBottom:8 },
  dismissBtn: { padding:"6px 12px", borderRadius:6, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"var(--muted,#8b949e)", fontSize:11, cursor:"pointer" },
}