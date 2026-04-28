'use client';

import React from "react";
import { useChat } from "@sharedUI/context/ChatContext";
import TopBarLogo from "../logo/TopBarLogo";
import Profile from "../Profile";
import KebabNavDropDown from "@sharedUI/components/buttons/KebabNavigationButton"

interface TopPanelProps {
  isLeftPanelOpen:   boolean
  onToggleLeftPanel: () => void
}

export default function TopPanel({ isLeftPanelOpen, onToggleLeftPanel }: TopPanelProps) {
  const { activeSession } = useChat();

  return (
    <div style={S.topbar}>
      <div style={S.topbarComponent}>
        <TopBarLogo />
      </div>
      {activeSession ? (
        <span style={S.sessionTitle}>
          {activeSession.title.length > 36
            ? activeSession.title.slice(0, 36) + "…"
            : activeSession.title}
        </span>
      ) : (
        <span style={S.sessionTitle}>Chat Baru</span>
      )}
      <Profile/>
       <div style={S.rightGroup}>
        {/* <StatusDot showLabel={false} /> */}
        {/* NavDropDown owns all navigation logic internally */}
        <KebabNavDropDown onToggleLeftPanel={onToggleLeftPanel} />
      </div>

    </div>
  );
}

// Styles tetap sama seperti sebelumnya
const S: Record<string, React.CSSProperties> = {
  topbar: {
    height: 60,
    minHeight: 60,
    background: "var(--panel)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 12,
  },
  topbarComponent: {
    fontFamily: "var(--font-head)",
    fontSize: 16,
    fontWeight: 800,
    flex: 1,
  },
  sessionTitle: {
    fontSize: 12,
    color: "var(--muted)",
    fontFamily: "var(--font-mono)",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 280,
  },
  rightGroup: {
    display:    "flex",
    alignItems: "center",
    gap:        8,
    flexShrink: 0,
  },
};