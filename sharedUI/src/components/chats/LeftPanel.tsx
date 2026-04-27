'use-client'
import React, { useState, useEffect } from "react";
import { useAuth } from "@sharedUI/context/ListeningAuthContext";
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
      width: isOpen ? 280 : 0, // Diubah ke 0 atau 70 sesuai preferensi
      opacity: isOpen ? 1 : 0,  // Tambahkan efek fade agar lebih halus
      visibility: isOpen ? "visible" : "hidden",
    }}>
      <div style={{...S.container, width: 280}}>
        {/* Header */}
        <div style={S.header}>
          <HamburgerIcon 
            isOpen={isOpen} 
            onClick={() => setIsOpen(false)} 
            
          />
          <div style={{
            ...S.titleContainer, 
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateX(0)" : "translateX(-10px)",
          }}>
            <div style={S.title}>InFormm</div>
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
          overflow: "hidden" // Mencegah konten meluber saat transisi width
        }}>
          <NewChatButton isOpen={isOpen} />
          <ChatList isOpen={isOpen} />
        </div>
      </div>
    </aside>
  );
}

const S: Record<string, React.CSSProperties> = {
  sidebar: {
    background: "rgb(15, 23, 42)",
    color: "white",
    height: "100vh",
    borderRight: "1px solid rgb(55, 65, 81)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "absolute", // Agar melayang (overlay) di atas chat
    left: 0,
    top: 0,
    zIndex: 100, // Supaya di atas elemen lain
  },
  container: {
    padding: '10px 16px',
    display: "flex",
    flexDirection: "column",
    height: "100%",
    // Jangan set width fixed di sini agar mengikuti lebar parent saat animasi
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
  title: { 
    fontWeight: "bold", 
    fontSize: 18 
  },
  subtitle: { 
    fontSize: 14, 
    color: "rgb(148, 163, 184)" 
  },
};