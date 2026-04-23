// components/verify-email/VerifyingView.tsx
//
// Shown while POST /api/auth/verify-email is in-flight.

import IconRing from "./IconRing";
import { viewStyles as V } from "./styles";

export default function VerifyingView() {
  return (
    <div style={V.content} role="status" aria-live="polite">
      <IconRing variant="default">
        {/* Spinning arc */}
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none"
          style={{ animation: "spin 0.9s linear infinite" }}
          aria-hidden="true">
          <circle cx="17" cy="17" r="14"
            stroke="rgba(0,212,200,0.15)" strokeWidth="3"/>
          <path d="M17 3 A14 14 0 0 1 31 17"
            stroke="var(--teal)" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </IconRing>

      <h1 style={V.title}>Memverifikasi…</h1>
      <p style={V.body}>
        Harap tunggu sebentar, kami sedang memvalidasi tautan Anda.
      </p>
    </div>
  );
}
