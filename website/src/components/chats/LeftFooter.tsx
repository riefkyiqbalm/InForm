"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function SidebarFooter({ isOpen }: { isOpen: boolean }) {
  const { user, logout } = useAuth();
  const [isHover, setisHover] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div style={S.footer}>
      <Link href="/dashboard" >
          <span id="avatar" style={S.avatar}>{(user?.name || 'UU').charAt(0).toUpperCase() + (user?.name || 'UU').charAt((user?.name || 'UU').length - 1).toUpperCase()}</span>
      </Link>
      <Link href="/dashboard" style={S.link} onMouseEnter={() => setisHover(true)} onMouseLeave={() => setisHover(false)}>
        <div style={{ marginLeft: 12, fontSize: 16 }}>
          <div id="user-name" style={{ fontWeight: 600, color: "var(--text)" }}>
            {user?.name || 'User'}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            {user?.email || 'user@example.com'} · {user?.institution || 'No Institution'}
          </div>
        </div>
      </Link>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: "auto",
    borderTop: "1px solid var(--border)",
    paddingTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexDirection: "row",
    cursor: "pointer",
    padding: "10px 8px",
    borderRadius: 10,
    transition: "background .15s",
    flexShrink: 0,
  },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg,#1a4a7a,#003355)",
    border: "2px solid var(--teal-dim)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: "var(--teal)",
    flexShrink: 0, fontFamily: "var(--font-mono)",

  },
  link: {
    color: "rgb(203, 213, 225)",
    textDecoration: "none",
    fontSize: 14,
    background: "none",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
  },
};
