// components/verify-email/WaitingView.tsx
//
// Shown when no ?token= is present in the URL.
// Tells the user to check their inbox and offers a resend button.

import Link from "next/link";
import IconRing from "./IconRing";
import { viewStyles as V, verifyButtonStyles as B } from "./styles";

interface WaitingViewProps {
  onResend: () => void;
  isResending?: boolean;
}

export default function WaitingView({ onResend, isResending = false }: WaitingViewProps) {
  return (
    <div style={V.content}>
      <IconRing variant="default" showRipple>
        {/* Envelope icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="var(--teal)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </IconRing>

      <h1 style={V.title}>Cek Kotak Masuk Anda</h1>
      <p style={V.body}>
        Kami telah mengirimkan tautan verifikasi ke alamat email Anda.
        Klik tautan tersebut untuk mengaktifkan akun BG-AI.
      </p>

      <div style={V.divider} />

      <p style={V.hint}>Tidak menerima email?</p>
      <button
        style={{ ...B.ghost, opacity: isResending ? 0.6 : 1, cursor: isResending ? "not-allowed" : "pointer" }}
        onClick={onResend}
        disabled={isResending}
        aria-busy={isResending}
      >
        {isResending ? "Mengirim…" : "Kirim Ulang Email"}
      </button>

      <Link href="/login" style={B.backLink}>
        ← Kembali
      </Link>
    </div>
  );
}
