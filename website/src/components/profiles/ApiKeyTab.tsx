"use client";

import React, { useState } from "react";
import { useToast } from "@sharedUI/context/ToastContext";
import Icon from "@sharedUI/components/IconStyles";

// Define supported providers
type ProviderType = "openai" | "anthropic" | "google" | "custom";

interface ApiKeyItem {
  id: string;
  provider: ProviderType;
  modelName: string;
  keyPrefix: string;
  fullKey?: string; // Only stored temporarily in state for display
  created: string;
}

const INITIAL_KEYS: ApiKeyItem[] = [
  { id: "1", provider: "openai", modelName: "GPT-4o", keyPrefix: "sk-proj-...", created: "2023-10-01" },
];

const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI", placeholder: "sk-...", prefix: "sk-" },
  { value: "anthropic", label: "Anthropic (Claude)", placeholder: "sk-ant-...", prefix: "sk-ant-" },
  { value: "google", label: "Google Gemini", placeholder: "AIza...", prefix: "AIza" },
  { value: "custom", label: "Custom Provider", placeholder: "Enter API Key", prefix: "" },
];

export default function ApiKeyTab() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  
  // Form State
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>("openai");
  const [modelName, setModelName] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [generatedKey, setGeneratedKey] = useState<ApiKeyItem | null>(null);

  const handleCreate = () => {
    if (!modelName.trim()) {
      toast("Nama model diperlukan (contoh: Claude 3.5 Sonnet)", "error");
      return;
    }
    if (!apiKeyValue.trim()) {
      toast("Kunci API tidak boleh kosong", "error");
      return;
    }

    const providerData = PROVIDER_OPTIONS.find(p => p.value === selectedProvider);
    
    const newKeyItem: ApiKeyItem = {
      id: Date.now().toString(),
      provider: selectedProvider,
      modelName: modelName.trim(),
      keyPrefix: apiKeyValue.substring(0, 8) + "...",
      fullKey: apiKeyValue, // Store temporarily to show user once
      created: new Date().toISOString().split('T')[0],
    };

    setKeys([...keys, newKeyItem]);
    setGeneratedKey(newKeyItem);
    
    // Reset form
    setModelName("");
    setApiKeyValue("");
    toast("Kunci API berhasil ditambahkan", "success");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Kunci disalin ke clipboard", "success");
  };

  const handleRevoke = (id: string) => {
    if (confirm("Apakah Anda yakin ingin mencabut kunci ini? Aplikasi yang menggunakan kunci ini akan berhenti bekerja.")) {
      setKeys(keys.filter(k => k.id !== id));
      toast("Kunci API dicabut", "warn");
    }
  };

  const getProviderIcon = (provider: ProviderType) => {
    switch(provider) {
      case "openai": return "⚡";
      case "anthropic": return "🤖";
      case "google": return "🔷";
      default: return "🔑";
    }
  };

  return (
    <div style={S.container}>
      {/* Create Section */}
      <div style={S.card}>
        <div style={S.header}>
          <Icon name="white-plus" size={24} />
          <div>
            <h3 style={S.title}>Tambah Kunci API Eksternal</h3>
            <p style={S.subtitle}>Hubungkan model AI lain seperti Claude, Gemini, atau provider kustom.</p>
          </div>
        </div>

        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} style={S.primaryBtn}>
            + Tambah Kunci API Baru
          </button>
        ) : (
          <div style={S.form}>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.label}>Provider</label>
                <select 
                  value={selectedProvider} 
                  onChange={(e) => setSelectedProvider(e.target.value as ProviderType)}
                  style={S.select}
                >
                  {PROVIDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div style={S.formGroup}>
                <label style={S.label}>Nama Model</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Contoh: Claude 3.5 Sonnet"
                  style={S.input}
                />
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Kunci API</label>
              <input
                type="password"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                placeholder={PROVIDER_OPTIONS.find(p => p.value === selectedProvider)?.placeholder}
                style={S.input}
                autoFocus
              />
              <p style={S.hintText}>Kunci Anda disimpan secara lokal dan tidak pernah dikirim ke server kami.</p>
            </div>

            <div style={S.formActions}>
              <button onClick={handleCreate} style={S.primaryBtn}>Simpan Kunci</button>
              <button onClick={() => { setShowCreate(false); setModelName(""); setApiKeyValue(""); }} style={S.secondaryBtn}>Batal</button>
            </div>
          </div>
        )}

        {generatedKey && (
          <div style={S.warningBox}>
            <Icon name="red-warning" size={24} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Simpan kunci ini sekarang!</p>
              <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
                Demi keamanan, Anda tidak akan bisa melihat kunci lengkap ini lagi setelah menutup kotak ini.
              </p>
              <div style={S.keyDisplay}>
                <code style={{ flex: 1, wordBreak: "break-all", fontFamily: "monospace", color: "var(--text)" }}>
                  {generatedKey.fullKey}
                </code>
                <button onClick={() => handleCopy(generatedKey.fullKey!)} style={S.copyBtn}>Salin</button>
              </div>
              <button onClick={() => setGeneratedKey(null)} style={S.doneBtn}>Saya Sudah Menyimpan</button>
            </div>
          </div>
        )}
      </div>

      {/* List Section */}
      <div style={{ ...S.card, marginTop: "24px" }}>
        <h3 style={S.listTitle}>Kunci API Aktif</h3>
        {keys.length === 0 ? (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>Belum ada kunci API eksternal yang ditambahkan.</p>
        ) : (
          <div style={S.list}>
            {keys.map((key) => (
              <div key={key.id} style={S.listItem}>
                <div style={S.listLeft}>
                  <div style={S.providerIcon}>{getProviderIcon(key.provider)}</div>
                  <div style={S.listInfo}>
                    <div style={S.listName}>{key.modelName}</div>
                    <div style={S.listMeta}>
                      <span style={S.badge}>{key.provider.toUpperCase()}</span>
                      <span style={{ color: "var(--muted)", fontSize: "12px" }}>{key.keyPrefix}</span>
                      <span style={{ color: "var(--muted)", fontSize: "12px" }}>• Dibuat: {key.created}</span>
                    </div>
                  </div>
                </div>
                <div style={S.listActions}>
                  <button onClick={() => handleCopy(key.fullKey || "no-key")} style={S.iconBtn} title="Salin Kunci">
                    <Icon name="white-copy" size={16} />
                  </button>
                  <button onClick={() => handleRevoke(key.id)} style={{ ...S.iconBtn, color: "var(--red)" }} title="Cabut Kunci">
                    <Icon name="red-trash" size={16} invert={false} />
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
  listTitle: { fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" },
  
  primaryBtn: {
    background: "var(--teal)",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
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
    fontSize: "14px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" },
  input: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
  },
  select: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px",
    color: "var(--text)",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  hintText: { fontSize: "11px", color: "var(--muted)", marginTop: "4px" },
  formActions: { display: "flex", marginTop: "8px" },
  
  warningBox: {
    marginTop: "24px",
    padding: "16px",
    background: "rgba(245, 200, 66, 0.08)",
    border: "1px solid rgba(245, 200, 66, 0.2)",
    borderRadius: "12px",
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },
  keyDisplay: {
    display: "flex",
    gap: "8px",
    background: "var(--bg)",
    padding: "10px",
    borderRadius: "6px",
    marginTop: "12px",
    alignItems: "center",
    border: "1px solid var(--border)",
  },
  copyBtn: {
    background: "var(--teal)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  doneBtn: {
    marginTop: "12px",
    background: "transparent",
    border: "none",
    color: "var(--muted)",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "12px",
    padding: 0,
  },
  
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "var(--card)",
    borderRadius: "12px",
    border: "1px solid var(--border)",
  },
  listLeft: { display: "flex", gap: "12px", alignItems: "center" },
  providerIcon: { fontSize: "20px" },
  listInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  listName: { fontWeight: 600, color: "var(--text)", fontSize: "14px" },
  listMeta: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  badge: {
    background: "rgba(0, 212, 200, 0.1)",
    color: "var(--teal)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  listActions: { display: "flex", gap: "8px" },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "var(--muted)",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    transition: "background 0.2s",
  },
};