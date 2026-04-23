"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext"; //
import SaveButton from "../buttons/SaveButton";
import FormatButton from "../buttons/FormatButton";
import Icon from "../IconStyles";

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
  // Mengambil user dan fungsi changeEmail dari AuthContext
  const { user, changeEmail } = useAuth(); 
  
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState(""); // State baru untuk verifikasi
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const token = Cookies.get("_auth_token");
        if (!token) throw new Error("Token tidak ditemukan");

        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Gagal mengambil data user");

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
      } catch (err) {
        console.error("[PersonalInfo] ", err);
        if (user) {
          setEmail(user.email || "");
          setName(user.name || "");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [user]);

  if (loading) return <div>Mengambil data pengguna...</div>;

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
        <Icon name="user" size={16}  />
        Informasi Pribadi
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

      {/* Tampilkan field Password hanya jika email berubah */}
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
                const token = Cookies.get("_auth_token");
                if (!token) throw new Error("Token tidak ditemukan");

                // 1. Jika email berubah, gunakan fungsi dari AuthContext
                if (email !== dbUser?.email) {
                  if (!password) throw new Error("Kata sandi diperlukan untuk mengubah email");
                  const msg = await changeEmail(email, password); //
                  setStatus(msg || "Cek email baru Anda untuk verifikasi.");
                }

                // 2. Simpan data profil lainnya
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
                setPassword(""); // Reset password field

                if (onProfileUpdated) {
                  onProfileUpdated({
                    name: updated.name || updated.email || "",
                    email: updated.email || "",
                    role: updated.role || "User",
                  });
                }

                if (!status.includes("verifikasi")) {
                  setStatus("Berhasil menyimpan perubahan profil.");
                }
              } catch (err: any) {
                console.error("[PersonalInfo.save]", err);
                setStatus(`Gagal: ${err.message || "Terjadi kesalahan"}`);
              }
            }}
          />

          <FormatButton
            onClick={() => {
              setName(dbUser?.name ?? "");
              setEmail(dbUser?.email ?? "");
              setContact(dbUser?.contact ?? "");
              setInstitution(dbUser?.institution ?? "");
              setRole(dbUser?.role ?? "User");
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