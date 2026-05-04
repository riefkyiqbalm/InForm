"use client";

import React, { useState } from "react";
import { useToast } from "@sharedUI/context/ToastContext";
import Icon from "@sharedUI/components/IconStyles";
import Modal from "@sharedUI/components/Modal"; // Pastikan path ini benar sesuai struktur folder Anda
import { useAuth } from "@/context/AuthContext";


interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Mock data sesi
const MOCK_SESSIONS: Session[] = [
  { id: "1", device: "Windows PC", browser: "Chrome", location: "Jakarta, ID", lastActive: "Sekarang", isCurrent: true },
  { id: "2", device: "iPhone 13", browser: "Safari", location: "Bandung, ID", lastActive: "2 jam lalu", isCurrent: false },
];

export default function SecurityTab() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  
  // State untuk Modal Konfirmasi
  const [isLogoutAllModalOpen, setIsLogoutAllModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutOther, setIsLogoutOther] = useState(false);

  const confirmRevokeSingle = (id: string) => {
     if (!confirm("Cabut sesi ini?")) return;
    
    try {
      // TODO: Panggil API revoke session spesifik
      // await fetch('/api/auth/sessions/' + id, { method: 'DELETE' });
      
      setSessions(prev => prev.filter(s => s.id !== id));
      toast("Sesi berhasil dicabut", "success");
    } catch (err) {
      toast("Gagal mencabut sesi", "error");
    }
  };
   const handleRevokeSession = async () => {
     setIsLogoutAllModalOpen(true);
  };

  const handleLogoutAllRequest = () => {
    // Hanya buka modal, jangan langsung logout
    setIsLogoutAllModalOpen(true);
  };

  const confirmLogoutAll = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Panggil API Backend untuk revoke semua sesi lain
      const res = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        // Token biasanya otomatis terkirim via cookies atau perlu ditambahkan manual
      });

      if (!res.ok) throw new Error("Gagal menghubungi server");

      // 2. Update UI: Hapus semua sesi kecuali yang sedang aktif
      setSessions(prev => prev.filter(s => s.isCurrent));
      
      toast("Berhasil keluar dari semua perangkat lain", "success");
      setIsLogoutAllModalOpen(false);
      
    } catch (err) {
      console.error(err);
      toast("Terjadi kesalahan saat keluar dari perangkat lain", "error");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div style={S.container}>
      {/* List Sesi Aktif */}
      <div style={S.card}>
        <div style={S.header}>
          <Icon name="device" size={20} />
          <div>
            <h3 style={S.title}>Perangkat Terhubung</h3>
            <p style={S.subtitle}>Kelola perangkat yang memiliki akses ke akun Anda.</p>
          </div>
        </div>

      <div style={{ ...S.card, marginTop: "24px" }}>
        <h3 style={S.listTitle}>Perangkat Lain</h3>
        {sessions.filter(s => !s.isCurrent).length === 0 ? (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>Tidak ada perangkat lain yang terhubung.</p>
        ) : (
          <div style={S.list}>
            {sessions.filter(s => !s.isCurrent).map((session) => (
              <div key={session.id} style={S.listItem}>
                <div style={S.listInfo}>
                  <div style={S.listName}>{session.device} • {session.browser}</div>
                  <div style={S.listMeta}>{session.location} • Terakhir aktif: {session.lastActive}</div>
                </div>
                
                <button 
                  onClick={() => handleRevokeSession()} 
                  disabled={sessions.filter(s => !s.isCurrent).length === 0}
                  style={S.dangerTextBtn}
                >
                 <Icon name="red-logout"size={14} invert={false}/>Keluar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TOMBOL KELUAR DARI SEMUA PERANGKAT */}
        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
          <button 
            onClick={handleLogoutAllRequest} 
            disabled={sessions.filter(s => !s.isCurrent).length === 0}
            style={{
              ...S.dangerBtn,
              opacity: sessions.filter(s => !s.isCurrent).length === 0 ? 0.5 : 1,
              cursor: sessions.filter(s => !s.isCurrent).length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <Icon name="red-warning" size={16} invert= {false} />
            Keluar dari semua perangkat lain
          </button>
        </div>
      </div>

      {/* MODAL KONFIRMASI */}
      <Modal
        isOpen={isLogoutAllModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutAllModalOpen(false)}
        onConfirm={confirmLogoutAll}
        message="Apakah Anda yakin ingin keluar dari semua perangkat lain? Sesi di perangkat ini akan tetap aktif."
        isLoading={isLoggingOut}
        isConfirmDisabled={false}
      />
    </div>
    </div>
  );
}


const S: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column" },
  card: { background: "var(--panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" },
  listTitle: { fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" },
  listInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  listName: { fontWeight: 600, color: "var(--text)" },
  listMeta: { fontSize: "12px", color: "var(--muted)" },
  dangerTextBtn: { background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "14px", fontWeight: 500, display:"flex", gap:"8px" },
  dangerBtn: {
    width: "100%",
    padding: "12px",
    background: "rgba(255, 77, 109, 0.1)",
    border: "1px solid rgba(255, 77, 109, 0.3)",
    color: "var(--red)",
    borderRadius: "8px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
  },
};