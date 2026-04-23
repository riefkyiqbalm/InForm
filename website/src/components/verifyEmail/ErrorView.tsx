// components/verify-email/ErrorView.tsx
//
// Shown when the token is invalid, expired, or already used.

import Link from "next/link";
import IconRing from "./IconRing";
import { viewStyles as V, verifyButtonStyles as B } from "./styles";

interface ErrorViewProps {
  message?: string;
  onResend: () => void;
  isResending?: boolean;
}

export default function ErrorView({
  message,
  onResend,
  isResending = false,
}: ErrorViewProps) {
  return (
    <div style={V.content} role="alert" aria-live="assertive">
      <IconRing variant="error">
        {/* Animated X */}
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none"
          stroke="var(--red)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <circle cx="17" cy="17" r="14"
            stroke="rgba(255,77,109,0.2)" strokeWidth="1.5"/>
          <line x1="12" y1="12" x2="22" y2="22"
            strokeDasharray="40" strokeDashoffset="40"
            style={{ animation: "xDraw .3s ease-out forwards" }}/>
          <line x1="22" y1="12" x2="12" y2="22"
            strokeDasharray="40" strokeDashoffset="40"
            style={{ animation: "xDraw .3s .1s ease-out forwards" }}/>
        </svg>
      </IconRing>

      <h1 style={{ ...V.title, ...V.titleError }}>Verifikasi Gagal</h1>
      <p style={V.body}>
        {message || "Tautan tidak valid atau sudah kedaluwarsa."}
      </p>

      <div style={V.divider} />

      <p style={V.hint}>Minta tautan verifikasi baru:</p>
      <button
        style={{ ...B.ghost, opacity: isResending ? 0.6 : 1, cursor: isResending ? "not-allowed" : "pointer" }}
        onClick={onResend}
        disabled={isResending}
        aria-busy={isResending}
      >
        {isResending ? "Mengirim…" : "Kirim Ulang Email"}
      </button>

      <Link href="/login" style={B.backLink}>
        ← Kembali ke Login
      </Link>
    </div>
  );
}
