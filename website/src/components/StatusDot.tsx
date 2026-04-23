"use client";

import { useEffect, useState } from "react";
import { getStatus } from "@/lib/api";

interface StatusDotProps {
  className?: string;
  showLabel?: boolean;
}

export default function StatusDot({ showLabel = true, className = "" }: StatusDotProps) {
  const [status, setStatus] = useState<"online" | "offline">("offline");
  const [model, setModel] = useState<string>("");
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await getStatus();
        setStatus(data.status);
        setModel(data.models?.[0] || "Unknown");
      } catch {
        setStatus("offline");
      }
      setLastChecked(new Date());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = status === "online";

  return (
    <div 
      style={S.container} 
      className={className}
      title={`LM Studio: ${isOnline ? "Online" : "Offline"}\nModel: ${model}\nLast checked: ${lastChecked.toLocaleTimeString()}`}
    >
      <div
        style={{
          ...S.dot,
          backgroundColor: isOnline ? "var(--teal)" : "var(--red)",
          boxShadow: isOnline ? "0 0 8px var(--teal)" : "0 0 8px var(--red)",
          animation: isOnline ? "pulse 2s infinite" : "none",
        }}
      />
      {showLabel && (
        <span style={{ ...S.label, color: isOnline ? "var(--teal)" : "var(--red)" }}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "default",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
  label: {
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
};
