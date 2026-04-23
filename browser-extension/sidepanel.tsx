// sidepanel.tsx — Plasmo entry point
import globalStyles                   from "data-text:~styles/globals.css"
import MainChat                       from "~components/chats/MainChat"
import NetworkGuard                   from "~components/NetworkGuard"

import { AuthProvider, useAuth }      from "@sharedUI/context/AuthContext"
import { ChatProvider}                from "@sharedUI/context/ChatContext"
import { FormProvider }               from "~features/FormContext"
import { ToastProvider }              from "@sharedUI/context/ToastContext"


const FALLBACK_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0d1117; --bg2:#161b22; --panel:#161b22;
    --text:#e6edf3; --muted:#8b949e; --teal:#00d4c8;
    --teal-dim:rgba(0,212,200,0.25); --border:#30363d;
    --font-mono:'JetBrains Mono','Fira Code',monospace;
    --font-head:'DM Sans',system-ui,sans-serif;
  }
  body { background:var(--bg); color:var(--text); font-family:'DM Sans',system-ui,sans-serif; }
  .dot-blink{width:6px;height:6px;background:var(--teal);border-radius:50%;display:inline-block;animation:blink 1.4s infinite ease-in-out both;}
  @keyframes blink{0%,80%,100%{opacity:0.3;transform:scale(0.8)}40%{opacity:1;transform:scale(1.1)}}
  .animate-fade-up{animation:fadeUp 0.5s ease-out;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg);}}
`

function LoadingScreen() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0d1117", color:"#8b949e", fontSize:14, fontFamily:"system-ui,sans-serif", flexDirection:"column", gap:12 }}>
      <div style={{ width:32, height:32, border:"2px solid #30363d", borderTop:"2px solid #00d4c8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <span>Memuat InForm...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )
}

function SidePanelContent() {
  const { isAuthenticated, loading } = useAuth()
  if (loading)          return <LoadingScreen />
  if (!isAuthenticated) return <NetworkGuard />
  return <MainChat />
}

export default function SidePanel() {
  return (
    <>
      <style>{globalStyles || FALLBACK_CSS}</style>
      <ToastProvider>
        <AuthProvider>
          <ChatProvider>
            <FormProvider>
              <SidePanelContent />
            </FormProvider>
          </ChatProvider>
        </AuthProvider>
      </ToastProvider>
    </>
  )
}