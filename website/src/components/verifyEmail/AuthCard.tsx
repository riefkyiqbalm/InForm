// components/verify-email/AuthCard.tsx
//
// The frosted-glass card with the InForm logo at the top.
// Reusable as the wrapper for any auth-flow page (login, register, verify, etc.)

import type React from "react";
import { authCardStyles as S } from "./styles";

interface AuthCardProps {
  children: React.ReactNode;
  /** Override logo text. Defaults to "BG". */
  logoText?: string;
}

export default function AuthCard({ children, logoText = "BG" }: AuthCardProps) {
  return (
    <div style={S.card}>
      {/* Logo mark */}
      <div style={S.logoWrap}>
        <div style={S.logo} aria-label="InForm">
          {logoText}
        </div>
      </div>

      {children}
    </div>
  );
}
