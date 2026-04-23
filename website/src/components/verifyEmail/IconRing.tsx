// components/verify-email/IconRing.tsx
//
// Circular ring that wraps the status icon in each state view.
// Supports three visual variants: default (teal), success (green), error (red).
// The "waiting" variant also renders a ripple pulse ring behind it.

import type React from "react";
import { iconRingStyles as S } from "./styles";

type Variant = "default" | "success" | "error";

interface IconRingProps {
  variant?: Variant;
  /** Show the animated ripple ring (used in WaitingView). */
  showRipple?: boolean;
  children: React.ReactNode;
}

const variantOverride: Record<Variant, React.CSSProperties> = {
  default: {},
  success: S.ringSuccess,
  error:   S.ringError,
};

export default function IconRing({
  variant = "default",
  showRipple = false,
  children,
}: IconRingProps) {
  return (
    <div style={{ ...S.ring, ...variantOverride[variant] }}>
      {showRipple && <span style={S.ripple} aria-hidden="true" />}
      {children}
    </div>
  );
}
