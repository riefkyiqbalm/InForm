// browser-extension/components/chats/MainChat.tsx
import React, { useEffect, useRef, useState } from "react"
import type { InputMode, AttachmentInfo }     from "@sharedUI/types"
import type { StoredDoc }         from "@sharedUI/components/SettingsModal"
import { useChat }                from "@sharedUI/context/ChatContext"
import { useForm, isFillIntent }  from "@sharedUI/context/FormContext"
import { useToast }               from "@sharedUI/context/ToastContext"

import ChatArea          from "@sharedUI/components/chats/ChatArea"
import ChatInputPanel    from "@sharedUI/components/chats/ChatInputPanel"
import LeftPanel         from "@sharedUI/components/chats/LeftPanel"
import TopPanel          from "@sharedUI/components/chats/TopPanel"
import FirstOpenHint     from "~components/FirstOpenHint"


// ── Build a human-readable fill reply for MessageBubble ───────────────────────
function buildFillReply(
  filled: number,
  skipped: string[],
  total: number,
  score: number
): string {
  if (score === -1) {
    return "❌ Gagal mengisi form. Terjadi kesalahan saat menjalankan auto-fill."
  }
  if (total === 0) {
    return "⚠️ Tidak ada form yang terdeteksi di halaman aktif. Pastikan halaman berisi input form, lalu coba lagi."
  }
  if (filled === 0) {
    return `⚠️ Form terdeteksi (${total} field) namun tidak ada yang berhasil diisi. AI mungkin belum memiliki data yang cocok — coba unggah dokumen referensi melalui Pengaturan → Memori.`
  }

  const bar    = buildBar(score)
  const skips  = skipped.length > 0
    ? `\n\n**Field yang dilewati:** ${skipped.join(", ")}`
    : ""
  const emoji  = score >= 80 ? "🎉" : score >= 50 ? "✅" : "⚠️"

  return `${emoji} **Form berhasil diisi!**

${bar} **${score}%** (${filled}/${total} field)${skips}

Form di halaman aktif telah diisi secara otomatis. Periksa hasilnya dan lakukan koreksi jika diperlukan.`
}

function buildBar(score: number): string {
  const filled = Math.round(score / 10)
  return "█".repeat(filled) + "░".repeat(10 - filled)
}

// Add this helper function inside MainChat.tsx (before the component definition or inside it)
const convertStoredDocsToAttachments = (docs: StoredDoc[]): AttachmentInfo[] => {
  return docs.map((doc) => ({
    id: doc.documentId,
    name: doc.name,
    type: doc.type || 'application/octet-stream', // Fallback if type is missing
    // Convert size: if it's a number string, parse it; otherwise default to 0 or extract bytes if formatted
    size: typeof doc.size === 'string' ? parseFloat(doc.size) || 0 : (doc.size as number), 
    // url: doc.url,
    // Ensure any other required AttachmentInfo fields are mapped here
  }));
};

export default function MainChat() {
  const {
    activeSession, activeSessionId,
    loadingSessionId, sendMessage, setLoadingSessionId,
    createSession, addMessage,
    abortedMessage, clearAborted, retryMessage,
  } = useChat()

  const { toast }               = useToast()
  const { isFilling, fillAllNow } = useForm()

  const [input,           setInput]           = useState("")
  const [inputMode,       setInputMode]       = useState<InputMode>("text")
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<StoredDoc[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null)
  const chatEndRef         = useRef<HTMLDivElement>(null)
  const textareaRef        = useRef<HTMLTextAreaElement | null>(null)

  const isCurrentLoading = loadingSessionId !== null
  const messages         = (activeSession?.messages ?? []) as any[]
  const isWelcomeScreen  = messages.length === 0

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeSession?.messages, isCurrentLoading, isFilling])

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const handleToggleLeftPanel = () => setIsLeftPanelOpen((p) => !p)

  const handleStop = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }
  

  // ── handleSend ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim(); // Ubah nama variabel agar tidak bingung

    if ((!text && pendingFiles.length === 0) || isCurrentLoading || isFilling) return;

    const filesToSend = [...pendingFiles];
    const attachments = convertStoredDocsToAttachments(filesToSend);
    setInput("");
    setPendingFiles([]); // Kosongkan preview setelah tombol kirim ditekan

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Ensure session exists
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      try { targetSessionId = await createSession() }
      catch { toast("Gagal membuat sesi baru.", "error"); return }
    }

    // ── INJEKSI FILE KE DALAM TEKS UNTUK AI ─────────────────────────────────
    let finalPrompt = text;
    if (filesToSend.length > 0) {
      // Buat string berisi InFormasi file.
      // Jika StoredDoc Anda memiliki properti konten teks (misal: f.content atau f.text),
      // Anda BISA menambahkannya di sini agar AI langsung bisa membacanya.
     const fileInfo = filesToSend.map(f => "[Nama File: " + f.name + "]\nIsi File:\n" + f.type).join("\n\n");

      if (text) {
        finalPrompt = `${text}\n\n---\nCatatan untuk AI: Pengguna melampirkan file berikut:\n${fileInfo}`;
      } else {
        finalPrompt = `Tolong analisis file berikut:\n${fileInfo}`;
      }
    }

    // ── Fill intent ──────────────────────────────────────────────────────────
    if (isFillIntent(finalPrompt)) {
      clearAborted()

      // FIX Bug 3: Set loading state before starting fill operation
      setLoadingSessionId(targetSessionId)

      // 1. Add user message to chat history via normal sendMessage (fire-and-forget)
      //    We don't await it — fill runs in parallel
      
      const controller = new AbortController()
      abortControllerRef.current = controller
      // FIX Bug 4: Pass finalPrompt (which includes file info) instead of original text
      sendMessage({ text: finalPrompt, signal: controller.signal, sessionId: targetSessionId, attachments }).catch(() => {})

      // 2. Execute fill
      const result = await fillAllNow()

      // Clear loading state after fill completes
      setLoadingSessionId(null)

      if (result === null) {
        // Page is being analyzed — tell user to wait and try again
        addMessage(targetSessionId, {
          role:      "ASSISTANT",
          text:      "⏳ AI sedang membaca dan menganalisis form di halaman ini. Harap tunggu beberapa detik, lalu kirim perintah yang sama lagi.",
          sessionId: targetSessionId,
        })
        return
      }

      // 3. Build reply text and add as ASSISTANT message in MessageBubble
      const replyText = buildFillReply(result.filled, result.skipped, result.total, result.score)
      addMessage(targetSessionId, {
        role:      "ASSISTANT",
        text:      replyText,
        sessionId: targetSessionId,
      })

      // 4. Show toast on success
      if (result.filled > 0) {
        toast(`+ ${result.filled} field berhasil diisi! Skor: ${result.score}%`, "success")
      } else if (result.total > 0) {
        toast("Form terdeteksi tapi tidak ada field yang terisi.", "warn")
      }

      return
    }

    // ── Normal chat message ──────────────────────────────────────────────────
    clearAborted()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // FIX Bug 4: Pass finalPrompt (which includes file info) instead of original text
      await sendMessage({ text: finalPrompt, signal: controller.signal, sessionId: targetSessionId, attachments })
    } catch {
      toast("Gagal terhubung ke AI. Pastikan Backend aktif.", "error")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => { textareaRef.current?.focus(); resizeTextarea() }, 50)
  }

  const handleFileUpload = (file: File) => {
    setInput(`[File: ${file.name}] Tolong analisis data dari file ini.`)
    setInputMode("text")
    toast(`File "${file.name}" ditambahkan.`, "info")
  }

  const handleRetry = async (text: string) => {
    try { await retryMessage(text) }
    catch { toast("Gagal mengirim ulang.", "error") }
  }

  return (
    <div style={S.root}>
      <LeftPanel isOpen={isLeftPanelOpen} setIsOpen={setIsLeftPanelOpen} onClose={() => setIsLeftPanelOpen(false)} />
      {isLeftPanelOpen && <div style={S.backdrop} onClick={() => setIsLeftPanelOpen(false)} />}

      <main style={S.main}>
        <TopPanel isLeftPanelOpen={isLeftPanelOpen} onToggleLeftPanel={handleToggleLeftPanel} />
        <FirstOpenHint/>

        <ChatArea
          messages={messages}
          isWelcomeScreen={isWelcomeScreen}
          onSelectSuggestion={handleSelectSuggestion}
          isCurrentLoading={isCurrentLoading || isFilling}
        />

        <ChatInputPanel
          input={input}
          onInput={setInput}
          inputMode={inputMode}
          onModeChange={setInputMode}
          isCurrentLoading={isCurrentLoading || isFilling}
          onSend={handleSend}
          onStop={handleStop}
          onFileUpload={handleFileUpload}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          onResizeTextarea={resizeTextarea}
          interruptedMessage={abortedMessage}
          onRetry={handleRetry}
          onDismissInterrupt={clearAborted}
          isOpen={!isLeftPanelOpen}
          pendingFiles={pendingFiles}
          setPendingFiles={setPendingFiles}
        />
        <div ref={chatEndRef} />
      </main>

      <style>{`
        .dot-blink{width:6px;height:6px;background-color:var(--teal,#00d4c8);border-radius:50%;display:inline-block;animation:blink 1.4s infinite ease-in-out both;}
        @keyframes blink{0%,80%,100%{opacity:0.3;transform:scale(0.8)}40%{opacity:1;transform:scale(1.1)}}
        .animate-fade-up{animation:fadeUp 0.5s ease-out;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  root:     { display:"flex", height:"100vh", background:"var(--bg)", color:"var(--text)", overflow:"hidden", position:"relative" },
  main:     { flex:1, display:"flex", flexDirection:"column", minWidth:0, position:"relative" },
  backdrop: { position:"absolute", inset:0, zIndex:99, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(1px)", WebkitBackdropFilter:"blur(1px)", cursor:"pointer" },
}