import React from "react";
import Icon from "../IconStyles";

interface HamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerIcon({ isOpen, onClick }: HamburgerIconProps) {
  return (
    <button
      onClick={onClick}
      style={S.burger}
      title={isOpen ? "Close panel" : "Open panel"}
    >
      <Icon name="white-hamburger-menu" size={22} ></Icon>
    </button>
  );
}

// ── Inline styles ─────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  burger: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    transition: "all .2s",
  },
  burgerLine: {
    width: 24,
    height: 2,
    backgroundColor: "rgb(148, 163, 184)",
    borderRadius: 2,
    transition: "all .2s",
  },
};
