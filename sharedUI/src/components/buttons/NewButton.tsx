import { useChat } from "~features/ChatContext";
import React, { useState } from "react";
import Icon from "../IconStyles";

export default function NewChatButton({ isOpen }: { isOpen: boolean }) {
  const { createSession } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await createSession();
    } catch (error) {
      console.error("Gagal membuat sesi baru:", error);
      // Kamu bisa tambahkan toast di sini nanti jika punya ToastContext
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <button 
      onClick={handleNewChat} 
      disabled={isLoading}
      style={{
        ...S.newChatBtn,
        opacity: isLoading ? 0.7 : 1,
        cursor: isLoading ? "not-allowed" : "pointer",
      }}
    >
      {isLoading ? (
        <>
        <Icon name="white-loading" size={18}  /> Membuat Chat Baru...
        </>
      ) : (
        <>
          <Icon name="white-new-chat" size={18}/> New Chat
        </>
      )}
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  newChatBtn: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 12,
    background: "linear-gradient(135deg, var(--teal-dim), #004f6e)",
    borderRadius: 6,
    color: "white",
    border: "none",
    cursor: "pointer",
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    transition: "all .2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
};