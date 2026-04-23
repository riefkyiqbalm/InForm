import React, { useState } from "react";
import { useChat } from "~features/ChatContext";
import { useToast } from "~features/ToastContext";
import DropDown from "@sharedUI/components/buttons/ActionButton";
import Modal, { RenameModal } from "@sharedUI/components/Modal";
import Icon from "../../../sharedUI/src/components/IconStyles";

interface ChatListProps {
  isOpen: boolean;
}

// ── Reusable Pin SVG ────────────────────────────────────────────────────────
const PinIcon = ({ className = "w-4 h-4", filled = false }: { className?: string; filled?: boolean }) => (
  <Icon name="pin" size={20}></Icon>
);

export default function ChatList({ isOpen }: ChatListProps) {
  const { sessions, activeSessionId, setActiveSession, deleteSession, renameSession, pinSession } = useChat();
  const { toast } = useToast();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingRenameId, setPendingRenameId] = useState<string | null>(null);
  const [pendingRenameTitle, setPendingRenameTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [pinningId, setPinningId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (sessionId: string, type: string) => {
    if (type === "delete") setPendingDeleteId(sessionId);
    if (type === "rename") {
      const session = sessions.find((s) => s.id === sessionId);
      setPendingRenameTitle(session?.title ?? "");
      setPendingRenameId(sessionId);
    }
    if (type === "pin") handlePin(sessionId);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteSession(pendingDeleteId);
      toast("Sesi berhasil dihapus.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal menghapus sesi.", "error");
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  };

  const handleConfirmRename = async (newTitle: string) => {
    if (!pendingRenameId || isRenaming) return;
    setIsRenaming(true);
    try {
      await renameSession(pendingRenameId, newTitle);
      toast("Nama sesi diperbarui.", "success");
      setPendingRenameId(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal mengganti nama.", "error");
    } finally {
      setIsRenaming(false);
    }
  };

  const handlePin = async (sessionId: string) => {
    if (pinningId) return;
    setPinningId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    const wasPinned = Boolean(session?.pinnedAt);
    try {
      await pinSession(sessionId);
      toast(wasPinned ? "Sesi di-unpin." : "Sesi di-pin.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Gagal mengubah pin.", "error");
    } finally {
      setPinningId(null);
    }
  };

  return (
    <>
      <div style={S.list}>
        {sessions.length === 0 ? (
          <p style={S.empty}>BELUM ADA SESI.</p>
        ) : (
          sessions.map((session) => {
            const isPinned = Boolean(session.pinnedAt);
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                style={{
                  ...S.item,
                  ...(isActive ? S.itemActive : S.itemInactive),
                }}
              >
                {/* ── SVG Pin Indicator ──────────────────────────────────── */}
                {isPinned && (
                  <div style={S.pinIconWrapper} title="Disematkan">
                    <Icon name="white-pin" size={14}/>
                  </div>
                )}

                <button
                  onClick={() => setActiveSession(session.id)}
                  style={S.itemButton}
                  title={session.title}
                >
                  {session.title}
                </button>

                <DropDown
                  actions={["pin", "rename", "delete"]}
                  actionLabels={{ pin: isPinned ? "Unpin" : "Pin" }}
                  onAction={(type) => handleAction(session.id, type)}
                  align={isOpen ? "left" : "right"}
                  disabled={pinningId === session.id}
                />
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        message="Apakah Anda yakin ingin menghapus sesi ini? Semua pesan di dalamnya akan ikut terhapus."
      />

      <RenameModal
        isOpen={pendingRenameId !== null}
        currentTitle={pendingRenameTitle}
        onClose={() => setPendingRenameId(null)}
        onConfirm={handleConfirmRename}
        isLoading={isRenaming}
      />
    </>
  );
}

const S: Record<string, React.CSSProperties> = {
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
    overflowY: "hidden",
  },
  empty: {
    color: "#5a7a99",
    fontSize: 12,
    fontFamily: "Space Mono, monospace",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    padding: "8px 8px 4px",
  },
  item: {
    padding: "9px 12px",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "all .15s",
    gap: 8,
  },
  itemActive: {
    background: "var(--card)",
    color: "var(--teal)",
    borderLeft: "2px solid var(--teal)",
  },
  itemInactive: {
    color: "#5a7a99",
  },
  pinIconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
    color: "inherit", // Matches the text color of active/inactive state
  },
  itemButton: {
    textAlign: "left",
    flex: 1,
    background: "none",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    padding: 0,
  },
};

