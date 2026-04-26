'use client';

import React from "react";
import { useChat } from "@sharedUI/context/ChatContext";
import TopBarLogo from "../logo/TopBarLogo";
import IconNav from "../IconNavigation";
// import StatusDot from "../StatusDot";

export default function TopPanel() {
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
      <IconNav/>
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
  liveBadge: {
    background: "rgba(0,212,200,.1)",
    border: "1px solid rgba(0,212,200,.3)",
    color: "var(--teal)",
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    padding: "3px 10px",
    borderRadius: 99,
    letterSpacing: 1,
    flexShrink: 0,
  },
};