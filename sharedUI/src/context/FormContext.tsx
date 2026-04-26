// features/FormContext.tsx
// Simplified context:
//   - background.ts handles scrape → analyze → inject buttons silently
//   - fillAllNow() triggers FILL_ALL on the active tab
//   - FILL_RESULT comes back from content.ts → background.ts → here
//   - isFillIntent() used by sidepanel handleSend
//   - Fill result is communicated back to chat via a plain string
//     that handleSend can use as the "AI reply" to show in MessageBubble

import React, {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from "react"

const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000"
const KEY_TOKEN   = "_auth_token"

async function getToken(): Promise<string | null> {
  try { const r = await chrome.storage.local.get(KEY_TOKEN); return (r[KEY_TOKEN] as string) || null }
  catch { return null }
}

// ── Fill intent detector ───────────────────────────────────────────────────────
export function isFillIntent(text: string): boolean {
  const t = text.toLowerCase().trim()
  return [
    /isi\s*(form|formulir)/,
    /fill\s*(this\s*)?(form|out)/,
    /auto[\s-]?fill/,
    /lengkapi\s*(form|formulir|data)/,
    /tolong\s*isi/,
    /bantu\s*isi/,
    /using\s*my\s*data/,
    /dengan\s*data\s*(saya|ku|aku)/,
    /gunakan\s*data/,
  ].some((p) => p.test(t))
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface FillResult {
  filled:  number
  skipped: string[]
  total:   number
  score:   number
}

// Define the shape of the result data if needed, otherwise use any or unknown
export interface FormResultData {
  filled: number;
  skipped: string[];
  total: number;
  score: number;
  message?: string;
}

export interface FormContextType {
  isFilling:   boolean
  fillAllNow:  () => Promise<FillResult | null>
  fillResult: (data: FormResultData | null) => void
  clearResult: () => void
  // Optional: expose the current result data if the UI needs to read it directly
  resultData: FormResultData | null;
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [isFilling, setIsFilling] = useState(false)
  const [resultData, setResultData] = useState<FormResultData | null>(null)

  // ── fillAllNow ─────────────────────────────────────────────────────────────
  // Called from sidepanel handleSend when fill intent is detected.
  // Returns a FillResult so handleSend can build a chat reply for MessageBubble.
  const fillAllNow = useCallback(async (): Promise<FillResult | null> => {
    setIsFilling(true)
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) throw new Error("Tidak ada tab aktif")

      // Try FILL_ALL first (content.ts already has analyzed values from page load)
      const result = await chrome.tabs.sendMessage(tab.id, { type: "FILL_ALL" })
        .catch(() => null) as { filled: number; skipped: string[] } | null

      if (result) {
        const total = result.filled + result.skipped.length
        const score = total > 0 ? Math.round((result.filled / total) * 100) : 0
        const fillResult: FillResult = { ...result, total, score }

        // Update local context result
        setResultData({ ...fillResult, message: "Form filled successfully" })

        // Save assessment fire-and-forget
        const token = await getToken()
        fetch(`${NEXTJS_BASE}/api/assessment`, {
          method:  "POST",
          headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
          body:    JSON.stringify({
            targetDomain:  tab.url ?? "",
            extractedData: {},
            missingFields: result.skipped,
            score:         score / 100,
          }),
        }).catch(() => {})

        return fillResult
      }

      // content.ts not ready — trigger full pipeline via background
      const scrapeResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func:   () => (window as any).scrapeForm?.() ?? [],
      })
      const fields = scrapeResults[0]?.result ?? []

      if (!fields.length) {
        return { filled: 0, skipped: [], total: 0, score: 0 }
      }

      // Tell background to analyze — it will inject buttons
      // but we can't await the full result here synchronously
      chrome.runtime.sendMessage({ type:"PAGE_HAS_FORM", payload:{ fields, url: tab.url ?? "" } })

      // Return null to signal "analyzing, please wait" — sidepanel will show a message
      return null

    } catch (err) {
      console.error("[FormContext] fillAllNow:", err)
      return { filled: 0, skipped: [], total: 0, score: -1 }
    } finally {
      setIsFilling(false)
    }
  }, [])

  // ── fillResult ─────────────────────────────────────────────────────────────
  // Allows external components (like background script listeners) to update the result
  const fillResult = useCallback((data: FormResultData | null) => {
    setResultData(data)
  }, [])

  // ── clearResult ─────────────────────────────────────────────────────────────
  // Clears the current result data
  const clearResult = useCallback(() => {
    setResultData(null)
  }, [])

  const value = useMemo<FormContextType>(
    () => ({ 
      isFilling, 
      fillAllNow, 
      fillResult, 
      clearResult,
      resultData 
    }),
    [isFilling, fillAllNow, fillResult, clearResult, resultData]
  )

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

export function useForm() {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error("useForm must be used within <FormProvider>")
  return ctx
}