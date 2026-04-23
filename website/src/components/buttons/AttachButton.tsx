"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../IconStyles";
import { InputMode } from "@/types";

interface AttachFileProps {
  onAction: (type: InputMode) => void;
  actions: InputMode[];
  align?: "left" | "right";
  actionLabels?: Partial<Record<InputMode, string>>;
  disabled?: boolean;
}

const DEFAULT_LABELS: Record<InputMode, string> = {
  text: "Text",
  foto: "Foto",
  document: "Dokumen",
  video: "Video",
};

export default function AttachFile({
  onAction,
  actions,
  align = "right",
  actionLabels = {},
  disabled = false,
}: AttachFileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // State Hover
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) updateCoords();
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => { if (isOpen) updateCoords(); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        style={{
          ...S.attachBtn,
          ...(isHovered ? S.attachBtnHover : {}),
          ...(isOpen ? { background: "rgba(0,0,0,0.1)", color: "var(--teal)" } : {}),
        }}
        type="button"
      >
        <Icon name="attach" size={24} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              ...S.dropup,
              top: coords.top - 10,
              left: align === "right" ? coords.left + 42 : coords.left,
              transform: align === "right" ? "translate(-100%, -100%)" : "translate(0, -100%)",
            }}
          >
            {actions.map((type) => {
              const label = actionLabels[type] || DEFAULT_LABELS[type] || type;
              return (
                <button
                  key={type}
                  onClick={() => { onAction(type); setIsOpen(false); }}
                  style={S.menuItem}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={S.iconWrapper}><Icon name={type} size={16} /></span>
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
  attachBtn: {
    width: 42,
    height: 42,
    border: "none",
    background: "transparent",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "var(--muted)",
  },
  attachBtnHover: {
    background: "var(--border)",
    transform: "scale(1.05)",
    color: "var(--text)",
  },
  dropup: {
    position: "absolute",
    background: "#1a2236",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    boxShadow: "0 -10px 25px -5px rgba(0,0,0,0.4)",
    zIndex: 9999,
    minWidth: "140px",
    padding: "4px",
    backdropFilter: "blur(10px)",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 12px",
    gap: "10px",
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
    textAlign: "left",
    transition: "background 0.2s",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    color: "var(--teal)",
  },
};