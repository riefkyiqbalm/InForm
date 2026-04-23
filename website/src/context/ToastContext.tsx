"use client";
// src/context/ToastContext.tsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────────
export type ToastType = "info" | "success" | "warn" | "error";

interface Toast {
  id:      number;
  message: string;
  type:    ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

// ── Context ──────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

let _id = 0;

// ── Provider ─────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export const useToast = () => useContext(ToastContext);

// ── UI Stack ─────────────────────────────────────────────────
const TOAST_STYLES: Record<ToastType, React.CSSProperties> = {
  info:    { background: "#0f2035", border: "1px solid #00897f", color: "#00d4c8" },
  success: { background: "#0a1f12", border: "1px solid #1a7a4a", color: "#3dffa0" },
  warn:    { background: "#1a1500", border: "1px solid #f5c842", color: "#f5c842" },
  error:   { background: "#1a0008", border: "1px solid #ff4d6d", color: "#ff4d6d" },
};

const TOAST_ICON: Record<ToastType, string> = {
  info: "i", success: "v", warn: "!", error: "x",
};

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
      pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          ...TOAST_STYLES[t.type],
          padding: "11px 18px", borderRadius: 12, fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,.4)",
          maxWidth: 340, animation: "fadeUp .3s ease",
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, fontWeight: 700 }}>
            {TOAST_ICON[t.type]}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}