'use-client'
import React from "react";

type Panel = "login" | "register";

interface TabButtonsProps {
  active: Panel;
  onChange: (panel: Panel) => void;
}

export function TabButtons({ active, onChange }: TabButtonsProps) {
  return (
    <div style={S.tabs}>
      {(["login", "register"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            ...S.tabBtn,
            ...(active === m ? S.tabActive : {}),
          }}
        >
          {m === "login" ? "Masuk" : "Daftar"}
        </button>
      ))}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  tabs: {
    display: "flex",
    background: "var(--card)",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "24px",
    gap: "4px",
  },
  tabBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "none",
    color: "var(--muted)",
    transition: "0.2s",
  },
  tabActive: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    color: "var(--teal)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};