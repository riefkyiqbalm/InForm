"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@sharedUI/components/IconStyles";
import { FormInput } from "@sharedUI/components/FormInput";
import { ErrorBox } from "@sharedUI/components/ErrorBox";
import BackButton from "@sharedUI/components/buttons/BackButton";
import SmallLogo from "@sharedUI/components/logo/SmallLogo";

type Step = "reset" | "done";

export function InputPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<Step>("reset");
  const [reset, setReset] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenMissing, setTokenMissing] = useState(false);

  // Get token safely
  const token = searchParams?.get('token');

  // Check if token exists on mount
  useEffect(() => {
    if (!token) {
      setTokenMissing(true);
      setError("Tautan reset tidak valid atau telah kadaluarsa.");
    }
  }, [token]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!token) {
      setError("Tautan reset tidak ditemukan.");
      return;
    }

    if (!reset || reset.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          password: reset,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Gagal mengatur ulang kata sandi.");
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // If token is missing, show error immediately but allow rendering
  if (tokenMissing && !error) {
     // Fallback if useEffect hasn't run yet
     return (
       <div style={S.pageWrapper}>
         <div style={S.container}>
           <ErrorBox message="Tautan reset tidak valid." />
           <button style={S.mainBtn} onClick={() => router.push("/login")}>
             Kembali ke Masuk
           </button>
         </div>
       </div>
     );
  }

  return (
    <div style={S.pageWrapper}>
      <div style={S.container}>
        <div style={S.header}>
          <BackButton href="/login" label="Login" variant="ghost"/>
          <div style={S.headerLeft}>
            <Icon name="lock" size={20} />
            <h1 style={S.title}>
              {step === "reset" && "Atur Ulang Kata Sandi"}
              {step === "done" && "Berhasil!"}
            </h1>
          </div>
        </div>

        <div style={S.content}>
          {step === "done" ? (
            <div style={S.doneWrap}>
              <div style={S.doneIcon}><Icon name="check" size={32} /></div>
              <p style={S.doneText}>Kata sandi berhasil diperbarui. Silakan masuk kembali.</p>
              <button style={S.mainBtn} onClick={() => router.push("/login")}>
                Kembali ke Masuk
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit}>
              <p style={S.desc}>Silakan Masukan Password Baru Anda</p>
              <ErrorBox message={error} />
              
              <NewPasswordInput 
                value={reset} 
                onChange={setReset} 
                show={showNew} 
                onToggleShow={() => setShowNew(!showNew)} 
                disabled={loading || !token} 
              />
              
              <button 
                type="submit" 
                disabled={loading || !token} 
                style={{
                  ...S.mainBtn,
                  opacity: (loading || !token) ? 0.6 : 1,
                  cursor: (loading || !token) ? "not-allowed" : "pointer"
                }}
              >
                {loading ? <Icon name="loading" size={18} /> : <Icon name="check" size={18} />}
                <span>{loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  value:         string;
  onChange:      (v: string) => void;
  show:          boolean;
  onToggleShow:  () => void;
  disabled?:     boolean;
}

export function NewPasswordInput({
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
}: PasswordFieldProps) {
  return (
    <FormInput
      label="Kata Sandi Baru"
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Masukkan kata sandi baru"
      iconName="lock"
      required
      disabled={disabled}
      rightSlot={
        <span onClick={onToggleShow} style={{ cursor: "pointer", opacity: 0.7 }}>
          <Icon name={show ? "eyeoff" : "eye"} size={18} />
        </span>
      }
    />
  );
}

const S: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    background: "var(--bg, #0d1117)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: {
    background: "var(--panel, #161b22)",
    border: "1px solid var(--border, #30363d)",
    borderRadius: "24px",
    padding: "32px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--text, #e6edf3)",
  },
  desc: {
    fontSize: "14px",
    color: "var(--muted, #8b949e)",
    marginBottom: "20px",
    lineHeight: 1.6,
  },
  mainBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, var(--teal, #00d4c8), #0080cc)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,212,200,.2)",
    transition: "0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
  },
  doneWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "20px 0",
  },
  doneIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(61,255,160,0.1)",
    border: "1px solid rgba(61,255,160,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#3dffa0",
  },
  doneText: {
    fontSize: "14px",
    color: "var(--muted, #8b949e)",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: "280px",
  },
};