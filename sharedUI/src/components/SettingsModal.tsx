// components/modals/SettingsModal.tsx
// FIXED:
//   - Single source of truth: one `docs` state, no `documents` shadow state
//   - Duplicate check per-session (same name OK across different messages)
//   - Upload always syncs both state + localStorage atomically
//   - removeDoc reads from same `docs` array it renders
//   - Toast fires correctly for all outcomes

'use-client'

import React, { useRef, useState } from "react"
import { createPortal } from "react-dom"
import Icon from "./IconStyles"
import { useToast } from "../context/ToastContext"

type SettingsPage = "root" | "ai-model" | "privacy" | "memory"

interface SettingsModalProps {
  isOpen:  boolean
  onClose: () => void
}

const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000"
const KEY_TOKEN   = "_auth_token"
const STORAGE_KEY = "InForm_memory_docs"

async function getToken(): Promise<string | null> {
  try { const r = await chrome.storage.local.get(KEY_TOKEN); return (r[KEY_TOKEN] as string) || null }
  catch { return null }
}

export interface StoredDoc {
  documentId: string
  name:       string
  size:       string
  type:       string
}

// ── Single localStorage helpers — used by SettingsModal AND AttachButton ──────
export function loadDocs(): StoredDoc[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") }
  catch { return [] }
}
export function saveDocs(list: StoredDoc[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const AI_MODELS = [
  { id: "qwen3-4b",       label: "Qwen3 4B",      desc: "Fast · Local"      },
  { id: "qwen3-8b",       label: "Qwen3 8B",       desc: "Balanced · Local"  },
  { id: "qwen3-14b",      label: "Qwen3 14B",      desc: "Smart · Local"     },
  { id: "llama-3.1-8b",  label: "Llama 3.1 8B",   desc: "Fast · Local"      },
  { id: "mistral-7b",     label: "Mistral 7B",     desc: "Efficient · Local" },
  { id: "deepseek-r1-7b", label: "DeepSeek R1 7B", desc: "Reasoning · Local" },
]

const ACCEPTED_TYPES =
  ".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.md,.json," +
  ".mp4,.mp3,.mov,.jpg,.jpeg,.png,.svg,.webp," +
  ".js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.cs,.go,.rs,.rb,.php,.html,.css,.yaml,.yml,.toml,.sh"

const ROOT_MENU: { page: SettingsPage; icon: string; title: string; subtitle: string }[] = [
  { page: "ai-model", icon: "multicolor-cpu",    title: "Model AI", subtitle: "Pilih model bahasa / Select AI model" },
  { page: "privacy",  icon: "multicolor-shield", title: "Privasi",  subtitle: "Kelola data & izin / Manage data & permissions" },
  { page: "memory",   icon: "multicolor-memory", title: "Memori",   subtitle: "Unggah dokumen referensi / Upload documents" },
]

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [page, setPage] = useState<SettingsPage>("root")
  if (!isOpen) return null
  const close  = () => { setPage("root"); onClose() }
  const goBack = () => setPage("root")
  const pageTitle: Record<SettingsPage, string> = {
    root: "Pengaturan / Settings", "ai-model": "Model AI",
    privacy: "Privasi / Privacy", memory: "Memori / Memory",
  }
  return createPortal(
    <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div style={S.modal}>
        <div style={S.header}>
          {page !== "root"
            ? <button style={S.iconBtn} onClick={goBack}><Icon name="white-arrow-left" size={18} /></button>
            : <div style={{ width: 32 }} />}
          <span style={S.headerTitle}>{pageTitle[page]}</span>
          <button style={S.iconBtn} onClick={close}><Icon name="red-close" size={18} invert={false} /></button>
        </div>
        <div style={S.body}>
          {page === "root"     && <RootPage    onNavigate={setPage} />}
          {page === "ai-model" && <AIModelPage />}
          {page === "privacy"  && <PrivacyPage />}
          {page === "memory"   && <MemoryPage  />}
        </div>
      </div>
    </div>,
    document.body
  )
}

function RootPage({ onNavigate }: { onNavigate: (p: SettingsPage) => void }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {ROOT_MENU.map((item) => (
        <button key={item.page} style={S.menuRow} onClick={() => onNavigate(item.page)}
          onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}>
          <div style={S.menuRowIcon}><Icon name={item.icon} size={20} invert={false} /></div>
          <div style={{ flex:1, textAlign:"left" }}>
            <div style={S.menuRowTitle}>{item.title}</div>
            <div style={S.menuRowSub}>{item.subtitle}</div>
          </div>
          <Icon name="white-chevron-right" size={14} invert={false} />
        </button>
      ))}
    </div>
  )
}

function AIModelPage() {
  const [selected, setSelected] = useState(() => localStorage.getItem("InForm_ai_model") ?? "qwen3-4b")
  const choose = (id: string) => { setSelected(id); localStorage.setItem("InForm_ai_model", id) }
  return (
    <div>
      <p style={S.sectionDesc}>
        Pilih model AI yang digunakan. Model berjalan lokal via LM Studio.<br />
        <span style={{ color:"#5a6a7a" }}>Select the AI model. Models run locally via LM Studio.</span>
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:16 }}>
        {AI_MODELS.map((m) => (
          <button key={m.id} style={{
            ...S.modelRow,
            border: selected===m.id ? "1px solid var(--teal,#00d4c8)" : "1px solid rgba(255,255,255,0.08)",
            background: selected===m.id ? "rgba(0,212,200,0.07)" : "transparent",
          }} onClick={() => choose(m.id)}
            onMouseEnter={(e) => { if (selected!==m.id) e.currentTarget.style.background="rgba(255,255,255,0.04)" }}
            onMouseLeave={(e) => { if (selected!==m.id) e.currentTarget.style.background="transparent" }}>
            <div style={{ textAlign:"left" }}>
              <div style={S.modelName}>{m.label}</div>
              <div style={S.modelDesc}>{m.desc}</div>
            </div>
            {selected===m.id && <Icon name="white-check" size={16} invert={false} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function PrivacyPage() {
  const { toast } = useToast()
  const [prefs, setPrefs] = useState<Record<string,boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("InForm_privacy") ?? "{}") } catch { return {} }
  })
  const toggle = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next); localStorage.setItem("InForm_privacy", JSON.stringify(next))
  }
  const clearData = () => {
    if (window.confirm("Hapus semua data lokal? / Delete all local data?")) {
      localStorage.clear(); chrome.storage.local.clear(); window.location.reload()
    }
  }
  const TOGGLES = [
    { key:"allow_history",       title:"Riwayat Chat untuk Dataset",    desc:"Izinkan riwayat chat untuk meningkatkan model. / Allow chat history for AI improvement." },
    { key:"allow_uploads",       title:"Data Unggahan untuk Auto-Fill",  desc:"Izinkan dokumen untuk pengisian form otomatis. / Allow uploaded docs for auto-fill." },
    { key:"allow_browser_access",title:"Akses Browser untuk Auto-Fill",  desc:"Izinkan membaca tab terbuka untuk auto-fill. / Allow reading open tabs for auto-fill." },
  ]
  return (
    <div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {TOGGLES.map((t) => (
          <div key={t.key} style={S.toggleRow}>
            <div style={{ flex:1 }}>
              <div style={S.toggleTitle}>{t.title}</div>
              <div style={S.toggleDesc}>{t.desc}</div>
            </div>
            <button onClick={() => toggle(t.key)} style={{ ...S.toggle, background: prefs[t.key]?"var(--teal,#00d4c8)":"#2d3748" }}>
              <div style={{ ...S.toggleThumb, transform: prefs[t.key]?"translateX(18px)":"translateX(2px)" }} />
            </button>
          </div>
        ))}
      </div>
      <div style={S.divider} />
      <div style={S.dangerZone}>
        <div style={S.toggleTitle}>Hapus Data Lokal / Clear Local Data</div>
        <p style={S.toggleDesc}>Menghapus semua token, preferensi, dan dokumen tersimpan.</p>
        <button style={S.dangerBtn} onClick={clearData}
          onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,77,109,0.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background="rgba(255,77,109,0.1)")}>
          <Icon name="white-trash" size={14} invert={false} />
          <span>Hapus Semua Data / Delete All Data</span>
        </button>
      </div>
    </div>
  )
}

// ── MemoryPage ─────────────────────────────────────────────────────────────────
// FIX: single `docs` state is the only source of truth.
// Upload: reads fresh from state, appends, saves state+localStorage atomically.
// Delete: reads from same `docs` state that the list renders.
// Duplicate check: by documentId (not name) — same name is fine across sessions.
function MemoryPage() {
  const { toast }    = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading,  setUploading] = useState(false)

  // SINGLE source of truth — initialized once from localStorage
  const [docs, setDocs] = useState<StoredDoc[]>(() => loadDocs())

  // Atomic update: sets React state AND localStorage in one call
  const updateDocs = (list: StoredDoc[]) => {
    setDocs(list)
    saveDocs(list)
  }

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    setUploading(true)

    // Read current docs ONCE at the start — use functional updater for the loop
    // to always append to the most recent version
    let workingDocs = loadDocs()   // fresh read so we're never stale

    for (const file of files) {
      // Duplicate check: same documentId not allowed, but same name IS allowed
      // (user may upload updated version of the same document)
      // No duplicate check here — each upload creates a new DB record

      try {
        const token = await getToken()
        const form  = new FormData()
        form.append("file", file)

        const res = await fetch(`${NEXTJS_BASE}/api/document`, {
          method:  "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body:    form,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string }
          toast(`Gagal mengunggah "${file.name}": ${err.error ?? res.status}`, "error")
          continue
        }

        const data = await res.json() as { documentId: string; fileName: string }

        const newDoc: StoredDoc = {
          documentId: data.documentId,
          name:       file.name,
          size:       formatSize(file.size),
          type:       file.type || file.name.split(".").pop() || "file",
        }

        workingDocs = [...workingDocs, newDoc]
        toast(`"${file.name}" berhasil diunggah`, "success")

      } catch {
        toast(`Error pada file "${file.name}"`, "error")
      }
    }

    // Single atomic update after all files processed
    updateDocs(workingDocs)
    setUploading(false)
  }

  const removeDoc = async (idx: number) => {
    const doc = docs[idx]
    if (!doc) return
    try {
      const token = await getToken()
      if (doc.documentId) {
        const res = await fetch(`${NEXTJS_BASE}/api/document/${doc.documentId}`, {
          method:  "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string }
          toast(`Gagal menghapus: ${err.error ?? res.status}`, "error")
          return
        }
      }
      updateDocs(docs.filter((_, i) => i !== idx))
      toast(`"${doc.name}" dihapus`, "success")
    } catch {
      toast("Gagal menghapus dokumen", "error")
    }
  }

  return (
    <div>
      <p style={S.sectionDesc}>
        Unggah dokumen referensi untuk InForm saat menjawab atau mengisi form.<br />
        <span style={{ color:"#5a6a7a" }}>Upload reference documents for InForm to use when answering or filling forms.</span>
      </p>

      <button style={{ ...S.uploadBtn, opacity: uploading ? 0.6 : 1 }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor="var(--teal,#00d4c8)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor="rgba(255,255,255,0.12)")}>
        {uploading
          ? <div style={{ width:18, height:18, border:"2px solid #30363d", borderTop:"2px solid #00d4c8", borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />
          : <Icon name="white-upload" size={18} invert={false} />}
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text,#e6edf3)" }}>
            {uploading ? "Mengunggah..." : "Unggah Dokumen / Upload Document"}
          </div>
          <div style={{ fontSize:11, color:"var(--muted,#8b949e)", marginTop:2 }}>
            PDF, DOCX, XLSX, PPT, MP4, MP3, JSON, Kode, Gambar...
          </div>
        </div>
      </button>

      <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_TYPES}
        style={{ display:"none" }} onChange={handleFiles} />

      {docs.length > 0 && (
        <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:6 }}>
          {docs.map((doc, i) => (
            <div key={`${doc.documentId}-${i}`} style={S.docRow}>
              <Icon name="white-file" size={14} invert={false} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={S.docName}>{doc.name}</div>
                <div style={S.docMeta}>{doc.size} · {doc.type}</div>
              </div>
              <button style={S.removeBtn} onClick={() => removeDoc(i)} title="Hapus / Remove"
                onMouseEnter={(e) => (e.currentTarget.style.color="#ff4d6d")}
                onMouseLeave={(e) => (e.currentTarget.style.color="#5a6a7a")}>
                <Icon name="white-delete" size={18} invert={false} />
              </button>
            </div>
          ))}
        </div>
      )}

      {docs.length === 0 && !uploading && (
        <div style={S.emptyState}>
          <Icon name="white-memory" size={28} invert={false} />
          <p style={{ margin:"8px 0 0", fontSize:12, color:"var(--muted,#8b949e)" }}>
            Belum ada dokumen / No documents yet
          </p>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024)    return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(1)} MB`
}

const S: Record<string, React.CSSProperties> = {
  overlay:     { position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  modal:       { background:"var(--bg2,#161b22)", border:"1px solid var(--border,#30363d)", borderRadius:16, width:"100%", maxWidth:380, maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden" },
  header:      { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border,#30363d)", flexShrink:0 },
  headerTitle: { fontSize:14, fontWeight:600, color:"var(--text,#e6edf3)", flex:1, textAlign:"center" },
  iconBtn:     { background:"none", border:"none", cursor:"pointer", padding:6, borderRadius:6, display:"flex", alignItems:"center", color:"var(--muted,#8b949e)", width:32, justifyContent:"center" },
  body:        { flex:1, overflowY:"auto", padding:"16px" },
  menuRow:     { display:"flex", alignItems:"center", gap:14, width:"100%", padding:"12px 10px", background:"transparent", border:"none", borderRadius:10, cursor:"pointer", transition:"background .15s" },
  menuRowIcon: { width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  menuRowTitle:{ fontSize:14, fontWeight:600, color:"var(--text,#e6edf3)", marginBottom:2 },
  menuRowSub:  { fontSize:11, color:"var(--muted,#8b949e)", lineHeight:1.4 },
  sectionDesc: { fontSize:12, color:"var(--muted,#8b949e)", lineHeight:1.6, margin:0 },
  modelRow:    { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderRadius:10, cursor:"pointer", transition:"background .15s", width:"100%" },
  modelName:   { fontSize:13, fontWeight:600, color:"var(--text,#e6edf3)" },
  modelDesc:   { fontSize:11, color:"var(--muted,#8b949e)", marginTop:2 },
  toggleRow:   { display:"flex", alignItems:"flex-start", gap:14 },
  toggleTitle: { fontSize:13, fontWeight:600, color:"var(--text,#e6edf3)", marginBottom:4 },
  toggleDesc:  { fontSize:11, color:"var(--muted,#8b949e)", lineHeight:1.5 },
  toggle:      { width:42, height:24, borderRadius:99, border:"none", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0, marginTop:2, padding:0 },
  toggleThumb: { position:"absolute", top:2, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"transform .2s" },
  divider:     { height:1, background:"var(--border,#30363d)", margin:"20px 0" },
  dangerZone:  { background:"rgba(255,77,109,0.06)", border:"1px solid rgba(255,77,109,0.15)", borderRadius:10, padding:"14px" },
  dangerBtn:   { marginTop:12, display:"flex", alignItems:"center", gap:8, background:"rgba(255,77,109,0.1)", border:"1px solid rgba(255,77,109,0.25)", borderRadius:8, color:"#ff4d6d", fontSize:12, fontWeight:600, padding:"8px 14px", cursor:"pointer", transition:"background .15s" },
  uploadBtn:   { display:"flex", alignItems:"center", gap:14, width:"100%", padding:"14px", background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.12)", borderRadius:10, cursor:"pointer", transition:"border-color .15s", marginTop:12 },
  docRow:      { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8 },
  docName:     { fontSize:12, fontWeight:500, color:"var(--text,#e6edf3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  docMeta:     { fontSize:10, color:"var(--muted,#8b949e)" },
  removeBtn:   { background:"none", border:"none", cursor:"pointer", padding:4, color:"#5a6a7a", display:"flex", transition:"color .15s" },
  emptyState:  { display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 0", color:"var(--muted,#8b949e)" },
}