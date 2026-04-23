// components/StatusDot.tsx — Plasmo compatible (no Next.js imports)
import { useEffect, useState } from "react";

// Reads the same env var used by AuthContext
const FLASK_BASE = process.env.PLASMO_PUBLIC_FLASK_BASE ?? "http://localhost:5000";

interface StatusDotProps {
  className?: string;
  showLabel?: boolean;
}

export default function StatusDot({ showLabel = true, className = "" }: StatusDotProps) {
  const [status,      setStatus]      = useState<"online" | "offline">("offline");
  const [model,       setModel]       = useState<string>("");
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res  = await fetch(`${FLASK_BASE}/api/status`, { cache: "no-store" });
        const data = await res.json() as { status?: string; models?: string[] };
        setStatus(data.status === "online" ? "online" : "offline");
        setModel(data.models?.[0] ?? "Unknown");
      } catch {
        setStatus("offline");
        setModel("");
      }
      setLastChecked(new Date());
    };

    checkStatus();
    const id = setInterval(checkStatus, 30_000);
    return () => clearInterval(id);
  }, []);

  const isOnline = status === "online";

  return (
    <div
      style={S.container}
      className={className}
      title={`LM Studio: ${isOnline ? "Online" : "Offline"}\nModel: ${model || "—"}\nLast checked: ${lastChecked.toLocaleTimeString()}`}
    >
      <div
        style={{
          ...S.dot,
          backgroundColor: isOnline ? "var(--teal, #00d4c8)" : "var(--red, #ff4d6d)",
          boxShadow:        isOnline ? "0 0 8px var(--teal, #00d4c8)" : "none",
          animation:        isOnline ? "sd-pulse 2s infinite" : "none",
        }}
      />
      {showLabel && (
        <span style={{ ...S.label, color: isOnline ? "var(--teal, #00d4c8)" : "var(--red, #ff4d6d)" }}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
      <style>{`
        @keyframes sd-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: {
    display:    "inline-flex",
    alignItems: "center",
    gap:        "6px",
    cursor:     "default",
  },
  dot: {
    width:        "8px",
    height:       "8px",
    borderRadius: "50%",
    transition:   "all 0.3s ease",
    flexShrink:   0,
  },
  label: {
    fontSize:      "11px",
    fontFamily:    "var(--font-mono, monospace)",
    fontWeight:    600,
    letterSpacing: "0.5px",
  },
};