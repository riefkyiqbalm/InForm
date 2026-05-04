"use client";
import Link from "next/link";
import { useAuth } from "@sharedUI/context/SharedAuthContext";
import { ThemeToggle } from "@sharedUI/context/ThemeContext";
import React from "react";

export default function SidebarFooter({ isOpen }: { isOpen: boolean }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div style={S.wrapper}>
      <div style={S.footer}>
        <Link href="/dashboard">
          <span id="avatar" style={S.avatar}>
            {(user?.name || "UU").charAt(0).toUpperCase() +
              (user?.name || "UU").charAt((user?.name || "UU").length - 1).toUpperCase()}
          </span>
        </Link>
        <Link href="/dashboard" style={S.link}>
          <div style={{ marginLeft: 12, fontSize: 16 }}>
            <div style={{ fontWeight: 600, color: "var(--text)" }}>
              {user?.name || "User"}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>
              {user?.email || "user@example.com"} · {user?.institution || "No Institution"}
            </div>
          </div>
        </Link>
      </div>
      <div style={S.themeRow}>
        <ThemeToggle />
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: "auto",
    borderTop: "1px solid var(--border)",
    paddingTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flexShrink: 0,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 8px",
    borderRadius: 10,
    transition: "background .15s",
    cursor: "pointer",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--teal-dim), #003355)",
    border: "2px solid var(--teal-dim)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--teal)",
    flexShrink: 0,
    fontFamily: "var(--font-mono)",
  },
  link: {
    color: "var(--text)",
    textDecoration: "none",
    fontSize: 14,
    flex: 1,
  },
  themeRow: {
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: 4,
    paddingBottom: 4,
  },
};
