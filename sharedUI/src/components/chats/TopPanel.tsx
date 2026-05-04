'use-client'
import React from "react"
import { useChat } from "@sharedUI/context/ChatContext"
import HamburgerIcon from "@sharedUI/components/chats/HamburgerIcon"
import NavDropDown from "@sharedUI/components/buttons/KebabNavigationButton"

interface TopPanelProps {
  isLeftPanelOpen:   boolean
  onToggleLeftPanel: () => void
}

export default function TopPanel({ isLeftPanelOpen, onToggleLeftPanel }: TopPanelProps) {
  const { activeSession } = useChat()

  return (
    <div style={S.topbar}>
      {/* Hamburger — also toggles LeftPanel */}
      <HamburgerIcon isOpen={isLeftPanelOpen} onClick={onToggleLeftPanel} />

      {/* Session title */}
      <span style={S.sessionTitle}>
        {activeSession
          ? activeSession.title.length > 28
            ? activeSession.title.slice(0, 28) + "…"
            : activeSession.title
          : "Chat Baru"}
      </span>

      {/* Right group: status + nav menu */}
      <div style={S.rightGroup}>
        {/* <StatusDot showLabel={false} /> */}
        {/* NavDropDown owns all navigation logic internally */}
        <NavDropDown onToggleLeftPanel={onToggleLeftPanel} />
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  topbar: {
    height:       60,
    minHeight:    60,
    background:   "var(--panel)",
    borderBottom: "1px solid var(--border)",
    display:      "flex",
    alignItems:   "center",
    padding:      "0 16px",
    gap:          10,
    flexShrink:   0,
    position:     "relative",
    zIndex:       10,
  },
  sessionTitle: {
    flex:         1,
    fontSize:     12,
    color:        "var(--muted)",
    fontFamily:   "var(--font-mono, monospace)",
    whiteSpace:   "nowrap",
    overflow:     "hidden",
    textOverflow: "ellipsis",
  },
  rightGroup: {
    display:    "flex",
    alignItems: "center",
    gap:        8,
    flexShrink: 0,
  },
}