"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../IconStyles";
import {type ActionType } from "@sharedUI/types";

interface DropDownProps {
  onAction: (type: ActionType) => void;
  actions: ActionType[];
  align?: "left" | "right";
  actionLabels?: Partial<Record<ActionType, string>>;
  disabled?: boolean;
}


const DEFAULT_LABELS: Record<ActionType, string> = {
  copy: "Copy",
  delete: "Delete",
  pin: "Pin",
  rename: "Rename",
  unpin: "Unpin"
};

export default function DropDown({
  onAction,
  actions,
  align = "right",
  actionLabels = {},
  disabled = false,
}: DropDownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      // Close if clicking outside the dropdown AND the trigger
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
      // Reposition on scroll/resize
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
          background: isOpen ? "rgba(255,255,255,0.1)" : "none",
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <Icon name="white-menu-kebab" size={16} invert={true} />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            ...S.dropdown,
            top: coords.top + 5,
            left: coords.left,
          }}
        >
          {actions.map((type) => {
            const label = actionLabels[type] ?? DEFAULT_LABELS[type];
            const isDelete = type === "delete";
            const isUnpinning = type === "pin" && label === "Unpin";
            const iconName = isUnpinning ? "white-unpin" : `white-${type}`;
            return (
              <button
                key={type}
                onClick={() => { onAction(type); setIsOpen(false); }}
                style={{
                  ...S.menuItem,
                  color: type === "delete" ? "#ff4d4d" : "#e2e8f0",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={S.iconWrapper}><Icon 
          name={iconName} 
          size={16} 
          // Unpin biasanya tidak perlu di-invert jika SVG-nya sudah berwarna
          invert={isDelete ? false : true} 
        /></span>
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
    background: "none",
    border: "none",
    color: "#94a3b8",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  dropdown: {
    position: "absolute", // Fixed or absolute both work inside body portal
    background: "#1a2236",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
    zIndex: 9999,
    minWidth: "140px",
    padding: "4px",
    backdropFilter: "blur(8px)",
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