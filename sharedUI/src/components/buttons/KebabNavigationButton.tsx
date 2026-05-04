'use-client'
import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

/**
 * PENTING: Jika alias @sharedUI tidak terdeteksi di lingkungan lokal,
 * pastikan tsconfig.json atau webpack/vite config sudah memiliki alias tersebut.
 * Di sini kita tetap menggunakan alias sesuai permintaan awal.
 */
import Icon from "@sharedUI/components/IconStyles"
import SettingsModal from "@sharedUI/components/SettingsModal"
import { useAuth } from "@sharedUI/context/SharedAuthContext"

const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000"

interface NavItem {
  key:     "pengaturan" | "keluar"
  icon:    string
  label:   string
  danger?: boolean
  invertIcon: boolean
}

const NAV_ITEMS: NavItem[] = [
  { key: "pengaturan",    icon: "white-gear",   label: "Pengaturan",  invertIcon: true },
  { key: "keluar",        icon: "red-logout",   label: "Keluar",      danger: true, invertIcon: false },
]

interface NavDropDownProps {
  onToggleLeftPanel?: () => void
}

export default function NavDropDown({ onToggleLeftPanel }: NavDropDownProps) {
  // Hook useAuth sekarang bersifat universal (bisa digunakan di Web & Extension)
  const { logout } = useAuth()

  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [settingsOpen, setSettingsOpen] = useState(false)

  const triggerRef  = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Menghitung posisi dropdown agar tepat di bawah tombol trigger
  const updateCoords = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuW = dropdownRef.current?.offsetWidth ?? 160
    setCoords({
      top:  rect.bottom + window.scrollY + 6,
      left: rect.right  + window.scrollX - menuW,
    })
  }

  useLayoutEffect(() => {
    if (isOpen) updateCoords()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleResize = () => updateCoords()

    document.addEventListener("mousedown", handleOutsideClick)
    window.addEventListener("scroll", handleResize, true)
    window.addEventListener("resize", handleResize)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      window.removeEventListener("scroll", handleResize, true)
      window.removeEventListener("resize", handleResize)
    }
  }, [isOpen])

  const handleAction = (key: NavItem["key"]) => {
    setIsOpen(false)
    if (key === "pengaturan") {
      setSettingsOpen(true)
    } else if (key === "keluar") {
      logout()
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((o) => !o)}
        style={{
          ...S.trigger,
          background: isOpen ? "rgba(255,255,255,0.08)" : "none",
        }}
        title="Menu"
      >
        <Icon name="white-menu-kebab" size={16} />
      </button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef} 
          style={{ ...S.panel, top: coords.top, left: coords.left }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              style={{ ...S.item, color: item.danger ? "var(--red)" : "var(--text)" }}
              onClick={() => handleAction(item.key)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.danger ? "rgba(255,77,109,0.1)" : "rgba(128,128,128,0.08)"
              }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
            >
              <span style={S.itemIcon}>
                <Icon name={item.icon} size={14} invert={item.invertIcon} />
              </span>
              <span style={S.itemLabel}>{item.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </>
  )
}

const S: Record<string, React.CSSProperties> = {
  trigger: {
    border: "none",
    borderRadius: 6,
    padding: "5px 6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background .15s",
    color: "var(--muted)",
    background: "none",
  },
  panel: {
    position: "absolute",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    boxShadow: "0 10px 28px -4px rgba(0,0,0,0.4)",
    zIndex: 9999,
    minWidth: 160,
    padding: "4px",
    pointerEvents: "auto",
  },
  item: {
    width: "100%",
    padding: "9px 12px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: 7,
    transition: "background .15s",
    color: "var(--text)",
  },
  itemIcon: {
    display: "flex",
    alignItems: "center",
    opacity: 0.85,
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
}