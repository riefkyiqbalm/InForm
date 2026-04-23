# ● InForm
### Multilingual · Multimodal · AI Form Automation Agent

> *InForm reads, understands, and fills any administrative form inside your browser — with built-in fraud detection, multilingual support, and zero manual effort.*

---

## What is InForm?

InForm is an AI agent that lives inside your browser as an extension,in your desktop as app and in your browser as a web. Open any website with a form — an ERP, an HR portal, a financial dashboard — and InForm instantly scans the page, maps every field, and fills everything in using context from your profile, uploaded documents, and submission history. Before you hit submit, it runs a fraud analysis pass and flags anything unusual.

It handles the full spectrum of administrative work: daily logs, monthly expense reports, annual financial reviews, service agreements, procurement forms, and more.

---

## Key Capabilities

### 🧩  Browser Extension Integration
Installs into Chrome, Firefox, Edge, and Opera Mini. Injects a lightweight sidebar that auto-activates on any page containing a form — including single-page apps that render forms dynamically. No configuration needed.

### 📋  Form Detection & Reading
Traverses the DOM to extract every field: its type, label, validation rules, options, and hidden values. Works on standard HTML forms, ARIA-role inputs, and dynamically injected components via `MutationObserver`.

### ✍️  Intelligent Autofill
Sends each field's metadata through a LangChain agent to a language model, which infers the correct value from your user profile, session data, org hierarchy, and uploaded documents. Values are injected using native browser events so SPA validators don't break.

### 📊  Report Automation
Recognises standard administrative schemas — daily, monthly, annual reports; financial forms; contracts and agreements — and pre-populates them from structured data or document uploads. Flags any field it isn't confident about before submission.

### 🔍  Fraud Detection
Before every submission, InForm runs a multi-signal financial analysis: duplicate detection, amount anomaly scoring, date consistency checks, identity verification, cross-field logic validation, and historical pattern comparison. Returns a score from 0–100 with per-signal explanations.

---

## Supported Input Types

| Type | Description |
|---|---|
| `text` | Free-text fields |
| `password` | Credential fields (never read or stored) |
| `email` | Email address fields |
| `number` | Numeric and currency inputs |
| `date` | Date pickers |
| `file` | File upload controls |
| `checkbox` | Multi-select option groups |
| `radio` | Single-select option groups |
| `hidden` | Hidden values (read-only) |

---

## Browser Support

| Browser | Status |
|---|---|
| Google Chrome | ✅ Supported — Manifest V3 |
| Mozilla Firefox | ✅ Supported — WebExtension API |
| Microsoft Edge | ✅ Supported — Chromium-based |
| Opera Mini | ✅ Supported — Chromium-based |

---

## Report Types

| Category | Examples |
|---|---|
| Daily reports | Operational summaries, shift logs |
| Monthly reports | KPI tracking, expense reports |
| Annual reports | Full-year financials, performance reviews |
| Agreements | Contracts, MoUs, service agreements |
| Financial forms | Invoices, budgets, procurement forms |

---

## Agent Workflow

```
1. Page detected
        ↓
2. DOM scan — MutationObserver + full tree traversal
        ↓
3. Field mapping — type, label, validation, options extracted
        ↓
4. LangChain inference — field metadata → value generation
        ↓
5. Autofill — native browser events, confidence scores shown
        ↓
6. Fraud analysis — 6-signal pass, score 0–100
        ↓
7. User review & submit
```

---

## Fraud Detection Signals

| Signal | Method | Risk Level |
|---|---|---|
| Duplicate submission | Hash comparison vs. history | 🔴 High |
| Amount anomaly | Outlier scoring vs. dept. average | 🟡 Medium |
| Date inconsistency | Logical cross-field validation | 🔴 High |
| Identity mismatch | Cross-reference with session + profile | 🔴 High |
| Cross-field contradiction | Rule-based logic validation | 🟡 Medium |
| Historical pattern deviation | Comparison vs. user's past submissions | 🟡 Medium |

**Score guide:**
- `85–100` — Low risk, safe to submit
- `60–84` — Medium risk, flagged fields highlighted for manual review
- `0–59` — High risk, submission blocked pending approval

---

## Tech Stack

### Frontend
- **Next.js** (App Router) — UI, routing, server components, API routes
- **React** — Extension sidebar and dashboard components
- **Tailwind CSS** — Styling

### Backend (Decoupled Services)
- **Auth** — NextAuth + JWT/OAuth2
- **Email** — SMTP / SendGrid for notifications and approvals
- **File storage** — S3-compatible (AWS S3 / MinIO) for receipts and documents
- **Live data** — WebSocket / SSE for real-time agent status

### AI Layer
- **LangChain** — Agent orchestration, tool use, memory management
- **Qwen** — Primary language model for field inference and fraud analysis
- **Vector store** — Retrieval over historical submissions and org data

### Browser Extension — powered by Plasmo
- **Plasmo Framework** — the extension layer, abstracting Manifest V3 boilerplate
- React components shared directly from the Next.js codebase
- `@plasmohq/storage` for sandboxed extension storage
- `@plasmohq/messaging` for background ↔ content script communication
- Plasmo BPP GitHub Action for automated multi-store publishing

---

## Plasmo Integration

> *Plasmo is to browser extensions what Next.js is to web apps — file-based, React-first, zero manifest config.*

InForm uses **Plasmo** as the bridge between the Next.js web application and the browser extension. The key principle is that Plasmo is the extension's entry point while Next.js is the web app's entry point — and React components are shared freely between both with minimal adjustments.

### Why Plasmo?

| Without Plasmo | With Plasmo |
|---|---|
| Hand-write `manifest.json` | Auto-generated from `package.json` |
| Manual content script wiring | Export a React component → it's injected |
| No HMR in extensions | Full Hot Module Replacement built-in |
| Separate build pipeline per browser | Single build, multi-target output |
| Manual store submission | Plasmo BPP automates Chrome, Firefox, Edge |
| Duplicated UI code between web + extension | Shared React components across both |

### Plasmo File Map for InForm

| File | Plasmo role | InForm purpose |
|---|---|---|
| `popup.tsx` | Extension icon popup | Quick-access InForm panel |
| `sidepanel.tsx` | Chrome Side Panel API | Main InForm sidebar UI |
| `options.tsx` | Extension options page | User profile, settings, locale |
| `contents/form-scanner.tsx` | Content script UI (Shadow DOM) | Form field overlay + fill indicators |
| `contents/fraud-overlay.tsx` | Content script UI (Shadow DOM) | Pre-submit fraud warning banner |
| `background.ts` | Background service worker | Auth token refresh, API proxy to LangChain |
| `tabs/dashboard.tsx` | Full-tab page | Admin report queue and history |

### Shared Components (Next.js ↔ Plasmo)

Because both Next.js and Plasmo use the same bundler (Parcel 2 / SWC) and support the same `tsconfig.json` and Tailwind config, InForm components are written once and used in both contexts:

```
packages/ui/
├── components/
│   ├── FieldCard.tsx          # Used in sidebar + web dashboard
│   ├── FraudScoreRing.tsx     # Used in overlay + admin panel
│   ├── SuggestionList.tsx     # Used in popup + options page
│   └── ConfidenceBar.tsx      # Used everywhere
└── hooks/
    ├── useFormScanner.ts      # MutationObserver hook
    └── useLangChainAgent.ts   # LangChain call hook
```

### Getting Started with Plasmo

**1. Bootstrap the Plasmo extension**

```bash
pnpm create plasmo inform-extension
cd inform-extension
pnpm dev
```

**2. Install Plasmo storage and messaging**

```bash
pnpm add @plasmohq/storage @plasmohq/messaging
```

**3. Wire the InForm sidebar as a Side Panel**

```tsx
// sidepanel.tsx
import { InFormPanel } from "@inform/ui/components"

export default function SidePanel() {
  return <InFormPanel />
}
```

**4. Inject the form scanner as a Content Script UI**

```tsx
// contents/form-scanner.tsx
import { useFormScanner } from "@inform/ui/hooks"
import { FieldOverlay } from "@inform/ui/components"

export default function FormScanner() {
  const { fields, isScanning } = useFormScanner()
  return <FieldOverlay fields={fields} isScanning={isScanning} />
}
```

Plasmo automatically wraps this in a **Shadow DOM**, preventing any page stylesheet from bleeding into the InForm overlay UI.

**5. Background service worker for auth + API proxy**

```ts
// background.ts
import { onMessage } from "@plasmohq/messaging"

onMessage("run-autofill", async ({ sender, body }) => {
  const token = await refreshAuthToken()
  const result = await callLangChainAgent(body.fields, token)
  return result
})
```

**6. Build for all target browsers**

```bash
pnpm build                        # Chrome MV3 (default)
pnpm build --target=firefox-mv2   # Firefox
pnpm build --target=edge-mv3      # Microsoft Edge
```

Output lands in `build/chrome-mv3-prod/`, `build/firefox-mv2-prod/`, etc.

**7. Publish with Plasmo BPP (GitHub Action)**

```yaml
# .github/workflows/submit.yml
- name: Browser Platform Publish
  uses: PlasmoHQ/bpp@v3
  with:
    keys: ${{ secrets.SUBMIT_KEYS }}
```

Publishes to Chrome Web Store, Firefox Add-ons, and Edge Add-ons in a single action.

### Environment Variables

Plasmo uses `PLASMO_PUBLIC_` as the prefix for variables exposed to the extension (equivalent to `NEXT_PUBLIC_` in Next.js). A shared `.env` file works in both contexts with the prefix swap:

```env
# .env (shared)
PLASMO_PUBLIC_API_URL=https://api.inform.app
NEXT_PUBLIC_API_URL=https://api.inform.app

PLASMO_PUBLIC_LANGCHAIN_ENDPOINT=https://lc.inform.app
```

---

## Multilingual Support

InForm adapts field value generation, date/number formatting, and UI language to the user's locale. Form labels in non-English languages are interpreted natively by the language model — no translation layer needed.

**Priority locales:** `id-ID` · `en-US` · `zh-CN` · `ar-SA` · `pt-BR`

---

## Security

- `type="password"` fields are never read, stored, or filled by the AI
- All API calls use short-lived JWT tokens
- Extension storage is sandboxed per origin
- File uploads are virus-scanned before storage
- Fraud detection runs both client-side and server-side

---

## Project Structure

```
inform/                              # pnpm monorepo
├── apps/
│   ├── web/                         # Next.js web app (dashboard, admin)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── dashboard/
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── forms/
│   │   │       └── fraud/
│   │   └── next.config.ts
│   │
│   └── extension/                   # Plasmo browser extension
│       ├── popup.tsx                # Extension icon popup
│       ├── sidepanel.tsx            # Chrome Side Panel (main UI)
│       ├── options.tsx              # Settings & user profile page
│       ├── background.ts            # Service worker (auth, API proxy)
│       ├── tabs/
│       │   └── dashboard.tsx        # Full-tab admin view
│       ├── contents/
│       │   ├── form-scanner.tsx     # CSUI: field overlay (Shadow DOM)
│       │   └── fraud-overlay.tsx    # CSUI: pre-submit fraud banner
│       └── package.json             # Plasmo config + manifest fields
│
├── packages/
│   ├── ui/                          # Shared React components
│   │   ├── components/              # Used by both Next.js + Plasmo
│   │   └── hooks/                   # useFormScanner, useLangChainAgent
│   ├── agent/                       # LangChain agent core
│   │   ├── tools/
│   │   ├── memory/
│   │   └── prompts/
│   ├── scanner/                     # DOM form scanner logic
│   └── fraud/                       # Fraud detection engine
│
└── services/
    ├── auth/
    ├── storage/
    └── email/
```

---

## Development Roadmap

### Phase 1 — Foundation *(Weeks 1–4)*
- [ ] Next.js scaffold with App Router and auth (NextAuth + JWT)
- [ ] Plasmo extension bootstrapped with `pnpm create plasmo`
- [ ] Shared `packages/ui` component library wired to both apps
- [ ] LangChain agent setup with Qwen
- [ ] `background.ts` service worker with auth token refresh

### Phase 2 — Core Agent *(Weeks 5–8)*
- [ ] `contents/form-scanner.tsx` CSUI with Shadow DOM isolation
- [ ] Full field mapper with all 9 input types
- [ ] Autofill engine with native browser event injection
- [ ] `sidepanel.tsx` InForm sidebar with confidence scoring UI
- [ ] `@plasmohq/messaging` wiring: content ↔ background ↔ API

### Phase 3 — Report Automation *(Weeks 9–12)*
- [ ] Report schema library in `packages/agent`
- [ ] Document upload and parsing (receipts, contracts)
- [ ] Historical submission memory via vector store
- [ ] `tabs/dashboard.tsx` full admin review page

### Phase 4 — Fraud & Compliance *(Weeks 13–16)*
- [ ] 6-signal fraud detection engine in `packages/fraud`
- [ ] `contents/fraud-overlay.tsx` pre-submit warning banner
- [ ] Score ring UI with per-signal breakdown
- [ ] Admin review queue dashboard

### Phase 5 — Expansion *(Weeks 17–20)*
- [ ] Multi-browser builds: Firefox MV2, Edge MV3, Opera
- [ ] Plasmo BPP GitHub Action for automated store publishing
- [ ] Additional locale support (`zh-CN`, `ar-SA`, `pt-BR`)
- [ ] Custom schema configuration
- [ ] Third-party ERP API integration

---

*InForm — Built with Next.js + Plasmo + LangChain · MIT License*