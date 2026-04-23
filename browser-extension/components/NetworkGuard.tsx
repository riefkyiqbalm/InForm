// components/NetworkGuard.tsx
// Detects internet connectivity. Shows:
//   - Offline → error state + Retry button
//   - Online  → Login button → opens localhost:3000/login in browser tab

import React, { useCallback, useEffect, useState } from "react"
import Icon from "../../sharedUI/src/components/IconStyles"
import StatusDot from "../../sharedUI/src/components/StatusDot"

type Status = "checking" | "online" | "offline"

// How long to wait before the ping times out (ms)
const PING_TIMEOUT_MS = 5000
// URL to ping — use a known-reliable tiny resource
// In an extension, we can't ping arbitrary third-party URLs easily,
// so we try to reach the user's own backend instead.
const PING_URL ="https://www.google.com/favicon.ico"

async function checkConnectivity(): Promise<boolean> {
  // First fast-fail: browser's own navigator.onLine
  if (!navigator.onLine) return false

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)
    const res = await fetch(PING_URL, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    })
    clearTimeout(timeout)
    return res.ok
  } catch {
    // fetch threw (AbortError = timeout, TypeError = network error)
    return false
  }
}

interface NetworkGuardProps {
  /** Called when user clicks Login (online state). Defaults to opening localhost:3000/login */
  onLogin?: () => void
  /** URL to open when online and Login is clicked */
  loginUrl?: string
}

export default function NetworkGuard({
  onLogin,
  loginUrl = "http://localhost:3000/login",
}: NetworkGuardProps) {
  const [status,      setStatus]      = useState<Status>("checking")
  const [retryCount,  setRetryCount]  = useState(0)
  const [isRetrying,  setIsRetrying]  = useState(false)

  const runCheck = useCallback(async () => {
    setStatus("checking")
    const online = await checkConnectivity()
    setStatus(online ? "online" : "offline")
  }, [])

  // Initial check
  useEffect(() => {
    runCheck()
  }, [runCheck])

  // Listen to browser online/offline events as a secondary signal
  useEffect(() => {
    const handleOnline  = () => runCheck()
    const handleOffline = () => setStatus("offline")
    window.addEventListener("online",  handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online",  handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [runCheck])

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount((c) => c + 1)
    await runCheck()
    setIsRetrying(false)
  }

  const handleLogin = () => {
    if (onLogin) {
      onLogin()
    } else {
      // Open in a new browser tab (standard extension pattern)
      chrome.tabs.create({ url: loginUrl })
    }
  }

  return (
    <div style={S.root}>
      {status === "checking" && <CheckingState />}
      {status === "offline"  && (
        <OfflineState
          onRetry={handleRetry}
          isRetrying={isRetrying}
          retryCount={retryCount}
        />
      )}
      {status === "online" && <OnlineState onLogin={handleLogin} />}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CheckingState() {
  return (
    <div style={S.card}>
      <div style={S.iconWrap}>
        <Spinner />
      </div>
      <p style={S.title}>Memeriksa koneksi...</p>
      <p style={S.subtitle}>Sedang mendeteksi jaringan Anda</p>
    </div>
  )
}

function OfflineState({
  onRetry,
  isRetrying,
  retryCount,
}: {
  onRetry: () => void
  isRetrying: boolean
  retryCount: number
}) {
  return (
    <div style={S.card}>
      <div style={{ ...S.iconWrap, ...S.iconOffline }}>
        <WifiOffIcon />
      </div>
      <p style={S.title}>Tidak ada koneksi internet</p>
      <p style={S.subtitle}>
        Periksa sambungan Wi-Fi atau data seluler Anda, lalu coba lagi.
      </p>

      {retryCount > 0 && (
        <div style={S.retryBadge}>
          Percobaan ke-{retryCount}
        </div>
      )}

      <button
        onClick={onRetry}
        disabled={isRetrying}
        style={{ ...S.btn, ...S.btnRetry, ...(isRetrying ? S.btnDisabled : {}) }}
      >
        {isRetrying ? (
          <>
            <Spinner size={14} color="#00d4c8" />
            <span>Mencoba lagi...</span>
          </>
        ) : (
          <>
            <RetryIcon />
            <span>Coba Lagi</span>
          </>
        )}
      </button>
    </div>
  )
}

function OnlineState({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={S.card}>
      <div style={{ ...S.iconWrap, ...S.iconOnline }}>
        <WifiOnIcon />
      </div>
      <p style={S.title}>Terhubung ke internet</p>
      <p style={S.subtitle}>
        Koneksi Anda aktif. Silakan masuk untuk melanjutkan.
      </p>

      <div style={S.onlineDot}>
        {/* <span style={S.dot} /> */}
        <StatusDot/>
      </div>
     
      <button onClick={onLogin} style={{ ...S.btn, ...S.btnLogin }}>
        <LoginIcon />
        <span>Masuk ke Akun</span>
        <NewWindowIcon />
      </button>

      <p style={S.hint}>Akan membuka di tab browser baru</p>
    </div>
  )
}

// ── Icons (pure SVG, no emoji) ─────────────────────────────────────────────────

function WifiOffIcon() {
  return (
    // <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //   <line x1="1" y1="1" x2="23" y2="23" />
    //   <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    //   <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    //   <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    //   <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    //   <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    //   <circle cx="12" cy="20" r="1" fill="currentColor" />
    // </svg>
    <Icon name="white-wifi-off" size={28}></Icon>
  )
}

function WifiOnIcon() {
  return (
    // <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //   <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    //   <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    //   <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    //   <circle cx="12" cy="20" r="1" fill="currentColor" />
    // </svg>
    <Icon name="white-wifi-on" size={28}></Icon>
  )
}

function RetryIcon() {
  return (
    // <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //   <polyline points="1 4 1 10 7 10" />
    //   <path d="M3.51 15a9 9 0 1 0 .49-3.84" />
    // </svg>
      <Icon name="white-retry" size={28}></Icon>
  )
}

function LoginIcon() {
  return (
    // <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //   <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    //   <polyline points="10 17 15 12 10 7" />
    //   <line x1="15" y1="12" x2="3" y2="12" />
    // </svg>
    <Icon name="white-arrow-right" size={14} invert= {false}></Icon>
  )
}

function NewWindowIcon() {
  return (
    // <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
    //   <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    //   <polyline points="15 3 21 3 21 9" />
    //   <line x1="10" y1="14" x2="21" y2="3" />
    // </svg>
      <Icon name="white-new-window" size={14} invert ={false}></Icon>
  )
}

function Spinner({ size = 20, color = "#8b949e" }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}22`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "ng-spin 0.75s linear infinite",
      flexShrink: 0,
    }} />
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "var(--bg, #0d1117)",
    padding: 24,
  },
  card: {
    background: "var(--bg2, #161b22)",
    border: "1px solid var(--border, #30363d)",
    borderRadius: 16,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 300,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    textAlign: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8b949e",
    marginBottom: 20,
    flexShrink: 0,
  },
  iconOffline: {
    background: "rgba(255, 77, 109, 0.1)",
    color: "#ff4d6d",
  },
  iconOnline: {
    background: "rgba(0, 212, 200, 0.1)",
    color: "#00d4c8",
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text, #e6edf3)",
    margin: "0 0 8px",
    lineHeight: 1.4,
    fontFamily: "var(--font-head, 'DM Sans', system-ui, sans-serif)",
  },
  subtitle: {
    fontSize: 12,
    color: "var(--muted, #8b949e)",
    margin: "0 0 20px",
    lineHeight: 1.6,
    fontFamily: "var(--font-head, 'DM Sans', system-ui, sans-serif)",
  },
  retryBadge: {
    fontSize: 11,
    color: "#f5c842",
    background: "rgba(245, 200, 66, 0.1)",
    border: "1px solid rgba(245, 200, 66, 0.2)",
    borderRadius: 99,
    padding: "3px 10px",
    marginBottom: 14,
    fontFamily: "var(--font-mono, monospace)",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity .15s, transform .1s",
    fontFamily: "var(--font-head, 'DM Sans', system-ui, sans-serif)",
  },
  btnRetry: {
    background: "rgba(0, 212, 200, 0.12)",
    color: "#00d4c8",
    border: "1px solid rgba(0, 212, 200, 0.3)",
  },
  btnLogin: {
    background: "#00d4c8",
    color: "#0d1117",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    pointerEvents: "none" as const,
  },
  onlineDot: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#3dffa0",
    display: "inline-block",
    animation: "ng-pulse 2s ease-in-out infinite",
  },
  hint: {
    fontSize: 11,
    color: "var(--muted, #8b949e)",
    margin: "10px 0 0",
    opacity: 0.7,
    fontFamily: "var(--font-head, 'DM Sans', system-ui, sans-serif)",
  },
}

// Inject keyframes once (no CSS-in-JS lib available)
if (typeof document !== "undefined") {
  const id = "ng-keyframes"
  if (!document.getElementById(id)) {
    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      @keyframes ng-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes ng-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.5; transform: scale(0.85); }
      }
    `
    document.head.appendChild(style)
  }
}