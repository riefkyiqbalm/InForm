// components/auth/MainLogin.tsx — Plasmo-compatible (no Next.js)
import { useState } from "react"
import { useAuth } from "~features/AuthContext"

// ── You should have these components already; adjust paths if needed ───────────
// If you don't have them yet, minimal stubs are provided at the bottom of this file.
import Background from "~components/Background"
import Welcome from "~components/Welcome"
import { Card } from "~components/Cards"
import { TabButtons } from "~components/Tabbutons"
import { LoginForm } from "~components/auth/LoginForm"
import { RegisterForm } from "~components/auth/RegisterForm"

// ── Simple error parser ────────────────────────────────────────────────────────
function parseErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message || fallback
  if (typeof err === "string") return err
  return fallback
}

type Panel = "login" | "register"
type Screen = "auth" | "verify-email" | "forgot-password"

export default function LoginPage() {
  const { login, register, forgotPassword, loading } = useAuth()

  const [activePanel,    setActivePanel]    = useState<Panel>("login")
  const [screen,         setScreen]         = useState<Screen>("auth")
  const [error,          setError]          = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [pendingEmail,   setPendingEmail]   = useState("")

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ ...S.root, justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: 28, height: 28, border: "2px solid #1e293b",
          borderTop: "2px solid #00d4c8", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Verify email screen ────────────────────────────────────────────────────
  if (screen === "verify-email") {
    return (
      <div style={S.root}>
        <div style={S.container}>
          <Background />
          <Card>
            <div style={{ textAlign: "center", padding: "24px 16px" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
              <h2 style={{ color: "#e6edf3", marginBottom: 8, fontSize: 18 }}>
                Verifikasi Email
              </h2>
              <p style={{ color: "#8b949e", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                Kami telah mengirimkan tautan verifikasi ke{" "}
                <strong style={{ color: "#00d4c8" }}>{pendingEmail}</strong>.
                Silakan cek kotak masuk dan folder spam Anda.
              </p>
              <button
                onClick={() => { setScreen("auth"); setSuccessMessage(""); setError(""); }}
                style={S.backButton}
              >
                ← Kembali ke Login
              </button>
            </div>
          </Card>
        </div>
        <AnimStyles />
      </div>
    )
  }

  // ── Forgot password screen ─────────────────────────────────────────────────
  if (screen === "forgot-password") {
    return (
      <div style={S.root}>
        <div style={S.container}>
          <Background />
          <Card>
            <ForgotPasswordForm
              onSubmit={async (email) => {
                try {
                  await forgotPassword(email)
                  setSuccessMessage(`Link reset dikirim ke ${email}`)
                  setScreen("auth")
                } catch (err) {
                  setError(parseErrorMessage(err, "Gagal mengirim email reset."))
                }
              }}
              loading={loading}
              error={error}
              onBack={() => { setScreen("auth"); setError(""); }}
            />
          </Card>
        </div>
        <AnimStyles />
      </div>
    )
  }

  // ── Login / Register ───────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    try {
      setError("")
      await login(email, password)
      // AuthContext sets user → SidePanelContent re-renders → MainChat shown automatically
    } catch (err: unknown) {
      setError(parseErrorMessage(err, "Login gagal. Periksa kembali akun Anda."))
    }
  }

  const handleRegister = async (email: string, password: string, username: string) => {
    try {
      setError("")
      await register(email, password, username)
      // Show verify-email screen inline instead of router.push
      setPendingEmail(email)
      setScreen("verify-email")
    } catch (err: unknown) {
      setError(parseErrorMessage(err, "Pendaftaran gagal."))
    }
  }

  return (
    <div style={S.root}>
      <div style={S.container}>
        <Background />
        <Welcome />

        <Card>
          <TabButtons
            active={activePanel}
            onChange={(panel) => {
              setActivePanel(panel as Panel)
              setError("")
              setSuccessMessage("")
            }}
          />

          {/* Success banner (e.g. after returning from forgot-password) */}
          {successMessage && (
            <div style={S.successBanner}>{successMessage}</div>
          )}

          {activePanel === "login" ? (
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
              onError={setError}
              onForgotPassword={() => { setScreen("forgot-password"); setError(""); }}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              loading={loading}
              error={error}
              onError={setError}
            />
          )}

          <div style={S.footer}>
            Dengan melanjutkan, Anda menyetujui{" "}
            <a
              href="https://inform-anda.com/terms"
              target="_blank"
              rel="noreferrer"
              style={S.link}
            >
              Ketentuan Layanan
            </a>
          </div>
        </Card>
      </div>

      <AnimStyles />
    </div>
  )
}

// ── Minimal ForgotPasswordForm (inline since it only appears here) ─────────────
function ForgotPasswordForm({
  onSubmit, loading, error, onBack,
}: {
  onSubmit: (email: string) => Promise<void>
  loading:  boolean
  error:    string
  onBack:   () => void
}) {
  const [email, setEmail] = useState("")
  return (
    <div style={{ padding: "8px 0" }}>
      <h3 style={{ color: "#e6edf3", marginBottom: 12, fontSize: 16 }}>
        Reset Kata Sandi
      </h3>
      <p style={{ color: "#8b949e", fontSize: 12, marginBottom: 16 }}>
        Masukkan email Anda. Kami akan mengirim tautan untuk mereset kata sandi.
      </p>
      {error && <div style={{ color: "#ff4d6d", fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={S.input}
      />
      <button
        onClick={() => onSubmit(email)}
        disabled={loading || !email}
        style={{ ...S.btn, marginBottom: 8 }}
      >
        {loading ? "Mengirim..." : "Kirim Link Reset"}
      </button>
      <button onClick={onBack} style={S.backButton}>← Kembali</button>
    </div>
  )
}

// ── Animation styles ───────────────────────────────────────────────────────────
function AnimStyles() {
  return (
    <style>{`
      @keyframes floatOrb {
        0%, 100% { transform: translateY(0) scale(1); }
        50%       { transform: translateY(-30px) scale(1.05); }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 30px #1e293b inset !important;
        -webkit-text-fill-color: #e6edf3 !important;
      }
    `}</style>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "relative",
    background: "var(--bg, #0d1117)",
    color: "var(--text, #e6edf3)",
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1,
  },
  footer: {
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
    color: "#8b949e",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  backButton: {
    background: "transparent",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    fontSize: 13,
    padding: "4px 0",
    width: "100%",
    textAlign: "center",
  },
  successBanner: {
    background: "#0a1f12",
    border: "1px solid #1a7a4a",
    color: "#3dffa0",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #30363d",
    background: "#1e293b",
    color: "#e6edf3",
    fontSize: 13,
    marginBottom: 12,
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "none",
    background: "#00d4c8",
    color: "#0d1117",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
}