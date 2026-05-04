"use client";
import React, { useState } from "react";
import Icon from "@sharedUI/components/IconStyles";
import { FormInput } from "@sharedUI/components/FormInput";
import { ErrorBox } from "@sharedUI/components/ErrorBox";
import OauthButton from "@/components/auth/OauthButton";

interface LogInFormProps {
  loading: boolean;
  error: string;
  onError: (msg: string) => void;
}

export function LogInForm({ loading, error, onError }: LogInFormProps) {
  const [email, setEmail] = useState("");
  const [animateMail, setAnimateMail] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const fAnimateMail = (e: React.AnimationEvent<HTMLInputElement>) => {
    if (e.animationName === "onAutofillStart") setAnimateMail(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim tautan");
      setSent(true);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Gagal mengirim tautan. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div style={S.sentBox}>
        <div style={S.sentIcon}>✉</div>
        <p style={S.sentTitle}>Cek Email Anda</p>
        <p style={S.sentBody}>
          Tautan login telah dikirim ke <strong style={{ color: "var(--teal)" }}>{email}</strong>.
          Tautan berlaku selama <strong>30 menit</strong>.
        </p>
        <button
          type="button"
          style={S.resendBtn}
          onClick={() => { setSent(false); onError(""); }}
        >
          Kirim ulang / ganti email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <ErrorBox message={error} />

      <OauthButton />

      <div style={S.divider}>
        <div style={S.dividerLine} />
        <span style={S.dividerText}>Atau lanjutkan dengan email</span>
      </div>

      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          const v = e.target.value;
          setEmail(v);
          if (v === "") setAnimateMail(true);
        }}
        onAnimationStart={fAnimateMail}
        placeholder="Masukkan email"
        iconName="email"
        iconInvert={!animateMail}
        required
        disabled={loading || sending}
      />

      <button type="submit" disabled={loading || sending} style={S.mainBtn}>
        {sending ? (
          <>
            <Icon name="white-loading" size={18} />
            <span>Mengirim…</span>
          </>
        ) : (
          <>
            <Icon name="white-arrow-right" size={18} />
            <span>Kirim Tautan Login</span>
          </>
        )}
      </button>
    </form>
  );
}

const S: Record<string, React.CSSProperties> = {
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
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    margin: "20px 0",
    position: "relative",
  },
  dividerLine: {
    position: "absolute",
    width: "100%",
    height: "1px",
    backgroundColor: "var(--muted)",
    zIndex: 0,
  },
  dividerText: {
    paddingLeft: "8px",
    paddingRight: "8px",
    backgroundColor: "var(--panel)",
    color: "var(--teal)",
    fontSize: "14px",
    position: "relative",
    zIndex: 1,
  },
  sentBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 8px",
    gap: "12px",
    textAlign: "center",
  },
  sentIcon: {
    fontSize: "40px",
    lineHeight: 1,
  },
  sentTitle: {
    color: "var(--text)",
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
  },
  sentBody: {
    color: "var(--muted)",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: 0,
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "var(--teal)",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginTop: "4px",
  },
};
