"use client";

import React, { useState } from "react";
import { useToast } from "@sharedUI/context/ToastContext";
import Icon from "@sharedUI/components/IconStyles";

// Mock data - replace with real API calls
const MOCK_KEYS = [
  { id: "1", name: "Production Key", prefix: "sk_live_...", created: "2023-10-01" },
  { id: "2", name: "Development Key", prefix: "sk_test_...", created: "2023-11-15" },
];

export default function ApiKeyTab() {
  const { toast } = useToast();
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newKeyName.trim()) {
      toast("Nama kunci diperlukan", "error");
      return;
    }
    // Simulate API generation
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(newKey);
    setKeys([...keys, { id: Date.now().toString(), name: newKeyName, prefix: newKey.substring(0, 10) + "...", created: new Date().toISOString().split('T')[0] }]);
    setNewKeyName("");
    toast("Kunci API berhasil dibuat", "success");
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast("Kunci disalin ke clipboard", "success");
  };

  const handleRevoke = (id: string) => {
    if (confirm("Apakah Anda yakin ingin mencabut kunci ini? Tindakan ini tidak dapat dibatalkan.")) {
      setKeys(keys.filter(k => k.id !== id));
      toast("Kunci API dicabut", "warn");
    }
  };

  return (
    <div style={S.container}>
      {/* Create Section */}
      <div style={S.card}>
        <div style={S.header}>
          <Icon name="plus" size={20} />
          <div>
            <h3 style={S.title}>Buat Kunci API Baru</h3>
            <p style={S.subtitle}>Gunakan kunci ini untuk mengakses API InForm secara programatik.</p>
          </div>
        </div>

        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} style={S.primaryBtn}>
            + Buat Kunci API
          </button>
        ) : (
          <div style={S.form}>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Nama Kunci (e.g., Production Server)"
              style={S.input}
              autoFocus
            />
            <div style={S.formActions}>
              <button onClick={handleCreate} style={S.primaryBtn}>Generate</button>
              <button onClick={() => setShowCreate(false)} style={S.secondaryBtn}>Batal</button>
            </div>
          </div>
        )}

        {generatedKey && (
          <div style={S.warningBox}>
            <Icon name="alert" size={20} />
            <div>
              <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Simpan kunci ini sekarang!</p>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "8px" }}>
                Anda tidak akan bisa melihatnya lagi setelah menutup dialog ini.
              </p>
              <div style={S.keyDisplay}>
                <code style={{ flex: 1, wordBreak: "break-all" }}>{generatedKey}</code>
                <button onClick={() => handleCopy(generatedKey)} style={S.copyBtn}>Salin</button>
              </div>
              <button onClick={() => setGeneratedKey(null)} style={S.doneBtn}>Saya Sudah Menyimpan</button>
            </div>
          </div>
        )}
      </div>

      {/* List Section */}
      <div style={{ ...S.card, marginTop: "24px" }}>
        <h3 style={S.listTitle}>Kunci Aktif</h3>
        {keys.length === 0 ? (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>Belum ada kunci API.</p>
        ) : (
          <div style={S.list}>
            {keys.map((key) => (
              <div key={key.id} style={S.listItem}>
                <div style={S.listInfo}>
                  <div style={S.listName}>{key.name}</div>
                  <div style={S.listMeta}>
                    <span style={S.badge}>{key.prefix}</span>
                    <span style={{ color: "var(--muted)", fontSize: "12px" }}>Dibuat: {key.created}</span>
                  </div>
                </div>
                <div style={S.listActions}>
                  <button onClick={() => handleCopy("full_key_placeholder")} style={S.iconBtn} title="Salin Kunci">
                    <Icon name="copy" size={16} />
                  </button>
                  <button onClick={() => handleRevoke(key.id)} style={{ ...S.iconBtn, color: "var(--red)" }} title="Cabut Kunci">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column" },
  card: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
  },
  header: { display: "flex", gap: "16px", marginBottom: "20px" },
  title: { fontSize: "16px", fontWeight: 600, color: "var(--text)", margin: 0 },
  subtitle: { fontSize: "13px", color: "var(--muted)", margin: "4px 0 0 0" },
  primaryBtn: {
    background: "var(--teal)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    color: "var(--muted)",
    border: "1px solid var(--border)",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    marginLeft: "8px",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px",
    color: "var(--text)",
    fontSize: "14px",
  },
  formActions: { display: "flex" },
  warningBox: {
    marginTop: "20px",
    padding: "16px",
    background: "rgba(245, 200, 66, 0.1)",
    border: "1px solid rgba(245, 200, 66, 0.3)",
    borderRadius: "8px",
    display: "flex",
    gap: "12px",
  },
  keyDisplay: {
    display: "flex",
    gap: "8px",
    background: "var(--bg)",
    padding: "8px",
    borderRadius: "6px",
    marginTop: "8px",
    alignItems: "center",
  },
  copyBtn: {
    background: "var(--teal)",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    cursor: "pointer",
  },
  doneBtn: {
    marginTop: "12px",
    background: "transparent",
    border: "none",
    color: "var(--muted)",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "12px",
  },
  listTitle: { fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "var(--card)",
    borderRadius: "8px",
    border: "1px solid var(--border)",
  },
  listInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  listName: { fontWeight: 600, color: "var(--text)" },
  listMeta: { display: "flex", gap: "12px", alignItems: "center" },
  badge: {
    background: "rgba(0, 212, 200, 0.1)",
    color: "var(--teal)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: "monospace",
  },
  listActions: { display: "flex", gap: "8px" },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "var(--muted)",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
  },
};