'use client'
import React, { useState, useEffect } from "react";
import { useAuth } from "@sharedUI/context/SharedAuthContext";
import { ThemeToggle } from "@sharedUI/context/ThemeContext";
import HamburgerIcon from "@sharedUI/components/chats/HamburgerIcon";
import NewChatButton from "@sharedUI/components/buttons/NewButton";
import ChatList from "@sharedUI/components/chats/ChatList";

interface LeftPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose: () => void;
}

export default function LeftPanel({ isOpen, setIsOpen, onClose }: LeftPanelProps) {
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <aside style={{
      ...S.sidebar,
      width: isOpen ? 280 : 0,
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? "visible" : "hidden",
    }}>
      <div style={{ ...S.container, width: 280 }}>
        {/* Header */}
        <div style={S.header}>
          <HamburgerIcon isOpen={isOpen} onClick={() => setIsOpen(false)} />
          <div style={{
            ...S.titleContainer,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateX(0)" : "translateX(-10px)",
          }}>
            <div style={S.title}>InForm</div>
            <div style={S.subtitle}>{user?.name || "Guest"}</div>
          </div>
        </div>

        {/* Konten Utama */}
        <div style={{
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}>
          <NewChatButton isOpen={isOpen} />
          <ChatList isOpen={isOpen} />
        </div>

        {/* Footer — theme toggle */}
        <div style={S.footer}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  sidebar: {
    background: "var(--panel)",
    color: "var(--text)",
    height: "100vh",
    borderRight: "1px solid var(--border)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 100,
  },
  container: {
    padding: "10px 16px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    minHeight: 40,
  },
  titleContainer: {
    flex: 1,
    transition: "all 0.3s ease-in-out",
    whiteSpace: "nowrap",
  },
  title: { fontWeight: "bold", fontSize: 18, color: "var(--text)" },
  subtitle: { fontSize: 14, color: "var(--muted)" },
  footer: {
    paddingTop: 12,
    borderTop: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
};