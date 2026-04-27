# InForm — AI Form Automation Agent

> Multilingual · Multimodal · Browser-native · Fraud-aware

---

## Overview

**InForm** is an AI agent that integrates directly into web browsers via extensions, reads administrative forms from any open website or application, and automatically fills them using contextual intelligence. It handles daily/monthly/annual reports, agreements, and financial forms — while running a fraud detection pass before every submission.

---

## Core Capabilities

### 1. Browser Extension Integration

InForm ships as an extension for all major browsers. Once installed, it injects a lightweight sidebar panel into any tab and listens for page and navigation events.

**Supported browsers:**

| Browser | Status | Notes |
|---|---|---|
| Google Chrome | Supported | Manifest V3 |
| Mozilla Firefox | Supported | WebExtension API |
| Microsoft Edge | Supported | Chromium-based |
| Opera Mini | Supported | Chromium-based |

**Extension features:**
- Auto-detects forms on page load and SPA route changes (via `MutationObserver`)
- Isolated secure storage for auth tokens
- Content script injection with minimal footprint
- Works on HTTPS and local admin apps

---

### 2. Form Detection & Field Reading

The DOM scanner traverses the page tree to identify all `<form>` elements, standalone inputs, and ARIA-role form controls.

**Extracted metadata per field:**
- Field `name`, `id`, `type`, `placeholder`, `aria-label`
- Validation attributes (`required`, `min`, `max`, `pattern`)
- Option lists for `<select>`, `radio`, `checkbox`
- Hidden field values
- Associated `<label>` text

**Supported input types:**

| Type | Description |
|---|---|
| `text` | Free-text inputs |
| `password` | Secure credential fields (handled safely) |
| `email` | Email address fields |
| `number` | Numeric/currency inputs |
| `date` | Date pickers |
| `file` | File upload controls |
| `checkbox` | Multi-select option groups |
| `radio` | Single-select option groups |
| `hidden` | Hidden form values (read-only) |

---

### 3. Intelligent Autofill

After field mapping, LangChain sends each field's metadata to the language model along with the user's profile, past submissions, and any uploaded documents. The agent generates the most contextually appropriate value for each field.

**Fill process:**
1. Field metadata packaged as structured prompt context
2. LLM infers correct value per field
3. Values injected using native browser `InputEvent` to bypass SPA validation
4. Filled fields highlighted with confidence scores
5. Low-confidence fields flagged for manual review

**Data sources used:**
- User profile (name, ID, department, locale)
- Session data (active browser cookies/tokens)
- Org chart / hierarchy (for manager fields)
- Uploaded documents (receipts, contracts, IDs)
- Historical submissions (for pattern matching)

---

### 4. Report Automation

InForm recognizes standard administrative form schemas and maps them to known report archetypes.

**Supported report types:**

| Type | Description |
|---|---|
| Daily reports | Operational summaries, shift logs |
| Monthly reports | KPI tracking, expense summaries |
| Annual reports | Full-year financials, performance reviews |
| Agreements | Contracts, MoUs, service agreements |
| Financial forms | Invoices, budgets, procurement forms |

**Workflow:**
- Schema recognition via field name pattern matching + LLM classification
- Pre-populates fields from structured data or uploaded documents
- Flags uncertain fields before submission
- Supports custom schemas via configuration

---

### 5. Fraud Detection

Before any form is submitted, InForm runs a financial analysis pass. Results are displayed as a fraud score (0–100) with per-signal explanations.

**Detection signals:**

| Signal | Method |
|---|---|
| Duplicate detection | Hash comparison against submission history |
| Amount anomaly | Statistical outlier scoring vs. department average |
| Date inconsistency | Logical validation across date fields |
| Identity mismatch | Cross-reference with user session + profile |
| Cross-field contradiction | Rule-based logical validation |
| Pattern deviation | Comparison against user's historical submissions |

**Score interpretation:**
- `85–100` — Low risk, safe to submit
- `60–84` — Medium risk, flagged fields highlighted for review
- `0–59` — High risk, submission blocked pending manual review

---

## Agent Workflow

```
Page detected
    ↓
DOM scan (MutationObserver)
    ↓
Field mapping & metadata extraction
    ↓
LangChain inference (field → value)
    ↓
Value generation with confidence scores
    ↓
Autofill with native browser events
    ↓
Fraud analysis pass
    ↓
User review & submit
```

---

## Tech Architecture

### Frontend — Next.js

- **Framework:** Next.js (App Router)
- **Rendering:** Server components for data fetching, client components for interactive extension UI
- **Styling:** Tailwind CSS + CSS Modules
- **State:** Zustand / React Query
- **Extension UI:** React rendered in browser extension sidebar

### Backend — Decoupled Services

| Service | Responsibility | Stack |
|---|---|---|
| Auth | JWT/OAuth2, session management | Next.js API Routes + NextAuth |
| Email | Notifications, approval emails | SMTP / SendGrid |
| File storage | Receipt uploads, document attachments | S3-compatible (AWS / MinIO) |
| Live data | Real-time form sync, agent status | WebSocket / SSE |

### AI Layer — LangChain

- **Orchestration:** LangChain agents with tool-use
- **Models:** Claude (primary), configurable
- **Memory:** Conversation + user submission history
- **Tools:** Form field reader, profile fetcher, document parser, fraud analyzer
- **Retrieval:** Vector store for historical submissions + org data

### Browser Extension

- **API:** Chrome Extension Manifest V3 (WebExtension-compatible)
- **Content scripts:** DOM access, form scanning, event injection
- **Background service worker:** Auth token refresh, API proxy
- **Popup/sidebar:** React-based InForm panel

---

## Multilingual Support

InForm is multilingual and adapts to the user's locale for:
- Field value generation (dates, numbers, currency formats)
- UI language
- Form label interpretation (non-English field names)

**Currently prioritized locales:** `id-ID`, `en-US`, `zh-CN`, `ar-SA`, `pt-BR`

---

## Security Considerations

- Passwords are never read or stored — `type="password"` fields are skipped for AI fill
- All API calls are authenticated with short-lived JWT tokens
- Extension storage is sandboxed per origin
- File uploads are virus-scanned before storage
- Fraud detection runs client-side + server-side for defense in depth

---

## Development Roadmap

### Phase 1 — Foundation (Weeks 1–4)
- [ ] Next.js project scaffold with App Router
- [ ] Auth service (NextAuth + JWT)
- [ ] LangChain agent setup with Claude
- [ ] Chrome extension skeleton with content script

### Phase 2 — Core Agent (Weeks 5–8)
- [ ] DOM scanner + field mapper
- [ ] Autofill engine with native event injection
- [ ] User profile & session data integration
- [ ] Confidence scoring UI

### Phase 3 — Reports & Automation (Weeks 9–12)
- [ ] Report schema library (daily/monthly/annual/financial)
- [ ] Document upload + parsing (receipts, contracts)
- [ ] Historical submission memory

### Phase 4 — Fraud & Compliance (Weeks 13–16)
- [ ] Fraud detection signal engine
- [ ] Score ring UI + per-signal breakdown
- [ ] Admin dashboard for fraud review queue

### Phase 5 — Expansion (Weeks 17–20)
- [ ] Firefox, Edge, Opera Mini extension ports
- [ ] Multilingual field interpretation
- [ ] Custom schema configuration
- [ ] API for third-party ERP integration

---

## File Structure (Next.js)

```
InForm/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── dashboard/
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── forms/
│   │   │       └── fraud/
│   │   └── components/
│   └── extension/              # Browser extension
│       ├── content/
│       ├── background/
│       └── sidebar/
├── packages/
│   ├── agent/                  # LangChain agent core
│   │   ├── tools/
│   │   ├── memory/
│   │   └── prompts/
│   ├── scanner/                # DOM form scanner
│   └── fraud/                  # Fraud detection engine
└── services/
    ├── auth/
    ├── storage/
    └── email/
```

---

*InForm · Built with Next.js + LangChain · MIT License*
