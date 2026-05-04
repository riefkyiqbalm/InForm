"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../IconStyles";
import { type ActionType } from "@sharedUI/types";
import { useTheme } from "@sharedUI/context/ThemeContext"; // Pastikan path ini sesuai lokasi file Anda

interface DropDownProps {
  onAction: (type: ActionType) => void;
  actions: ActionType[];
  align?: "left" | "right";
  actionLabels?: Partial<Record<ActionType, string>>;
  disabled?: boolean;
}

const DEFAULT_LABELS: Record<ActionType, string> = {
  copy: "Salin",
  delete: "Hapus",
  pin: "Sematkan",
  rename: "Ubah Nama",
  unpin: "Lepas Sematan"
};

export default function DropDown({
  onAction,
  actions,
  align = "right",
  actionLabels = {},
  disabled = false,
}: DropDownProps) {
  const { theme } = useTheme(); // Ambil tema saat ini
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tentukan apakah harus invert berdasarkan tema
  // Default: Invert jika dark mode (agar icon hitam jadi putih)
  // Pengecualian: Jika nama icon mengandung 'red', jangan pernah invert
  const shouldInvertDefault = theme === "dark";

  const checkInvert = (iconName: string) => {
    if (iconName.includes("red")) return false; // Jangan invert icon merah
    return shouldInvertDefault;
  };

  // Position calculation
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: align === "right" ? rect.right - 140 : rect.left, 
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEvents = (e: MouseEvent | WheelEvent | Event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
      updateCoords();
    };

    document.addEventListener("mousedown", handleEvents);
    window.addEventListener("scroll", handleEvents, true);
    window.addEventListener("resize", handleEvents);

    return () => {
      document.removeEventListener("mousedown", handleEvents);
      window.removeEventListener("scroll", handleEvents, true);
      window.removeEventListener("resize", handleEvents);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        style={{
          ...S.kebabBtn,
          // Gunakan variabel CSS untuk konsistensi tema
          background: isOpen ? "var(--card)" : "transparent", 
          color: "var(--muted)",
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {/* Hapus invert hardcoded, biarkan logic di dalam Icon atau pass dynamic */}
        <Icon name="white-menu-kebab" size={16} invert={shouldInvertDefault} />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            ...S.dropdown,
            top: coords.top + 5,
            left: coords.left,
            // Update style dropdown agar responsif terhadap tema
            background: "var(--panel)",
            border: "1px solid var(--border)",
          }}
        >
          {actions.map((type) => {
            const label = actionLabels[type] ?? DEFAULT_LABELS[type];
            const isDelete = type === "delete";
            const isUnpinning = type === "unpin" || (type === "pin" && label === "Unpin");
            
            // Logika penamaan ikon
            let iconName = `white-${type}`;
            if (isDelete) iconName = "red-trash"; // Pastikan pakai icon merah khusus
            if (isUnpinning) iconName = "white-unpin";

            return (
              <button
                key={type}
                onClick={() => { onAction(type); setIsOpen(false); }}
                style={{
                  ...S.menuItem,
                  color: isDelete ? "var(--red)" : "var(--text)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={S.iconWrapper}>
                  <Icon 
                    name={iconName} 
                    size={16} 
                    invert={checkInvert(iconName)} 
                  />
                </span>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{label}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

const S: Record<string, React.CSSProperties> = {
  kebabBtn: {
    border: "none",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  dropdown: {
    position: "absolute",
    borderRadius: "10px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
    zIndex: 9999,
    minWidth: "140px",
    padding: "4px",
    pointerEvents: "auto",
  },
  menuItem: {
    width: "100%",
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: "6px",
    transition: "background 0.2s",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    opacity: 0.8,
  },
};