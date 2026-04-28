// components/buttons/AttachButton.tsx
// FIXED:
//   - Duplicate check: blocks same filename only within current upload batch,
//     NOT across different messages (same name OK in different messages)
//   - workingDocs built fresh from loadDocs() each upload so SettingsModal
//     changes are always visible
//   - Toast fires correctly including on duplicate within batch

"use client"
import React, { useState, useRef, useEffect, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import Icon from "@sharedUI/components/IconStyles"
import { useToast } from "@sharedUI/context/ToastContext"
import { loadDocs, saveDocs } from "@sharedUI/components/SettingsModal"
import type { StoredDoc } from "../SettingsModal"
import type { InputMode } from "@sharedUI/types"
import Cookies from "js-cookie"; // Pastikan sudah install js-cookie

interface AttachFileProps {
  onAction:      (type: InputMode, docs?: StoredDoc[]) => void
  actions:       InputMode[]
  align?:        "left" | "right"
  actionLabels?: Partial<Record<InputMode, string>>
  disabled?:     boolean
}

const DEFAULT_LABELS: Record<InputMode, string> = {
  text: "Text", foto: "Foto", document: "Dokumen", video: "Video",
}

const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000"
const KEY_TOKEN   = "_auth_token"
const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome.storage;

async function getToken(): Promise<string | null> {
  if (IS_EXTENSION) {
    try {
      const result = await chrome.storage.local.get(KEY_TOKEN);
      return (result[KEY_TOKEN] as string) || null;
    } catch {
      return null;
    }
  } else {
    // WEBSITE: Ambil dari cookie agar sinkron dengan ChatContext
    return Cookies.get(KEY_TOKEN) || null;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024)    return `${bytes} B`
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1048576).toFixed(1)} MB`
}

const ACCEPT_MAPPING: Record<string, string> = {
  foto:     "image/*",
  video:    "video/*",
  document: ".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.md,.json,.csv",
}

export default function AttachFile({
  onAction, actions, align = "right", actionLabels = {}, disabled = false,
}: AttachFileProps) {
  const { toast }      = useToast()
  const [isOpen,     setIsOpen]     = useState(false)
  const [isHovered,  setIsHovered]  = useState(false)
  const [coords,     setCoords]     = useState({ top: 0, left: 0 })
  const [uploading,  setUploading]  = useState(false)
  const [acceptType, setAcceptType] = useState("*/*")

  const triggerRef  = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateCoords = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({ top: rect.top + window.scrollY, left: rect.left + window.scrollX })
  }

  useLayoutEffect(() => { if (isOpen) updateCoords() }, [isOpen])

  useEffect(() => {
    const h = () => { if (isOpen) updateCoords() }
    window.addEventListener("resize", h)
    return () => window.removeEventListener("resize", h)
  }, [isOpen])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node))
        setIsOpen(false)
    }
    if (isOpen) document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [isOpen])

  const handleMenuClick = (type: InputMode) => {
    setIsOpen(false)
    if (type === "text") { onAction(type); return }
    setAcceptType(ACCEPT_MAPPING[type as string] || "*/*")
    setTimeout(() => { if (fileInputRef.current && !uploading) fileInputRef.current.click() }, 50)
    onAction(type)
  }

  // ── Upload handler ─────────────────────────────────────────────────────────
  // Duplicate check: only within THIS batch (same file selected twice).
  // Same filename in different messages is allowed — each creates a new DB record.
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return

    setUploading(true)

    // Track names seen only within this batch to catch multi-select duplicates
    const batchNames = new Set<string>()

    // Read fresh from localStorage (picks up any SettingsModal uploads)
    let workingDocs = loadDocs()
    const newlyUploaded: StoredDoc[] = []

    for (const file of files) {
      // Only block duplicates within the current batch (multi-file select)
      if (batchNames.has(file.name)) {
        toast(`"${file.name}" dipilih dua kali dalam batch ini`, "warn")
        continue
      }
      batchNames.add(file.name)

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
        newlyUploaded.push(newDoc)
        toast(`"${file.name}" berhasil diunggah`, "success")

      } catch {
        toast(`Error pada file "${file.name}"`, "error")
      }
    }

    // Persist to localStorage (SettingsModal reads this on next open)
    saveDocs(workingDocs)
    setUploading(false)

    // Notify parent with newly uploaded docs so chat can use them
    if (newlyUploaded.length > 0) {
      onAction("document", newlyUploaded)
    }
  }

  return (
    <>
      <input ref={fileInputRef} type="file" multiple accept={acceptType}
        style={{ display:"none" }} onChange={handleFiles} />

      <button ref={triggerRef}
        onClick={() => !disabled && !uploading && setIsOpen((o) => !o)}
        onMouseEnter={() => !disabled && !uploading && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled || uploading}
        style={{
          ...S.attachBtn,
          ...(isHovered && !uploading ? S.attachBtnHover : {}),
          ...(isOpen ? { background:"rgba(0,0,0,0.1)", color:"var(--teal)" } : {}),
          opacity: uploading ? 0.7 : 1,
        }}
        type="button"
        title={uploading ? "Sedang mengunggah..." : "Lampirkan file"}
      >
        {uploading ? <div style={S.spinner} /> : <Icon name="white-attach" size={24} />}
      </button>

      {isOpen && !uploading && createPortal(
        <div ref={dropdownRef} style={{
          ...S.dropup,
          top:  coords.top - 10,
          left: align === "right" ? coords.left + 42 : coords.left,
          transform: align === "right" ? "translate(-100%,-100%)" : "translate(0,-100%)",
        }}>
          {actions.map((type) => {
            const label    = actionLabels[type] || DEFAULT_LABELS[type] || type
            const iconName = `white-${type}`
            return (
              <button key={type} onClick={() => handleMenuClick(type)} style={S.menuItem}
                onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}>
                <span style={S.iconWrapper}><Icon name={iconName} size={16} /></span>
                <span style={{ fontSize:13, fontWeight:500 }}>{label}</span>
              </button>
            )
          })}
        </div>,
        document.body
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </>
  )
}

const S: Record<string, React.CSSProperties> = {
  attachBtn:      { width:42, height:42, border:"none", background:"transparent", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s ease", color:"var(--muted)" },
  attachBtnHover: { background:"var(--border)", transform:"scale(1.05)", color:"var(--text)" },
  dropup:         { position:"absolute", background:"#1a2236", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, boxShadow:"0 -10px 25px -5px rgba(0,0,0,0.4)", zIndex:9999, minWidth:140, padding:4 },
  menuItem:       { display:"flex", alignItems:"center", width:"100%", padding:"8px 12px", gap:10, background:"transparent", border:"none", color:"#fff", cursor:"pointer", borderRadius:6, textAlign:"left", transition:"background 0.2s" },
  iconWrapper:    { display:"flex", alignItems:"center", justifyContent:"center", width:24, color:"var(--teal)" },
  spinner:        { width:20, height:20, border:"2px solid #30363d", borderTop:"2px solid #00d4c8", borderRadius:"50%", animation:"spin .7s linear infinite" },
}