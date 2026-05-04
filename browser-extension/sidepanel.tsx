// sidepanel.tsx — Plasmo entry point
import "~lib/theme-bootstrap";

import globalStyles from "data-text:~styles/global.css";
import MainChat     from "~components/chats/MainChat";
import NetworkGuard from "~components/NetworkGuard";

import { useAuth }               from "@sharedUI/context/SharedAuthContext";
import { ChatProvider }          from "@sharedUI/context/ChatContext";
import { FormProvider }          from "@sharedUI/context/FormContext";
import { ToastProvider }         from "@sharedUI/context/ToastContext";
import { ListeningAuthProvider } from "@sharedUI/context/ListeningAuthContext";
import { ThemeProvider }         from "@sharedUI/context/ThemeContext";

function LoadingScreen() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"var(--bg)", color:"var(--muted)", fontSize:14, fontFamily:"var(--font-body,'DM Sans',system-ui,sans-serif)", flexDirection:"column", gap:12 }}>
      <div style={{ width:32, height:32, border:"2px solid var(--border)", borderTop:"2px solid var(--teal)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <span>Memuat InForm...</span>
    </div>
  );
}

function SidePanelContent() {
  const { isAuthenticated, loading } = useAuth();
  if (loading)          return <LoadingScreen />;
  if (!isAuthenticated) return <NetworkGuard />;
  return <MainChat />;
}

export default function SidePanel() {
  return (
    <>
      <style>{globalStyles}</style>
      <ThemeProvider>
        <ToastProvider>
          <ListeningAuthProvider>
            <ChatProvider>
              <FormProvider>
                <SidePanelContent />
              </FormProvider>
            </ChatProvider>
          </ListeningAuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}
