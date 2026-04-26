"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import router untuk navigasi
import Icon from "@sharedUI/components/IconStyles";
import { FormInput } from "@sharedUI/components/FormInput";
import { ErrorBox } from "@sharedUI/components/ErrorBox";
import BackButton from "@sharedUI/components/buttons/BackButton";
import SmallLogo from "@sharedUI/components/logo/SmallLogo";

type Step = "email" | "reset" ;

export function ForgotPassword() {
  const router = useRouter(); // Inisialisasi router
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "verify_email", email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Email tidak ditemukan.");
      setStep("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // const handleResetSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError("");
  //   if (!newPassword || newPassword.length < 6) {
  //     setError("Kata sandi baru minimal 6 karakter.");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const res = await fetch("/api/auth/forgot_password", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         step: "reset_password",
  //         email,
  //         oldPassword,
  //         newPassword,
  //       }),
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message ?? "Gagal mengatur ulang kata sandi.");
  //     setStep("done");
  //   } catch (err: unknown) {
  //     setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    /* ── Main Container (Halaman Penuh) ── */
    <div style={S.pageWrapper}>
      <div style={S.container}>
        {/* Header dengan Tombol Kembali */}
        <div style={S.header}>
          <BackButton href="/login" label="Login" variant="ghost"/>
          {/* <button style={S.backBtn} onClick={() => router.back()}>
            <Icon name="back" size={20} />
          </button> */}
          <div style={S.headerLeft}>
            <Icon name="lock" size={20} />
            <h1 style={S.title}>
              {step === "email" && "Lupa Kata Sandi"}
              {step === "reset" && "Atur Ulang Kata Sandi"}
              {/* {step === "done" && "Berhasil!"} */}
            </h1>
          </div>
        </div>

        {/* Konten Berdasarkan Step */}
        <div style={S.content}>
          {/* {step === "done" ? (
            <div style={S.doneWrap}>
              <div style={S.doneIcon}><Icon name="check" size={32} /></div>
              <p style={S.doneText}>Kata sandi berhasil diperbarui. Silakan masuk kembali.</p>
              <button style={S.mainBtn} onClick={() => router.push("/login")}>
                Kembali ke Masuk
              </button> */}
            </div>
            {step === "email" ? (
            <form onSubmit={handleEmailSubmit}>
              <p style={S.desc}>Masukkan email akun Anda untuk verifikasi identitas.</p>
              <ErrorBox message={error} />
              <FormInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                iconName="email"
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading} style={S.mainBtn}>
                {loading ? <Icon name="loading" size={18} /> : <Icon name="forward" size={18} />}
                <span>{loading ? "Memverifikasi..." : "Lanjutkan"}</span>
              </button>
            </form>
          ) : (
            // <form onSubmit={handleResetSubmit}>
            <div>
              <p style={S.desc}>Kami Telah Mengirimkan Tautan Reset Password Ke Email Anda</p>
              <ErrorBox message={error} />
              {/* <OldPasswordInput value={oldPassword} onChange={setOldPassword} show={showOld} onToggleShow={() => setShowOld(!showOld)} disabled={loading} />
              <NewPasswordInput value={newPassword} onChange={setNewPassword} show={showNew} onToggleShow={() => setShowNew(!showNew)} disabled={loading} />
              <button type="submit" disabled={loading} style={S.mainBtn}>
                {loading ? <Icon name="loading" size={18} className="animate-spin" /> : <Icon name="check" size={18} />}
                <span>{loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}</span>
              </button> */}
            </div>
          )}
        </div>
      </div>
  );
}

// Sub-komponen (OldPasswordInput & NewPasswordInput tetap sama seperti sebelumnya)
// ── Sub-component: Old Password Input ────────────────────────────────────────
interface PasswordFieldProps {
  value:         string;
  onChange:      (v: string) => void;
  show:          boolean;
  onToggleShow:  () => void;
  disabled?:     boolean;
}

export function OldPasswordInput({
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
}: PasswordFieldProps) {
  return (
    <FormInput
      label="Kata Sandi Lama"
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Masukkan kata sandi lama"
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

// ── Sub-component: New Password Input ────────────────────────────────────────
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

// ── Styles ────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    animation: "fadeIn 0.2s ease-out",
  },
  modal: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "24px",
    padding: "28px 32px 32px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
    position: "relative",
    animation: "slideUp 0.25s ease-out",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--text)",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--muted)",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "0.2s",
  },
  desc: {
    fontSize: "14px",
    color: "var(--teal)",
    marginBottom: "20px",
    lineHeight: 1.6,
    justifyContent: "center"
  },
  mainBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, var(--teal), #0080cc)",
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
  stepRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "24px",
  },
  stepDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    transition: "0.3s",
  },
  stepActive:   { background: "var(--teal)", boxShadow: "0 0 8px var(--teal)" },
  stepDone:     { background: "#3dffa0" },
  stepInactive: { background: "var(--border)" },
  stepLine: {
    width: "40px",
    height: "2px",
    background: "var(--border)",
    borderRadius: "1px",
  },
  doneWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "8px 0 4px",
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
    color: "var(--muted)",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: "280px",
  },
};