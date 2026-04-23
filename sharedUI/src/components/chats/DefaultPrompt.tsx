"use client";
import React from "react";
import { DEFAULT_SUGGESTIONS, type Suggestion } from "@sharedUI/lib/constants/suggestions";
import Icon from "../IconStyles";

interface SuggestionsListProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestionsList({ onSelect }: SuggestionsListProps) {
  return (
    <div style={S.container}>
      <div style={S.grid}>
        {DEFAULT_SUGGESTIONS.map((item:Suggestion) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.prompt)}
            style={S.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {/* <div style={S.icon}>{item.icon}</div> */}
            <Icon name={item.icon} size={20} />
            <div style={S.textWrapper}>
              <div style={S.title}>{item.title}</div>
              <div style={S.subtitle}>{item.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px",
    textAlign: "left",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    outline: "none",
  },
  icon: {
    fontSize: "20px",
    background: "rgba(0, 212, 200, 0.1)",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    flexShrink: 0,
  },
  textWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  title: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  subtitle: {
    fontSize: "12px",
    color: "var(--muted)",
    lineHeight: "1.4",
  },
};