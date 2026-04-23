// // features/AppContext.tsx
// // Unified context merging ChatContext + FormContext.
// // 
// // Routing logic:
// //   TEXT message → POST /api/chat/sessions/:id/messages → Flask LangGraph
// //   FILE upload  → POST /api/document (extract) + POST /api/analyze (AI fill)
// //
// // Vercel AI SDK multimodal: handled in the Next.js messages route via
// // the experimental_attachments field — the extension passes documentIds
// // and the route fetches rawText from DB to include as multimodal context.

// import React, {
//   createContext, useCallback, useContext,
//   useEffect, useMemo, useRef, useState,
// } from "react"
// import type {
//   ChatSession, InterruptedMessage, SendMessageArgs,
//   ChatContextType, ChatMessage,
// } from "@sharedUI/types"
// import { loadDocs } from "@sharedUI/components/SettingsModal"
// import type { StoredDoc } from "@sharedUI/components/SettingsModal"

// // ── Env / constants ────────────────────────────────────────────────────────────
// const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000"
// const KEY_TOKEN   = "_auth_token"

// async function getToken(): Promise<string | null> {
//   try { const r = await chrome.storage.local.get(KEY_TOKEN); return (r[KEY_TOKEN] as string) || null }
//   catch { return null }
// }
// function authHeaders(token: string): HeadersInit {
//   return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
// }

// // ── URL builders ───────────────────────────────────────────────────────────────
// const SESSIONS    = `${NEXTJS_BASE}/api/chat/sessions`
// const sessionUrl  = (id: string) => `${NEXTJS_BASE}/api/chat/sessions/${id}`
// const messagesUrl = (id: string) => `${NEXTJS_BASE}/api/chat/sessions/${id}/messages`
// const ANALYZE_URL = `${NEXTJS_BASE}/api/analyze`

// // ── Fill intent ────────────────────────────────────────────────────────────────
// export function isFillIntent(text: string): boolean {
//   const t = text.toLowerCase().trim()
//   return [
//     /isi\s*(form|formulir)/,
//     /fill\s*(this\s*)?(form|out)/,
//     /auto[\s-]?fill/,
//     /lengkapi\s*(form|formulir|data)/,
//     /tolong\s*isi/, /bantu\s*isi/,
//     /using\s*my\s*data/,
//     /dengan\s*data\s*(saya|ku|aku)/,
//     /gunakan\s*data/,
//   ].some((p) => p.test(t))
// }

// // ── Fill result ────────────────────────────────────────────────────────────────
// export interface FillResult {
//   filled:  number
//   skipped: string[]
//   total:   number
//   score:   number
// }

// // ── Unified context type ───────────────────────────────────────────────────────
// export interface AppContextType extends ChatContextType {
//   // Chat (extended)
//   createSession: () => Promise<string>

//   // File/multimodal
//   pendingDocs:       StoredDoc[]          // docs attached to current input
//   attachDocs:        (docs: StoredDoc[]) => void
//   clearPendingDocs:  () => void
//   sendWithFile:      (args: SendMessageArgs & { docs: StoredDoc[] }) => Promise<void>

//   // Form fill
//   isFilling:   boolean
//   fillAllNow:  () => Promise<FillResult | null>
// }

// // ── Sort helper ────────────────────────────────────────────────────────────────
// function sortSessions(list: ChatSession[]): ChatSession[] {
//   const pinned   = list.filter((s) =>  s.pinnedAt).sort((a,b) => new Date(b.pinnedAt!).getTime()-new Date(a.pinnedAt!).getTime())
//   const unpinned = list.filter((s) => !s.pinnedAt).sort((a,b) => new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime())
//   return [...pinned, ...unpinned]
// }

// const AppContext = createContext<AppContextType | undefined>(undefined)

// export function AppProvider({ children }: { children: React.ReactNode }) {
//   // ── Chat state ─────────────────────────────────────────────────────────────
//   const [sessions,         setSessions]         = useState<ChatSession[]>([])
//   const [activeSessionId,  setActiveSessionId]  = useState<string>("")
//   const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)
//   const [isLoading,        setIsLoading]        = useState(false)
//   const [error,            setError]            = useState<string | null>(null)
//   const [abortedMessage,   setAbortedMessage]   = useState<InterruptedMessage | null>(null)

//   // ── File/multimodal state ──────────────────────────────────────────────────
//   const [pendingDocs,  setPendingDocs]  = useState<StoredDoc[]>([])
//   const [isFilling,    setIsFilling]    = useState(false)

//   const clearError      = useCallback(() => setError(null), [])
//   const clearAborted    = useCallback(() => setAbortedMessage(null), [])
//   const attachDocs      = useCallback((docs: StoredDoc[]) => setPendingDocs((prev) => [...prev, ...docs]), [])
//   const clearPendingDocs = useCallback(() => setPendingDocs([]), [])

//   // ── Load sessions on mount ─────────────────────────────────────────────────
//   useEffect(() => {
//     const fetch_ = async () => {
//       const token = await getToken()
//       if (!token) { setSessions([]); return }
//       try {
//         const res = await fetch(SESSIONS, { headers: authHeaders(token) })
//         if (res.ok) {
//           const data   = await res.json() as { sessions?: ChatSession[] }
//           const sorted = sortSessions(data.sessions ?? [])
//           setSessions(sorted)
//           if (sorted.length > 0) setActiveSessionId(sorted[0].id)
//         }
//       } catch (e) { console.error("[AppContext] fetchSessions:", e) }
//     }
//     fetch_()
//   }, [])

//   // ── loadSession ────────────────────────────────────────────────────────────
//   const loadSession = useCallback(async (id: string) => {
//     const token = await getToken()
//     if (!token) return
//     try {
//       const res = await fetch(sessionUrl(id), { headers: authHeaders(token) })
//       if (res.ok) {
//         const data = await res.json() as { session: ChatSession }
//         setSessions((prev) => sortSessions(prev.map((s) => s.id === id ? data.session : s)))
//       }
//     } catch (e) { console.error("[AppContext] loadSession:", e) }
//   }, [])

//   useEffect(() => { if (activeSessionId) loadSession(activeSessionId) }, [activeSessionId, loadSession])

//   // ── createSession ──────────────────────────────────────────────────────────
//   const createSession = useCallback(async (): Promise<string> => {
//     const token = await getToken()
//     setIsLoading(true); setError(null)
//     try {
//       const res = await fetch(SESSIONS, { method:"POST", headers: authHeaders(token!) })
//       if (!res.ok) throw new Error(`HTTP ${res.status}`)
//       const data = await res.json() as { session: ChatSession }
//       setSessions((prev) => sortSessions([data.session, ...prev]))
//       setActiveSessionId(data.session.id)
//       return data.session.id
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Gagal membuat sesi"
//       setError(msg); throw e
//     } finally { setIsLoading(false) }
//   }, [])

//   // ── deleteSession ──────────────────────────────────────────────────────────
//   const deleteSession = useCallback(async (sessionId: string) => {
//     const token = await getToken()
//     const res   = await fetch(sessionUrl(sessionId), { method:"DELETE", headers: authHeaders(token!) })
//     if (!res.ok) {
//       const e = await res.json().catch(()=>({})) as { error?: string }
//       throw new Error(e.error ?? `Gagal menghapus (${res.status})`)
//     }
//     const body = await res.json() as { nextSessionId: string | null }
//     setSessions((prev) => prev.filter((s) => s.id !== sessionId))
//     setActiveSessionId(body.nextSessionId ?? "")
//   }, [])

//   // ── renameSession ──────────────────────────────────────────────────────────
//   const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
//     const trimmed  = newTitle.trim()
//     if (!trimmed) throw new Error("Judul tidak boleh kosong")
//     const token    = await getToken()
//     const original = sessions.find((s) => s.id === sessionId)?.title ?? trimmed
//     setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, title: trimmed } : s))
//     const res = await fetch(sessionUrl(sessionId), { method:"PATCH", headers: authHeaders(token!), body: JSON.stringify({ title: trimmed }) })
//     if (!res.ok) {
//       setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, title: original } : s))
//       const e = await res.json().catch(()=>({})) as { error?: string }
//       throw new Error(e.error ?? "Gagal rename")
//     }
//     const data = await res.json() as { session: { id:string; title:string } }
//     setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, title: data.session.title } : s))
//   }, [sessions])

//   // ── pinSession ─────────────────────────────────────────────────────────────
//   const pinSession = useCallback(async (sessionId: string) => {
//     const token   = await getToken()
//     const current = sessions.find((s) => s.id === sessionId)
//     if (!current) return
//     const isPinned    = Boolean(current.pinnedAt)
//     const newPinnedAt = isPinned ? null : new Date().toISOString()
//     setSessions((prev) => sortSessions(prev.map((s) => s.id === sessionId ? { ...s, pinnedAt: newPinnedAt } : s)))
//     const res = await fetch(sessionUrl(sessionId), { method:"PATCH", headers: authHeaders(token!), body: JSON.stringify({ action: isPinned ? "unpin" : "pin" }) })
//     if (!res.ok) {
//       setSessions((prev) => sortSessions(prev.map((s) => s.id === sessionId ? { ...s, pinnedAt: current.pinnedAt } : s)))
//       const e = await res.json().catch(()=>({})) as { error?: string }
//       throw new Error(e.error ?? "Gagal pin")
//     }
//     const data = await res.json() as { session: { id:string; pinnedAt: string|null } }
//     setSessions((prev) => sortSessions(prev.map((s) => s.id === sessionId ? { ...s, pinnedAt: data.session.pinnedAt } : s)))
//   }, [sessions])

//   // ── setActiveSession ───────────────────────────────────────────────────────
//   const setActiveSession = useCallback((sessionId: string) => {
//     setSessions((prev) => { if (prev.some((s) => s.id === sessionId)) setActiveSessionId(sessionId); return prev })
//   }, [])

//   // ── addMessage (optimistic) ────────────────────────────────────────────────
//   const addMessage = useCallback((sessionId: string, payload: Omit<ChatMessage,"id"|"createdAt">) => {
//     setSessions((prev) => prev.map((session) => {
//       if (session.id !== sessionId) return session
//       const msg: ChatMessage = { ...payload, id:`${sessionId}_${Date.now()}`, createdAt: new Date().toISOString() }
//       return { ...session, updatedAt: new Date().toISOString(), messages: [...(session.messages ?? []), msg] }
//     }))
//   }, [])

//   // ── sendMessage — TEXT path → /api/chat/sessions/:id/messages ─────────────
//   const sendMessage = useCallback(async ({ text, signal, sessionId }: SendMessageArgs) => {
//     const targetSession = sessionId ?? activeSessionId
//     if (!targetSession || !text.trim()) return

//     const token = await getToken()
//     setLoadingSessionId(targetSession)

//     // Optimistic user bubble
//     const tempMsg: ChatMessage = {
//       id: `temp-${Date.now()}`, role:"USER", text,
//       sessionId: targetSession, createdAt: new Date().toISOString(),
//     }
//     setSessions((prev) => prev.map((s) => s.id === targetSession
//       ? { ...s, messages: [...(s.messages ?? []), tempMsg] } : s))

//     try {
//       const res = await fetch(messagesUrl(targetSession), {
//         method: "POST", headers: authHeaders(token!),
//         body:   JSON.stringify({ message: text }),
//         signal,
//       })
//       if (!res.ok) {
//         await loadSession(targetSession)
//         const e = await res.json().catch(()=>({})) as { error?: string }
//         throw new Error(e.error ?? "Gagal mengirim pesan")
//       }
//       const data = await res.json() as { aborted?: boolean; originalText?: string }
//       if (data.aborted) {
//         await loadSession(targetSession)
//         setAbortedMessage({ text: data.originalText ?? text, sessionId: targetSession })
//         return
//       }
//       await loadSession(targetSession)
//       setAbortedMessage(null)
//     } catch (e: unknown) {
//       if (e instanceof Error && e.name === "AbortError") {
//         await loadSession(targetSession); setAbortedMessage({ text, sessionId: targetSession }); return
//       }
//       setError("Gagal mengirim pesan.")
//       await loadSession(targetSession)
//     } finally { setLoadingSessionId(null) }
//   }, [activeSessionId, loadSession])

//   // ── sendWithFile — FILE path → /api/document + /api/analyze ───────────────
//   // When user uploads file(s) via AttachButton:
//   //   1. Add optimistic user bubble showing file names
//   //   2. POST /api/analyze with schema (current page form) + documentIds
//   //   3. Inject fill buttons on page via content.ts
//   //   4. Add AI reply bubble with analysis summary
//   const sendWithFile = useCallback(async ({
//     text, signal, sessionId, docs,
//   }: SendMessageArgs & { docs: StoredDoc[] }) => {
//     const targetSession = sessionId ?? activeSessionId
//     if (!targetSession) return

//     const token = await getToken()
//     setLoadingSessionId(targetSession)

//     // Build display text for bubble
//     const fileNames = docs.map((d) => d.name).join(", ")
//     const bubbleText = text || `📎 File diunggah: ${fileNames}`

//     // Optimistic user bubble
//     const tempMsg: ChatMessage = {
//       id: `temp-${Date.now()}`, role:"USER", text: bubbleText,
//       sessionId: targetSession, createdAt: new Date().toISOString(),
//     }
//     setSessions((prev) => prev.map((s) => s.id === targetSession
//       ? { ...s, messages: [...(s.messages ?? []), tempMsg] } : s))

//     try {
//       // Scrape current page form schema
//       let schema: unknown[] = []
//       try {
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
//         if (tab?.id) {
//           const results = await chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             func: () => (window as any).scrapeForm?.() ?? [],
//           })
//           schema = results[0]?.result ?? []
//         }
//       } catch { /* no form on page — analyze will just use document text */ }

//       // Call /api/analyze with all documentIds
//       const analyzeRes = await fetch(ANALYZE_URL, {
//         method:  "POST",
//         headers: authHeaders(token!),
//         body:    JSON.stringify({
//           schema,
//           documentIds: docs.map((d) => d.documentId),
//         }),
//         signal,
//       })

//       if (!analyzeRes.ok) {
//         const e = await analyzeRes.json().catch(()=>({})) as { error?: string }
//         addMessage(targetSession, {
//           role: "ASSISTANT",
//           text: `❌ Gagal menganalisis file: ${e.error ?? analyzeRes.status}`,
//           sessionId: targetSession,
//         })
//         return
//       }

//       const analyzeData = await analyzeRes.json() as {
//         filled: Record<string, { value: string; confidence: number; source: string }>
//         summary?: string
//       }

//       // If form schema was scraped, inject fill buttons on the page
//       if (schema.length > 0 && Object.keys(analyzeData.filled ?? {}).length > 0) {
//         try {
//           const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
//           if (tab?.id) {
//             await chrome.tabs.sendMessage(tab.id, {
//               type:    "INJECT_FILL_BUTTONS",
//               payload: analyzeData.filled,
//             }).catch(() => {})
//           }
//         } catch { /* tab may not support scripting */ }
//       }

//       // Build AI summary reply
//       const fieldCount  = Object.keys(analyzeData.filled ?? {}).length
//       const replyText   = analyzeData.summary
//         ?? (fieldCount > 0
//           ? `✅ Dokumen **${fileNames}** berhasil dianalisis.\n\n` +
//             `AI menemukan **${fieldCount} field** yang dapat diisi dari dokumen ini.\n` +
//             (schema.length > 0
//               ? `Tombol "✦ Fill" telah muncul di samping setiap field. ` +
//                 `Ketik **"isi form dengan data saya"** untuk mengisi semua sekaligus.`
//               : `Buka halaman dengan form, lalu ketik **"isi form dengan data saya"**.`)
//           : `⚠️ Dokumen **${fileNames}** diproses, namun AI tidak menemukan data yang cocok untuk form yang terdeteksi.\n\n` +
//             `Pastikan dokumen berisi informasi relevan seperti nama, alamat, tanggal, dll.`)

//       addMessage(targetSession, {
//         role: "ASSISTANT", text: replyText, sessionId: targetSession,
//       })

//       // Also persist into normal chat session for continuity
//       await fetch(messagesUrl(targetSession), {
//         method:  "POST",
//         headers: authHeaders(token!),
//         body:    JSON.stringify({
//           message:     bubbleText,
//           attachments: docs.map((d) => ({ documentId: d.documentId, name: d.name })),
//         }),
//         signal,
//       }).catch(() => {}) // fire-and-forget

//       clearPendingDocs()
//       await loadSession(targetSession)

//     } catch (e: unknown) {
//       if (e instanceof Error && e.name === "AbortError") { return }
//       addMessage(targetSession, {
//         role: "ASSISTANT",
//         text: "❌ Terjadi kesalahan saat memproses file. Coba lagi.",
//         sessionId: targetSession,
//       })
//     } finally { setLoadingSessionId(null) }
//   }, [activeSessionId, addMessage, clearPendingDocs, loadSession])

//   // ── retryMessage ───────────────────────────────────────────────────────────
//   const retryMessage = useCallback(async (text: string) => {
//     if (!abortedMessage) return
//     setAbortedMessage(null)
//     await sendMessage({ text, sessionId: abortedMessage.sessionId })
//   }, [abortedMessage, sendMessage])

//   // ── fillAllNow — form fill via content.ts ─────────────────────────────────
//   const fillAllNow = useCallback(async (): Promise<FillResult | null> => {
//     setIsFilling(true)
//     try {
//       const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
//       if (!tab?.id) return { filled:0, skipped:[], total:0, score:-1 }

//       const result = await chrome.tabs.sendMessage(tab.id, { type:"FILL_ALL" })
//         .catch(()=>null) as { filled:number; skipped:string[] } | null

//       if (result) {
//         const total = result.filled + result.skipped.length
//         const score = total > 0 ? Math.round((result.filled/total)*100) : 0

//         // Save assessment
//         const token = await getToken()
//         fetch(`${NEXTJS_BASE}/api/assessment`, {
//           method:  "POST",
//           headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}) },
//           body:    JSON.stringify({ targetDomain: tab.url ?? "", missingFields: result.skipped, score: score/100 }),
//         }).catch(()=>{})

//         return { ...result, total, score }
//       }

//       // content.ts not ready yet — trigger fresh scrape + analyze
//       const scrapeResult = await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         func: () => (window as any).scrapeForm?.() ?? [],
//       })
//       const fields = scrapeResult[0]?.result ?? []
//       if (!fields.length) return { filled:0, skipped:[], total:0, score:0 }

//       // Get documentIds from memory
//       const docs    = loadDocs()
//       const token   = await getToken()

//       if (docs.length === 0) {
//         // No docs — tell background to analyze with general knowledge
//         chrome.runtime.sendMessage({ type:"PAGE_HAS_FORM", payload:{ fields, url: tab.url ?? "" } })
//         return null  // "analyzing, please wait"
//       }

//       // Analyze with stored documents
//       const analyzeRes = await fetch(ANALYZE_URL, {
//         method:  "POST",
//         headers: authHeaders(token!),
//         body:    JSON.stringify({ schema: fields, documentIds: docs.map((d)=>d.documentId) }),
//       })
//       if (!analyzeRes.ok) return { filled:0, skipped:[], total:0, score:-1 }

//       const analyzeData = await analyzeRes.json() as { filled: Record<string,{ value:string }> }

//       await chrome.tabs.sendMessage(tab.id, { type:"INJECT_FILL_BUTTONS", payload: analyzeData.filled }).catch(()=>{})
//       // Now immediately fill
//       const fillResult = await chrome.tabs.sendMessage(tab.id, { type:"FILL_ALL" }).catch(()=>null) as { filled:number; skipped:string[] } | null
//       if (!fillResult) return null

//       const total = fillResult.filled + fillResult.skipped.length
//       const score = total > 0 ? Math.round((fillResult.filled/total)*100) : 0
//       return { ...fillResult, total, score }

//     } catch (e) {
//       console.error("[AppContext] fillAllNow:", e)
//       return { filled:0, skipped:[], total:0, score:-1 }
//     } finally { setIsFilling(false) }
//   }, [])

//   const activeSession = useMemo(
//     () => sessions.find((s) => s.id === activeSessionId) ?? null,
//     [sessions, activeSessionId]
//   )

//   const value: AppContextType = {
//     sessions, activeSessionId, activeSession,
//     loadingSessionId, isLoading, error, abortedMessage,
//     createSession, setActiveSession, loadSession, addMessage,
//     sendMessage, deleteSession, renameSession, pinSession,
//     clearError, clearAborted, retryMessage,
//     pendingDocs, attachDocs, clearPendingDocs, sendWithFile,
//     isFilling, fillAllNow,
//   }

//   return <AppContext.Provider value={value}>{children}</AppContext.Provider>
// }

// export function useApp() {
//   const ctx = useContext(AppContext)
//   if (!ctx) throw new Error("useApp must be used within <AppProvider>")
//   return ctx
// }

// // Backward-compat re-exports so existing useChat/useForm callers keep working
// export const useChat = useApp
// export const useForm = useApp