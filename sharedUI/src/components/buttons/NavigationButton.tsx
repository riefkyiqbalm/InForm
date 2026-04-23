// components/buttons/NavigationButton.tsx
// Nav dropdown wired to all 4 actions:
//   dashboard    → opens localhost:3000/dashboard in new browser tab
//   conversation → calls onToggleLeftPanel (opens LeftPanel in sidepanel)
//   settings     → opens SettingsModal in-panel (no routing needed)
//   logout       → clears auth from chrome.storage.local → NetworkGuard shown

import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Icon from "@sharedUI/components/IconStyles"
import SettingsModal from "@sharedUI/components/SettingsModal"
import { useAuth } from "@sharedUI/context/AuthContext"

const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000"

// ── Menu item definition ───────────────────────────────────────────────────────
interface NavItem {
  key:     "dashboard" | "conversation" | "settings" | "logout"
  icon:    string
  label:   string
  danger?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",    icon: "white-grid",     label: "Dashboard"          },
  { key: "conversation", icon: "white-chat",     label: "Percakapan"         },
  { key: "settings",     icon: "white-settings", label: "Pengaturan"         },
  { key: "logout",       icon: "red-logout",   label: "Keluar", danger: true },
]

// ── Props ──────────────────────────────────────────────────────────────────────
interface NavDropDownProps {
  /** Called when "conversation" is selected — toggles LeftPanel in sidepanel */
  onToggleLeftPanel: () => void
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function NavDropDown({ onToggleLeftPanel }: NavDropDownProps) {
  const { logout } = useAuth()

  const [isOpen,       setIsOpen]       = useState(false)
  const [coords,       setCoords]       = useState({ top: 0, left: 0 })
  const [settingsOpen, setSettingsOpen] = useState(false)

  const triggerRef  = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ── Position ───────────────────────────────────────────────────────────────
  const updateCoords = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuW = dropdownRef.current?.offsetWidth ?? 160
    setCoords({
      top:  rect.bottom + window.scrollY + 6,
      left: rect.right  + window.scrollX - menuW,
    })
  }

  useLayoutEffect(() => { if (isOpen) updateCoords() }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const outside = (e: MouseEvent) => {
      if (
        dropdownRef.current  && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current   && !triggerRef.current.contains(e.target as Node)
      ) setIsOpen(false)
    }
    const repos = () => updateCoords()
    document.addEventListener("mousedown", outside)
    window.addEventListener("scroll", repos, true)
    window.addEventListener("resize", repos)
    return () => {
      document.removeEventListener("mousedown", outside)
      window.removeEventListener("scroll", repos, true)
      window.removeEventListener("resize", repos)
    }
  }, [isOpen])

  // ── Action handler ─────────────────────────────────────────────────────────
  const handleAction = (key: NavItem["key"]) => {
    setIsOpen(false)

    switch (key) {
      // Opens the website dashboard in a new browser tab
      case "dashboard":
        chrome.tabs.create({ url: `${NEXTJS_BASE}/dashboard` })
        break

      // Toggles the LeftPanel drawer inside the sidepanel
      case "conversation":
        onToggleLeftPanel()
        break

      // Opens the settings modal inside the sidepanel (no routing)
      case "settings":
        setSettingsOpen(true)
        break

      // Clears auth → AuthContext sets user=null → SidePanelContent renders NetworkGuard
      case "logout":
        logout()
        break
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((o) => !o)}
        style={{
          ...S.trigger,
          background: isOpen ? "rgba(255,255,255,0.08)" : "none",
        }}
        title="Menu"
      >
        <Icon name="white-menu-kebab" size={16}  />
      </button>

      {/* Dropdown portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ ...S.panel, top: coords.top, left: coords.left }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              style={{ ...S.item, color: item.danger ? "#ff4d6d" : "#e2e8f0" }}
              onClick={() => handleAction(item.key)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.danger
                  ? "rgba(255,77,109,0.1)"
                  : "rgba(255,255,255,0.06)"
              }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
            >
              <span style={S.itemIcon}>
                <Icon name={item.icon} size={15} invert = {false}  />
              </span>
              <span style={S.itemLabel}>{item.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Settings modal — rendered inside the sidepanel tree */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  trigger: {
    border:         "none",
    borderRadius:   6,
    padding:        "5px 6px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    cursor:         "pointer",
    transition:     "background .15s",
    color:          "#94a3b8",
  },
  panel: {
    position:      "absolute",
    background:    "#1a2236",
    border:        "1px solid rgba(255,255,255,0.1)",
    borderRadius:  10,
    boxShadow:     "0 10px 28px -4px rgba(0,0,0,0.5)",
    zIndex:        9999,
    minWidth:      160,
    padding:       "4px",
    pointerEvents: "auto",
  },
  item: {
    width:        "100%",
    padding:      "9px 12px",
    display:      "flex",
    alignItems:   "center",
    gap:          10,
    background:   "none",
    border:       "none",
    cursor:       "pointer",
    textAlign:    "left",
    borderRadius: 7,
    transition:   "background .15s",
  },
  itemIcon: {
    display:    "flex",
    alignItems: "center",
    opacity:    0.85,
    flexShrink: 0,
  },
  itemLabel: {
    fontSize:   13,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
}