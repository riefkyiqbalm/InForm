// components/verify-email/VerifyBackground.tsx
//
// Full-page dark background with animated grid and floating orbs.
// Reusable across all auth pages (login, register, forgot-password, etc.)
// Renders VerifyAnimations so consumers don't need to import it separately.

import type React from "react";
import { backgroundStyles as S } from "./styles";
import VerifyAnimation from "./VerifyAnimation";

interface VerifyBackgroundProps {
  children: React.ReactNode;
}

export default function VerifyBackground({ children }: VerifyBackgroundProps) {
  return (
    <div style={S.root}>
      {/* Grid overlay */}
      <div style={S.grid} aria-hidden="true" />

      {/* Floating ambient orbs */}
      <div style={S.orb1} aria-hidden="true" />
      <div style={S.orb2} aria-hidden="true" />
      <div style={S.orb3} aria-hidden="true" />

      {/* Page content */}
      {children}

      {/* Keyframe definitions — injected once per page */}
      <VerifyAnimation />
    </div>
  );
}
