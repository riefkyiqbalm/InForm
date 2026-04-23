// components/verify-email/styles.ts
//
// All styles for the verify-email component tree.
// Uses CSS variables from app/styles/global.css and merges with
// shared style objects from app/lib/styles/ where appropriate.

import type React from "react";
import { cardStyles } from "@/lib/styles/cards";
import { buttonStyles } from "@/lib/styles/buttons";

// ── Background (VerifyBackground) ─────────────────────────────────────────────

export const backgroundStyles = {
  root: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "var(--font-body)",
  } as React.CSSProperties,

  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,212,200,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,200,.035) 1px, transparent 1px)
    `,
    backgroundSize: "52px 52px",
    pointerEvents: "none",
  } as React.CSSProperties,

  orb1: {
    position: "absolute",
    width: 420,
    height: 420,
    background: "radial-gradient(circle, rgba(0,212,200,.07) 0%, transparent 70%)",
    top: "-100px",
    right: "8%",
    borderRadius: "50%",
    animation: "floatOrb 9s ease-in-out infinite",
    pointerEvents: "none",
  } as React.CSSProperties,

  orb2: {
    position: "absolute",
    width: 320,
    height: 320,
    background: "radial-gradient(circle, rgba(0,80,200,.08) 0%, transparent 70%)",
    bottom: "-60px",
    left: "6%",
    borderRadius: "50%",
    animation: "floatOrb 11s ease-in-out infinite reverse",
    pointerEvents: "none",
  } as React.CSSProperties,

  orb3: {
    position: "absolute",
    width: 180,
    height: 180,
    background: "radial-gradient(circle, rgba(0,212,200,.05) 0%, transparent 70%)",
    top: "40%",
    left: "15%",
    borderRadius: "50%",
    animation: "floatOrb 7s ease-in-out infinite",
    pointerEvents: "none",
  } as React.CSSProperties,
};

// ── Auth card (AuthCard) ───────────────────────────────────────────────────────

export const authCardStyles = {
  // Extends cardStyles.base with auth-page-specific overrides
  card: {
    ...cardStyles.elevated,
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: 420,
    margin: "0 20px",
    background: "var(--panel)",
    borderRadius: 24,
    padding: "36px 32px",
    backdropFilter: "blur(12px)",
    boxShadow: "0 24px 48px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.04) inset",
    animation: "fadeUp .6s ease-out",
  } as React.CSSProperties,

  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 28,
  } as React.CSSProperties,

  logo: {
    width: 52,
    height: 52,
    background: "linear-gradient(135deg, var(--teal), #0070ff)",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
    fontWeight: 800,
    color: "#fff",
    fontFamily: "var(--font-head)",
    boxShadow: "0 0 28px rgba(0,212,200,.28)",
  } as React.CSSProperties,
};

// ── Icon ring (IconRing) ──────────────────────────────────────────────────────

export const iconRingStyles = {
  ring: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    border: "1px solid rgba(0,212,200,0.2)",
    background: "rgba(0,212,200,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
    flexShrink: 0,
  } as React.CSSProperties,

  ringSuccess: {
    borderColor: "rgba(61,255,160,0.25)",
    background: "rgba(61,255,160,0.06)",
    animation: "pulse 1.8s ease-out 2",
  } as React.CSSProperties,

  ringError: {
    borderColor: "rgba(255,77,109,0.25)",
    background: "rgba(255,77,109,0.06)",
  } as React.CSSProperties,

  ripple: {
    position: "absolute",
    inset: -8,
    borderRadius: "50%",
    border: "1px solid rgba(0,212,200,0.15)",
    animation: "ripple 2.4s ease-out infinite",
    pointerEvents: "none",
  } as React.CSSProperties,
};

// ── View content (shared across all four views) ───────────────────────────────

export const viewStyles = {
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 0,
    animation: "fadeUp .5s ease-out",
  } as React.CSSProperties,

  title: {
    fontFamily: "var(--font-head)",
    fontSize: 22,
    fontWeight: 800,
    color: "var(--text)",
    margin: "0 0 10px",
    letterSpacing: "-0.3px",
  } as React.CSSProperties,

  titleSuccess: {
    color: "#3dffa0",
  } as React.CSSProperties,

  titleError: {
    color: "var(--red)",
  } as React.CSSProperties,

  body: {
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.65,
    margin: "0 0 20px",
    maxWidth: 320,
  } as React.CSSProperties,

  divider: {
    width: "100%",
    height: 1,
    background: "var(--border)",
    margin: "4px 0 20px",
  } as React.CSSProperties,

  hint: {
    fontSize: 12,
    color: "var(--muted)",
    margin: "0 0 10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    fontWeight: 600,
    fontFamily: "var(--font-mono)",
  } as React.CSSProperties,
};

// ── Buttons (extend shared buttonStyles) ──────────────────────────────────────

export const verifyButtonStyles = {
  // Teal gradient primary — for login CTA in SuccessView
  primary: {
    display: "inline-block",
    marginTop: 8,
    padding: "12px 28px",
    background: "linear-gradient(135deg, var(--teal), #0080cc)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    boxShadow: "0 6px 18px rgba(0,212,200,.22)",
    transition: "opacity .15s",
    fontFamily: "var(--font-body)",
  } as React.CSSProperties,

  // Success variant (green)
  primarySuccess: {
    background: "#3dffa0",
    color: "#0d1117",
    boxShadow: "0 6px 18px rgba(61,255,160,.2)",
  } as React.CSSProperties,

  // Ghost — extends buttonStyles.ghost with teal tint
  ghost: {
    ...buttonStyles.ghost,
    padding: "10px 24px",
    background: "rgba(0,212,200,0.06)",
    border: "1px solid rgba(0,212,200,0.2)",
    borderRadius: 10,
    color: "var(--teal)",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 16,
    width: "100%",
  } as React.CSSProperties,

  backLink: {
    fontSize: 13,
    color: "var(--muted)",
    textDecoration: "none",
    marginTop: 4,
    transition: "color .15s",
  } as React.CSSProperties,
};
