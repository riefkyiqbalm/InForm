'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@sharedUI/context/SharedAuthContext";
import HamburgerIcon from "@sharedUI/components/chats/HamburgerIcon";
import NewChatButton from "@sharedUI/components/buttons/NewButton";
import ChatList from "@sharedUI/components/chats/ChatList"; 
import SidebarFooter from "@/components/chats/LeftFooter";

export default function LeftPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration fix untuk menghindari mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <aside style={{
      ...S.sidebar, 
      width: isOpen ? 280 : 70,
    }}>
      <div style={S.container}>
        {/* Header */}
        <div style={S.header} className="custom-scroll">
          <HamburgerIcon 
            isOpen={isOpen} 
            onClick={() => setIsOpen(!isOpen)} 
          />
          <div style={{
            ...S.titleContainer, 
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateX(0)" : "translateX(-10px)",
            pointerEvents: isOpen ? "auto" : "none"
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
          flex: 1
        }}>
          <NewChatButton isOpen={isOpen} />
          <ChatList isOpen={isOpen} />
          <SidebarFooter isOpen={isOpen} />
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
    transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  container: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: 280,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    minHeight: 40,
  },
  titleContainer: {
    flex: 1,
    transition: "all 0.3s ease-in-out",
    whiteSpace: "nowrap",
  },
  title: { fontWeight: "bold", fontSize: 18, color: "var(--text)" },
  subtitle: { fontSize: 14, color: "var(--muted)" },
};