# InForm Bug Fixes & Architecture Changes

## Summary of Changes

### 1. Browser Extension Bug Fixes (browser-extension/)

#### Bug 1 — Attachments Not Sent to API
**File:** `features/ChatContext.tsx` (line 263)
**Problem:** `sendMessage` was sending `{ message: text }` without attachments
**Fix:** Modified fetch body to include attachments when present:
```typescript
const body: { message: string; attachments?: any[] } = { message: text };
if (hasAttachments) {
  body.attachments = attachments;
}
```

#### Bug 2 — Optimistic User Bubble Disappears for File-Only Messages
**File:** `features/ChatContext.tsx` (lines 227-243)
**Problem:** Early return `if (!text.trim())` prevented file-only messages from showing
**Fix:** 
- Changed condition to allow messages with attachments even if text is empty
- Added file name display in optimistic user bubble:
```typescript
const hasAttachments = attachments && attachments.length > 0;
if (!text.trim() && !hasAttachments) return;

// Show file names in bubble
if (hasAttachments) {
  const fileNames = attachments.map((f: any) => f.name).join(", ");
  displayText = text.trim() ? `${text}\n\n📎 ${fileNames}` : `📎 ${fileNames}`;
}
```

#### Bug 3 — Loading Indicator Not Showing for Fill Operations
**File:** `components/chats/MainChat.tsx` (line 131)
**Problem:** `loadingSessionId` was never set during fill operations
**Fix:** Exposed `setLoadingSessionId` from ChatContext and call it before fill:
```typescript
setLoadingSessionId(targetSessionId)  // Before fill
// ... fill operation
setLoadingSessionId(null)  // After fill completes
```

#### Bug 4 — finalPrompt Not Sent to API
**File:** `components/chats/MainChat.tsx` (lines 138, 181)
**Problem:** Original `text` was sent instead of `finalPrompt` (which includes file info)
**Fix:** Pass `finalPrompt` to sendMessage:
```typescript
await sendMessage({ text: finalPrompt, ..., attachments: filesToSend })
```

### 2. Flask Backend Timeout & Security (log/)

#### Increased Timeout for Large Documents
**Files:** `main.py`, `analyze.py`
**Changes:**
- Increased `MAX_TOKENS` from 2048 to 4096
- Added `REQUEST_TIMEOUT` config (default 120 seconds)
- Added `request_timeout` parameter to ChatOpenAI initialization
- Updated system prompts to reject sensitive data

#### Sensitive Data Protection
**Added security rules to prevent AI from processing:**
- Passwords
- One-time tokens (OTP)
- Credit card numbers (CVV, expiry)
- PINs, security codes
- API keys, secret keys

### 3. Shared UI Package Structure (shared-ui/)

Created a new shared package for components used by both browser-extension and website:

```
shared-ui/
├── package.json          # @inform/ui package config
├── tsconfig.json         # TypeScript config with path aliases
├── README.md             # Usage instructions
└── src/
    ├── index.ts          # Entry point (exports types)
    └── types/
        └── index.ts      # Shared types (ChatMessage, ChatSession, etc.)
```

#### How to Use Shared Types

**In browser-extension (tsconfig.json):**
```json
{
  "compilerOptions": {
    "paths": {
      "@inform/ui/*": ["../shared-ui/src/*"],
      "@inform/types": ["../shared-ui/src/types/index.ts"]
    }
  }
}
```

**In website (tsconfig.json):**
```json
{
  "compilerOptions": {
    "paths": {
      "@inform/ui/*": ["../shared-ui/src/*"],
      "@inform/types": ["../shared-ui/src/types/index.ts"]
    }
  }
}
```

#### Migration Plan for Components

Components that can be shared (identical in both projects):
- Button components
- Input components  
- Card components
- Icon wrappers
- Toast notifications
- Modal base components

Components that stay separate:
- ChatContext (different storage: chrome.storage.local vs cookies)
- AuthContext (different auth flow)
- FormContext (extension-specific form filling)

### 4. Data Storage Strategy

#### Browser Extension (Chrome Storage - NOT Database)
All data stored locally in browser via `chrome.storage.local`:
- Auth token (`_auth_token`)
- User info (`_auth_user`)
- Memory docs (`inform_memory_docs`)
- Privacy preferences (`inform_privacy`)
- AI model selection (`inform_ai_model`)

**Files using chrome.storage.local:**
- `background.ts` - Syncs cookies from website
- `features/AuthContext.tsx` - Login/logout
- `features/ChatContext.tsx` - Token retrieval
- `components/SettingsModal.tsx` - Memory docs, preferences
- `components/FirstOpenHint.tsx` - Dismissal state
- `components/buttons/AttachButton.tsx` - Token check

#### Website (Database via Prisma)
- Sessions stored in PostgreSQL
- Messages stored in PostgreSQL
- Documents stored in PostgreSQL
- Auth via JWT cookies

### 5. Files Modified

**Browser Extension:**
- `features/ChatContext.tsx` - Bugs 1, 2 fixed
- `components/chats/MainChat.tsx` - Bugs 3, 4 fixed
- `types/index.ts` - Added `attachments` field to SendMessageArgs

**Flask Backend:**
- `log/main.py` - Timeout increase, security prompts
- `log/analyze.py` - Security prompts for analyze endpoint

**New Files:**
- `shared-ui/package.json`
- `shared-ui/tsconfig.json`
- `shared-ui/README.md`
- `shared-ui/src/index.ts`
- `shared-ui/src/types/index.ts`

## Testing Checklist

### Extension Tests
- [ ] Send message with text only → works
- [ ] Send message with file only (no text) → bubble shows file name
- [ ] Send message with text + files → both shown, files sent to API
- [ ] Trigger fill command → loading indicator appears
- [ ] Fill with attached document → finalPrompt sent (includes file content)

### Backend Tests
- [ ] Upload large PDF (10+ pages) → no timeout
- [ ] Ask about password in document → AI refuses to answer
- [ ] Ask AI to extract OTP → AI refuses
- [ ] Form fill with credit card field → field skipped with security note

### Shared UI Tests
- [ ] Both projects can import `@inform/types`
- [ ] No TypeScript errors in either project
- [ ] Build succeeds for both projects

## Deployment Notes

### Extension Build
```bash
cd browser-extension
npm run build
# Output: build/chrome-mv3-prod/
```

### Website Build
```bash
cd website
npm run build
npm run export
# Output: out/
```

### Backend Run
```bash
cd log
pip install -r requirements.txt
python main.py
# Ensure REQUEST_TIMEOUT in .env if different from default
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://...
LM_STUDIO_BASE=http://localhost:1234/v1
MODEL_NAME=qwen3-4b
MAX_TOKENS=4096
REQUEST_TIMEOUT=120
FLASK_PORT=5000
FLASK_DEBUG=true
```

### Extension (plasmo.config.json or .env)
```bash
PLASMO_PUBLIC_NEXTJS_BASE=http://localhost:3000
```

### Website (.env)
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```
