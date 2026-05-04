"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@sharedUI/context/ToastContext";
import Icon from "@sharedUI/components/IconStyles";
import SaveButton from "@sharedUI/components/buttons/SaveButton";
import Cookies from "js-cookie";

export default function SecurityTab() {
  const { changePassword, logout } = useAuth();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Semua kolom kata sandi harus diisi", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Kata sandi baru tidak cocok", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("Kata sandi minimal 6 karakter", "error");
      return;
    }
 
    setLoading(true);
    try {

      const token = Cookies.get("_auth_token");
      const res = await fetch("/api/profile/edit_pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
 
      const data = await res.json().catch(() => ({})) as { error?: string };
 
      if (!res.ok) {
        toast(data.error ?? "Gagal mengubah kata sandi", "error");
        return;
      }
 
      toast("Kata sandi berhasil diubah", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  };
 
  const handleLogoutOthers = async () => {
    try {
      const token = Cookies.get("_auth_token");
      await fetch("/api/user/revoke", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast("Semua sesi lain telah dikeluarkan", "success");
    } catch {
      toast("Gagal mencabut sesi lain", "error");
    }
  };

  return (
    <div style={S.container}>
      <div style={S.section}>
        <div style={S.header}>
          <Icon name="lock" size={20} />
          <div>
            <h3 style={S.title}>Ubah Kata Sandi</h3>
            <p style={S.subtitle}>Pastikan kata sandi baru Anda kuat dan unik.</p>
          </div>
        </div>

        <div style={S.grid}>
          <div style={S.field}>
            <label style={S.label}>Kata Sandi Saat Ini</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={S.input}
              placeholder="••••••••"
            />
          </div>
          <div style={S.field}>
            <label style={S.label}>Kata Sandi Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={S.input}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div style={S.field}>
            <label style={S.label}>Konfirmasi Kata Sandi Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={S.input}
              placeholder="Ulangi kata sandi baru"
            />
          </div>
        </div>

        <div style={S.actions}>
          <SaveButton loading={loading} onClick={handleSave} />
        </div>
      </div>

      <div style={{ ...S.section, marginTop: "24px" }}>
        <div style={S.header}>
          <Icon name="white-shield" size={20} />
          <div>
            <h3 style={S.title}>Sesi Aktif</h3>
            <p style={S.subtitle}>Keluarkan dari semua perangkat lain demi keamanan.</p>
          </div>
        </div>
        <button onClick={handleLogoutOthers} style={S.dangerBtn}>
          Keluar dari Semua Perangkat Lain
        </button>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column" },
  section: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
  },
  header: { display: "flex", gap: "16px", marginBottom: "24px" },
  title: { fontSize: "16px", fontWeight: 600, color: "var(--text)", margin: 0 },
  subtitle: { fontSize: "13px", color: "var(--muted)", margin: "4px 0 0 0" },
  grid: { display: "grid", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" },
  input: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px",
    color: "var(--text)",
    fontSize: "14px",
  },
  actions: { marginTop: "24px", display: "flex", justifyContent: "flex-end" },
  dangerBtn: {
    width: "100%",
    padding: "12px",
    background: "rgba(255, 77, 109, 0.1)",
    border: "1px solid rgba(255, 77, 109, 0.3)",
    color: "var(--red)",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
  },
};