// components/verify-email/SuccessView.tsx
//
// Shown after the token is accepted by the API.
// Auto-redirect countdown is handled by the page, not here.

import Link from "next/link";
import IconRing from "./IconRing";
import { viewStyles as V, verifyButtonStyles as B } from "./styles";

export default function SuccessView() {
  return (
    <div style={V.content} role="status" aria-live="polite">
      <IconRing variant="success">
        {/* Animated check mark */}
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none"
          stroke="#3dffa0" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <circle cx="17" cy="17" r="14"
            stroke="rgba(61,255,160,0.2)" strokeWidth="1.5"/>
          <polyline
            points="10,17 15,22 24,12"
            strokeDasharray="60"
            strokeDashoffset="60"
            style={{ animation: "checkDraw .5s .1s ease-out forwards" }}
          />
        </svg>
      </IconRing>

      <h1 style={{ ...V.title, ...V.titleSuccess }}>Email Terverifikasi!</h1>
      <p style={V.body}>
        Akun Anda telah berhasil diaktifkan. Anda akan diarahkan ke halaman
        login dalam beberapa detik…
      </p>

      <Link
        href="/login"
        style={{ ...B.primary, ...B.primarySuccess }}
        aria-label="Masuk ke BG-AI"
      >
        Masuk Sekarang →
      </Link>
    </div>
  );
}
