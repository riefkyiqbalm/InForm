// components/chats/FileMetadataPreview.tsx
'use-client'
import React from "react"
import Icon from "@sharedUI/components/IconStyles"

interface Props {
  files: { name: string; type: string; size?: string }[]
  onRemove?: (index: number) => void // Prop baru untuk menghapus
}

export default function FileMetadataPreview({ files, onRemove }: Props) {
  if (files.length === 0) return null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
      {files.map((file, i) => (
        <div key={i} style={S_PREVIEW.card}>
          <div style={S_PREVIEW.info}>
            <span style={S_PREVIEW.fileName}>{file.name}</span>
            <div style={S_PREVIEW.metaRow}>
              <div style={S_PREVIEW.extBadge}>
                <span>{(file.type || "FILE").toUpperCase()}</span>
              </div>
              {file.size && <span style={S_PREVIEW.fileSize}>{file.size}</span>}
            </div>
          </div>

          {/* Tombol Close Hanya muncul jika onRemove diberikan */}
          {onRemove && (
            <button 
              onClick={() => onRemove(i)} 
              style={S_PREVIEW.closeBtn}
              title="Hapus file"
            >
              <Icon name="red-close" size={20} invert={false} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

const S_PREVIEW: Record<string, React.CSSProperties> = {
  card: { 
    width:"100%",
    maxWidth:"240px",
    background: "var(--border)", 
    border: "1px solid #30363d", 
    borderRadius: 12, 
    padding: "10px 14px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between",
    gap: 12 
  },
  info: { display: "flex", flexDirection: "column", gap: 4, overflow: "hidden", flex: 1 },
  fileName: { color: "#e6edf3", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  metaRow: { display: "flex", alignItems: "center", gap: 8 },
  extBadge: { background: "#ff4d6d", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 },
  fileSize: { color: "#8b949e", fontSize: 11 },
  closeBtn: { 
    background: "transparent", 
    border: "none", 
    cursor: "pointer", 
    color: "#ff4d6d", 
    padding: "6px",
    display: "flex",
    alignItems: "center",
    borderRadius: "50%",
    transition: "background 0.2s"
  }
}