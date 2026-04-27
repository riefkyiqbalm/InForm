"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import SaveButton from "@sharedUI/components/buttons/SaveButton";
import FormatButton from "@sharedUI/components/buttons/FormatButton";
import Icon from "@sharedUI/components/IconStyles";

interface DbUser {
  id: number;
  name: string;
  email: string;
  contact?: string;
  institution?: string;
  role?: string;
}

interface PersonalInfoProps {
  onProfileUpdated?: (data: {
    name: string;
    email: string;
    role: string;
  }) => void;
}

export default function PersonalInfo({ onProfileUpdated }: PersonalInfoProps) {
  const { user, changeEmail, loading: authLoading } = useAuth(); 
  
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  
  // Form States
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState(""); 
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Wait for AuthContext to finish initializing before fetching
    if (authLoading) return;
    

    async function fetchUser() {
      setLoading(true);
      setStatus("");
      try {
        // Priority 1: Get token from AuthContext logic (which syncs with NextAuth)
        // Priority 2: Fallback to cookie directly
        let token = Cookies.get("_auth_token");
        // console.log(token)
        
        if (!token) {
          console.warn("[PersonalInfo] No token found. User might be logged out.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
        });

        // Detailed Error Logging
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[PersonalInfo] API Error ${response.status}:`, errorText);
          
          if (response.status === 401) {
            setStatus("Sesi kadaluarsa. Silakan login ulang.");
            // Optional: Trigger logout automatically
            // window.location.href = "/login"; 
          } else if (response.status === 500) {
            setStatus("Kesalahan server. Coba lagi nanti.");
          }
          
          // Fallback to context user data if API fails but we have local state
          if (user) {
            setDbUser({
              id: parseInt(user.id) || 0,
              name: user.name,
              email: user.email,
              contact: user.contact,
              institution: user.institution,
              role: user.role,
            });
            setEmail(user.email || "");
            setName(user.name || "");
            setContact(user.contact || "");
            setInstitution(user.institution || "");
            setRole(user.role || "");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setDbUser(data);
        setEmail(data.email || "");
        setName(data.name || "");
        setContact(data.contact || "");
        setInstitution(data.institution || "");
        setRole(data.role || "");

        if (onProfileUpdated) {
          onProfileUpdated({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "User",
          });
        }
      } catch (err: any) {
        console.error("[PersonalInfo] Fetch exception:", err);
        setStatus("Gagal memuat data profil.");
        // Fallback to context user
        if (user) {
          setEmail(user.email || "");
          setName(user.name || "");
          setContact(user.contact || "");
          setInstitution(user.institution || "");
          setRole(user.role || "");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
        Memuat data profil...
      </div>
    );
  }

  if (!user && !dbUser) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Silakan login untuk melihat profil.</p>
        <button 
          onClick={() => window.location.href = "/login"}
          style={{ marginTop: "10px", padding: "8px 16px", background: "var(--teal)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--panel)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "20px",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--muted)",
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginBottom: "20px",
        paddingBottom: "12px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center", gap: "8px",
      }}>
        <Icon name="white-user" size={16} />
        InFormasi Pribadi
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={labelStyle}>Nama Lengkap</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={labelStyle}>No. HP / WA</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} style={inputStyle} placeholder="Masukkan nomor HP / WA" />
        </div>
        <div>
          <label style={labelStyle}>Institusi / Instansi</label>
          <input value={institution} onChange={(e) => setInstitution(e.target.value)} style={inputStyle} placeholder="Masukkan institusi" />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>Peran / Jabatan</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
          <option value="Admin Sistem & AI Engineer">Admin Sistem & AI Engineer</option>
          <option value="Petugas Pengawas Vendor MBG">Petugas Pengawas Vendor MBG</option>
          <option value="Ahli Gizi / Tenaga Kesehatan">Ahli Gizi / Tenaga Kesehatan</option>
        </select>
      </div>

      {email !== dbUser?.email && (
        <div style={{ 
          marginTop: "16px", 
          padding: "16px", 
          background: "rgba(0,212,200,0.05)", 
          borderRadius: "12px",
          border: "1px solid var(--teal)"
        }}>
          <label style={{ ...labelStyle, color: "var(--teal)" }}>Konfirmasi Kata Sandi</label>
          <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "8px" }}>
            Anda mengubah email. Masukkan kata sandi saat ini untuk memverifikasi perubahan.
          </p>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="Kata sandi Anda"
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
        <div style={{
          color: status.includes("Berhasil") || status.includes("verifikasi") ? "var(--teal)" : "var(--red)",
          minHeight: "18px", fontSize: "13px",
        }}>
          {status}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <SaveButton
            loading={status === "Menyimpan perubahan..."}
            onClick={async () => {
              try {
                setStatus("Menyimpan perubahan...");
                let token = Cookies.get("_auth_token");
                if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

                // 1. Jika email berubah, gunakan fungsi dari AuthContext
                if (email !== dbUser?.email) {
                  if (!password) throw new Error("Kata sandi diperlukan untuk mengubah email");
                  const msg = await changeEmail(email, password);
                  setStatus(msg || "Cek email baru Anda untuk verifikasi.");
                  // Don't proceed to save other fields if email change requires verification
                  return; 
                }

                // 2. Simpan data profil lainnya (hanya jika email TIDAK berubah)
                const res = await fetch("/api/auth/me", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    name,
                    contact,
                    institution,
                    role,
                  }),
                });

                if (!res.ok) {
                  const err = await res.json().catch(() => ({ error: "Gagal menyimpan profil" }));
                  throw new Error(err.error || "Gagal menyimpan profil");
                }

                const updated = await res.json();
                setDbUser(updated);
                setName(updated.name ?? "");
                setContact(updated.contact ?? "");
                setInstitution(updated.institution ?? "");
                setRole(updated.role ?? "");
                setPassword(""); 

                if (onProfileUpdated) {
                  onProfileUpdated({
                    name: updated.name || updated.email || "",
                    email: updated.email || "",
                    role: updated.role || "User",
                  });
                }

                setStatus("Berhasil menyimpan perubahan profil.");
              } catch (err: any) {
                console.error("[PersonalInfo.save]", err);
                setStatus(`Gagal: ${err.message || "Terjadi kesalahan"}`);
              }
            }}
          />

          <FormatButton
            onClick={() => {
              if (!dbUser) return;
              setName(dbUser.name ?? "");
              setEmail(dbUser.email ?? "");
              setContact(dbUser.contact ?? "");
              setInstitution(dbUser.institution ?? "");
              setRole(dbUser.role ?? "User");
              setPassword("");
              setStatus("Perubahan telah di-reset.");
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Helper Styles
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: "6px",
  letterSpacing: ".5px",
  textTransform: "uppercase",
  fontFamily: "var(--font-mono)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "var(--text)",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  outline: "none",
};