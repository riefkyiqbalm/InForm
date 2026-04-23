// content.ts — Plasmo content script
// Handles:
//   1. Form scraping  — scrapeForm() exposed on window for executeScript
//   2. Form filling   — fillForm(values) exposed on window
//   3. Focus tracking — reports focused field to sidepanel in real time
//   4. Field highlight — visually marks fields being auto-filled

// import type { PlasmoCSConfig } from "plasmo"
// console.log("Content Script Loaded")

// export const config: PlasmoCSConfig = {
//   matches:    ["<all_urls>"],
//   all_frames: true,
// }

// // ── Types ──────────────────────────────────────────────────────────────────────
// export interface ScrapedField {
//   id:          string
//   name:        string
//   type:        string
//   tagName:     string
//   placeholder: string
//   label:       string
//   value:       string
//   required:    boolean
//   options:     string[]   // for <select> elements
//   xpath:       string     // unique locator for filling
// }

// // ── 1. Form scraper ────────────────────────────────────────────────────────────
// function scrapeForm(): ScrapedField[] {
//   const els = Array.from(
//     document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
//       "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]), textarea, select"
//     )
//   )

//   return els
//     .filter((el) => {
//       // Skip invisible elements
//       const style = window.getComputedStyle(el)
//       return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null
//     })
//     .map((el) => ({
//       id:          el.id          || "",
//       name:        el.name        || "",
//       type:        (el as HTMLInputElement).type || el.tagName.toLowerCase(),
//       tagName:     el.tagName,
//       placeholder: (el as HTMLInputElement).placeholder || "",
//       label:       findLabel(el),
//       value:       (el as HTMLInputElement).type === "password" ? "***" : el.value,
//       required:    el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
//       options:     el.tagName === "SELECT"
//         ? Array.from((el as HTMLSelectElement).options).map((o) => o.text)
//         : [],
//       xpath:       getXPath(el),
//     }))
// }

// // ── 2. Form filler ─────────────────────────────────────────────────────────────
// // Called via chrome.scripting.executeScript from sidepanel
// function fillForm(values: Record<string, string>): { filled: number; skipped: string[] } {
//   let filled    = 0
//   const skipped: string[] = []

//   Object.entries(values).forEach(([key, value]) => {
//     // Try multiple selectors in order of specificity
//     const el =
//       document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
//         `[name="${CSS.escape(key)}"]`
//       ) ||
//       document.getElementById(key) as HTMLInputElement | null

//     if (!el) {
//       skipped.push(key)
//       return
//     }

//     // Highlight the field briefly
//     const orig = el.style.outline
//     el.style.outline = "2px solid #00d4c8"
//     el.style.transition = "outline 0.3s"
//     setTimeout(() => { el.style.outline = orig }, 1500)

//     if (el.tagName === "SELECT") {
//       const select = el as HTMLSelectElement
//       const opt    = Array.from(select.options).find(
//         (o) => o.text.toLowerCase().includes(value.toLowerCase()) ||
//                o.value.toLowerCase() === value.toLowerCase()
//       )
//       if (opt) {
//         select.value = opt.value
//         select.dispatchEvent(new Event("change", { bubbles: true }))
//         filled++
//       } else {
//         skipped.push(key)
//       }
//     } else {
//       // Set value natively so React/Vue/Angular controlled inputs update
//       const nativeSetter = Object.getOwnPropertyDescriptor(
//         el.tagName === "TEXTAREA"
//           ? HTMLTextAreaElement.prototype
//           : HTMLInputElement.prototype,
//         "value"
//       )?.set
//       nativeSetter?.call(el, value)
//       el.dispatchEvent(new Event("input",  { bubbles: true }))
//       el.dispatchEvent(new Event("change", { bubbles: true }))
//       filled++
//     }
//   })

//   return { filled, skipped }
// }

// // ── 3. Focus tracker ───────────────────────────────────────────────────────────
// const handleFocus = (event: FocusEvent) => {
//   const el = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//   if (!["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return

//   const field: ScrapedField = {
//     id:          el.id          || "",
//     name:        el.name        || "",
//     type:        (el as HTMLInputElement).type || el.tagName.toLowerCase(),
//     tagName:     el.tagName,
//     placeholder: (el as HTMLInputElement).placeholder || "",
//     label:       findLabel(el),
//     value:       (el as HTMLInputElement).type === "password" ? "***" : el.value,
//     required:    el.hasAttribute("required"),
//     options:     el.tagName === "SELECT"
//       ? Array.from((el as HTMLSelectElement).options).map((o) => o.text)
//       : [],
//     xpath:       getXPath(el),
//   }

//   chrome.runtime.sendMessage({ type: "FIELD_FOCUSED", payload: field }).catch(() => {})
// }

// document.addEventListener("focusin", handleFocus)

// // ── 4. Listen for fill commands from background/sidepanel ──────────────────────
// chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
//   if (message.type === "FILL_FORM") {
//     const result = fillForm(message.payload as Record<string, string>)
//     sendResponse(result)
//     return true
//   }
//   if (message.type === "SCRAPE_FORM") {
//     sendResponse(scrapeForm())
//     return true
//   }
//   return false
// })

// // ── Expose to executeScript context ───────────────────────────────────────────
// ;(window as any).scrapeForm = scrapeForm
// ;(window as any).fillForm   = fillForm

// // ── Helpers ────────────────────────────────────────────────────────────────────
// function findLabel(el: HTMLElement): string {
//   const aria = el.getAttribute("aria-label")
//   if (aria) return aria
//   if (el.id) {
//     const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
//     if (lbl) return lbl.textContent?.trim() ?? ""
//   }
//   const parentLbl = el.closest("label")
//   if (parentLbl) return parentLbl.textContent?.trim() ?? ""
//   // Check preceding sibling text
//   const prev = el.previousElementSibling
//   if (prev?.tagName === "LABEL") return prev.textContent?.trim() ?? ""
//   return ""
// }

// function getXPath(el: HTMLElement): string {
//   if (el.id) return `//*[@id="${el.id}"]`
//   const parts: string[] = []
//   let node: HTMLElement | null = el
//   while (node && node.nodeType === Node.ELEMENT_NODE) {
//     let idx = 1
//     let sib = node.previousElementSibling
//     while (sib) { if (sib.tagName === node.tagName) idx++; sib = sib.previousElementSibling }
//     parts.unshift(`${node.tagName.toLowerCase()}[${idx}]`)
//     node = node.parentElement
//   }
//   return `/${parts.join("/")}`
// }

// export {}


// content.ts — Plasmo content script
// Responsibilities:
//   1. On page load: scrape form, send to background for analysis
//   2. Receive analyzed values back, inject "Fill with InForm" buttons next to each form
//   3. On button click: fill the form and report score back to sidepanel
//   4. On focus: report focused field to sidepanel (for chat context)
//   5. Expose scrapeForm() and fillForm() on window for executeScript callers

import type { PlasmoCSConfig } from "plasmo"
import Icon from "~components/IconStyles"

export const config: PlasmoCSConfig = {
  matches:    ["<all_urls>"],
  all_frames: false,   // top frame only — avoids duplicate scrapes in iframes
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ScrapedField {
  id:          string
  name:        string
  type:        string
  tagName:     string
  placeholder: string
  label:       string
  value:       string
  required:    boolean
  options:     string[]
}

interface AnalyzedField {
  value:      string
  confidence: number
  source:     string
}

// ── State ──────────────────────────────────────────────────────────────────────
let analyzedValues: Record<string, AnalyzedField> = {}
let fillButtonsInjected = false
const BUTTON_CLASS = "inform-fill-btn"
const OVERLAY_ID   = "inform-fill-overlay"

// ── 1. Scrape all visible form fields ─────────────────────────────────────────
function scrapeForm(): ScrapedField[] {
  const els = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image])," +
      "textarea, select"
    )
  ).filter((el) => {
    const s = window.getComputedStyle(el)
    return s.display !== "none" && s.visibility !== "hidden" && (el as HTMLElement).offsetParent !== null
  })

  return els.map((el) => ({
    id:          el.id          || "",
    name:        el.name        || "",
    type:        (el as HTMLInputElement).type || el.tagName.toLowerCase(),
    tagName:     el.tagName,
    placeholder: (el as HTMLInputElement).placeholder || "",
    label:       findLabel(el),
    value:       (el as HTMLInputElement).type === "password" ? "" : el.value,
    required:    el.hasAttribute("required") || el.getAttribute("aria-required") === "true",
    options:     el.tagName === "SELECT"
      ? Array.from((el as HTMLSelectElement).options).map((o) => o.text)
      : [],
  }))
}

// ── 2. Inject "Fill with InForm +" buttons next to each filled field ──────────
function injectFillButtons(values: Record<string, AnalyzedField>) {
  removeFillButtons()  // clean up any previous buttons
  analyzedValues = values
  fillButtonsInjected = true

  const fieldKeys = Object.keys(values)
  if (fieldKeys.length === 0) return

  // Inject global styles once
  if (!document.getElementById("inform-styles")) {
    const style = document.createElement("style")
    style.id = "inform-styles"
    style.textContent = `
      .${BUTTON_CLASS} {
        position: absolute;
        z-index: 2147483647;
        background: #0d1117;
        border: 1px solid #00d4c8;
        border-radius: 6px;
        color: #00d4c8;
        font-size: 11px;
        font-weight: 600;
        font-family: 'DM Sans', system-ui, sans-serif;
        padding: 3px 8px;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,212,200,0.25);
        transition: background 0.15s, transform 0.1s;
        display: flex;
        align-items: center;
        gap: 4px;
        pointer-events: all;
      }
      .${BUTTON_CLASS}:hover {
        background: rgba(0,212,200,0.12);
        transform: scale(1.04);
      }
      .${BUTTON_CLASS}:active {
        transform: scale(0.97);
      }
      .${BUTTON_CLASS}[data-conf="high"]  { border-color: #00d4c8; color: #00d4c8; }
      .${BUTTON_CLASS}[data-conf="mid"]   { border-color: #f5c842; color: #f5c842; }
      .${BUTTON_CLASS}[data-conf="low"]   { border-color: #ff4d6d; color: #ff4d6d; }

      #${OVERLAY_ID} {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483646;
        background: #0d1117;
        border: 1px solid #00d4c8;
        border-radius: 12px;
        padding: 10px 14px;
        color: #e6edf3;
        font-size: 12px;
        font-family: 'DM Sans', system-ui, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: opacity 0.3s;
      }
      #${OVERLAY_ID}:hover { background: #161b22; }
    `
    document.head.appendChild(style)
  }

  // Inject a floating "Fill all with InForm" banner at top-right
  if (!document.getElementById(OVERLAY_ID)) {
    const banner = document.createElement("div")
    banner.id = OVERLAY_ID
    banner.innerHTML = `
      <span style="font-size:16px"><Icon name="white-plus" size={12}></Icon></span>
      <div>
        <div style="font-weight:600;color:#00d4c8">InForm siap</div>
        <div style="color:#8b949e;font-size:11px">${fieldKeys.length} field terdeteksi</div>
      </div>
      <button id="inform-fill-all-btn" style="
        background:#00d4c8;border:none;border-radius:6px;
        color:#0d1117;font-size:11px;font-weight:700;
        padding:4px 10px;cursor:pointer;margin-left:4px;font-family:inherit;
      ">Isi Semua</button>
      <span id="inform-dismiss-btn" style="color:#8b949e;cursor:pointer;font-size:14px;padding:0 4px;">✕</span>
    `
    document.body.appendChild(banner)

    document.getElementById("inform-fill-all-btn")?.addEventListener("click", (e) => {
      e.stopPropagation()
      fillAllFields()
    })
    document.getElementById("inform-dismiss-btn")?.addEventListener("click", (e) => {
      e.stopPropagation()
      removeFillButtons()
    })
  }

  // Inject per-field buttons
  fieldKeys.forEach((key) => {
    const el = getFieldElement(key)
    if (!el) return

    const conf = values[key].confidence
    const confLevel = conf >= 0.8 ? "high" : conf >= 0.5 ? "mid" : "low"

    const btn = document.createElement("button")
    btn.className = BUTTON_CLASS
    btn.dataset.fieldKey = key
    btn.dataset.conf = confLevel
    btn.title = `Isi dengan: "${values[key].value}" (${Math.round(conf * 100)}% yakin)`
    btn.innerHTML = `✦ ${Math.round(conf * 100)}%`

    btn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      fillSingleField(key, values[key].value)
      btn.innerHTML = "✓ Terisi"
      btn.style.borderColor = "#3dffa0"
      btn.style.color = "#3dffa0"
      btn.disabled = true
    })

    // Position the button overlaid on top-right corner of the field
    positionButton(btn, el as HTMLElement)
    document.body.appendChild(btn)

    // Reposition on scroll/resize
    window.addEventListener("scroll", () => positionButton(btn, el as HTMLElement), { passive: true })
    window.addEventListener("resize", () => positionButton(btn, el as HTMLElement), { passive: true })
  })
}

function positionButton(btn: HTMLElement, el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  if (rect.width === 0) return   // element not visible
  btn.style.top  = `${rect.top  + window.scrollY + 2}px`
  btn.style.left = `${rect.right + window.scrollX + 6}px`
}

function removeFillButtons() {
  document.querySelectorAll(`.${BUTTON_CLASS}`).forEach((b) => b.remove())
  document.getElementById(OVERLAY_ID)?.remove()
  fillButtonsInjected = false
}

// ── 3. Fill a single field ─────────────────────────────────────────────────────
function fillSingleField(key: string, value: string): boolean {
  const el = getFieldElement(key)
  if (!el) return false

  // Highlight
  const origOutline = (el as HTMLElement).style.outline
  ;(el as HTMLElement).style.outline = "2px solid #00d4c8"
  setTimeout(() => { (el as HTMLElement).style.outline = origOutline }, 1200)

  if (el.tagName === "SELECT") {
    const select = el as HTMLSelectElement
    const opt    = Array.from(select.options).find(
      (o) => o.text.toLowerCase().includes(value.toLowerCase()) ||
             o.value.toLowerCase() === value.toLowerCase()
    )
    if (!opt) return false
    select.value = opt.value
    select.dispatchEvent(new Event("change", { bubbles: true }))
  } else {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      "value"
    )?.set
    nativeSetter?.call(el, value)
    el.dispatchEvent(new Event("input",  { bubbles: true }))
    el.dispatchEvent(new Event("change", { bubbles: true }))
  }
  return true
}

// ── 4. Fill ALL fields at once ─────────────────────────────────────────────────
function fillAllFields(): { filled: number; skipped: string[] } {
  let filled    = 0
  const skipped: string[] = []

  Object.entries(analyzedValues).forEach(([key, data]) => {
    if (fillSingleField(key, data.value)) {
      filled++
      // Mark the corresponding button as done
      const btn = document.querySelector(`.${BUTTON_CLASS}[data-field-key="${key}"]`) as HTMLButtonElement | null
      if (btn) {
        btn.innerHTML = "✓ Terisi"
        btn.style.borderColor = "#3dffa0"
        btn.style.color = "#3dffa0"
        btn.disabled = true
      }
    } else {
      skipped.push(key)
    }
  })

  // Update banner
  const banner = document.getElementById(OVERLAY_ID)
  if (banner) {
    banner.innerHTML = `
      <span style="font-size:16px">✓</span>
      <div>
        <div style="font-weight:600;color:#3dffa0">${filled} field terisi</div>
        <div style="color:#8b949e;font-size:11px">${skipped.length > 0 ? `${skipped.length} dilewati` : "Semua berhasil"}</div>
      </div>
      <span id="inform-dismiss-btn" style="color:#8b949e;cursor:pointer;font-size:14px;padding:0 4px;">✕</span>
    `
    document.getElementById("inform-dismiss-btn")?.addEventListener("click", removeFillButtons)
    setTimeout(removeFillButtons, 4000)
  }

  // Report result back to sidepanel
  chrome.runtime.sendMessage({
    type:    "FILL_RESULT",
    payload: { filled, skipped, total: Object.keys(analyzedValues).length },
  }).catch(() => {})

  return { filled, skipped }
}

// ── 5. Expose on window for executeScript callers ─────────────────────────────
;(window as any).scrapeForm  = scrapeForm
;(window as any).fillForm    = (values: Record<string, string>) => {
  // Build analyzedValues from plain values (confidence = 1 since user confirmed)
  analyzedValues = {}
  Object.entries(values).forEach(([k, v]) => {
    analyzedValues[k] = { value: v, confidence: 1, source: "confirmed" }
  })
  return fillAllFields()
}

// ── 6. Focus tracker ──────────────────────────────────────────────────────────
document.addEventListener("focusin", (event) => {
  const el = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  if (!["INPUT","TEXTAREA","SELECT"].includes(el.tagName)) return
  chrome.runtime.sendMessage({
    type:    "FIELD_FOCUSED",
    payload: {
      id:          el.id || "",
      name:        el.name || "",
      type:        (el as HTMLInputElement).type || el.tagName.toLowerCase(),
      label:       findLabel(el),
      placeholder: (el as HTMLInputElement).placeholder || "",
    },
  }).catch(() => {})
})

// ── 7. Message listener (from background.ts) ──────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "INJECT_FILL_BUTTONS") {
    injectFillButtons(message.payload as Record<string, AnalyzedField>)
    sendResponse({ ok: true, fieldCount: Object.keys(message.payload).length })
    return true
  }
  if (message.type === "FILL_ALL") {
    const result = fillAllFields()
    sendResponse(result)
    return true
  }
  if (message.type === "SCRAPE_FORM") {
    sendResponse(scrapeForm())
    return true
  }
  if (message.type === "REMOVE_BUTTONS") {
    removeFillButtons()
    sendResponse({ ok: true })
    return true
  }
  return false
})

// ── 8. Auto-trigger on page load ──────────────────────────────────────────────
// Tell background.ts this page is ready and has forms
function notifyPageReady() {
  const fields = scrapeForm()
  if (fields.length === 0) return   // no form on this page

  chrome.runtime.sendMessage({
    type:    "PAGE_HAS_FORM",
    payload: { fields, url: location.href },
  }).catch(() => {})
}

// Run after DOM is fully painted
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(notifyPageReady, 800)
} else {
  document.addEventListener("DOMContentLoaded", () => setTimeout(notifyPageReady, 800))
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getFieldElement(key: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  return (
    document.querySelector<HTMLInputElement>(`[name="${CSS.escape(key)}"]`) ||
    document.getElementById(key) as HTMLInputElement | null
  )
}

function findLabel(el: HTMLElement): string {
  const aria = el.getAttribute("aria-label")
  if (aria) return aria
  if (el.id) {
    const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
    if (lbl) return lbl.textContent?.trim() ?? ""
  }
  const parentLbl = el.closest("label")
  if (parentLbl) return parentLbl.textContent?.trim() ?? ""
  const prev = el.previousElementSibling
  if (prev?.tagName === "LABEL") return prev.textContent?.trim() ?? ""
  return ""
}

export {} 