// background.ts — Plasmo background service worker

const KEY_TOKEN   = "_auth_token";
const KEY_USER    = "_auth_user";
const NEXTJS_BASE = process.env.PLASMO_PUBLIC_NEXTJS_BASE ?? "http://localhost:3000";

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseUserCookie(raw: string | undefined): any | null {
  if (!raw) return null;
  try {
    // Cookies might be URI encoded
    const decoded = decodeURIComponent(raw);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("[Background] Failed to parse user cookie:", e);
    return null;
  }
}

// Sync current cookies to storage (used on startup/tab switch)
async function syncCookieToStorage(): Promise<void> {
  try {
    const [tokenCookie, userCookie] = await Promise.all([
      chrome.cookies.get({ url: NEXTJS_BASE, name: KEY_TOKEN }),
      chrome.cookies.get({ url: NEXTJS_BASE, name: KEY_USER })
    ]);

    if (tokenCookie?.value) {
      const toStore: Record<string, string> = { [KEY_TOKEN]: tokenCookie.value };
      if (userCookie?.value) {
        toStore[KEY_USER] = userCookie.value; // Store raw, let context decode
      }
      await chrome.storage.local.set(toStore);
      
      // Notify sidepanel immediately if we found a token
      chrome.runtime.sendMessage({ 
        type: "_AUTH_LOGIN", 
        token: tokenCookie.value, 
        user: parseUserCookie(userCookie.value) || {} 
      }).catch(() => {});
    } else {
      // No token found → ensure storage is cleared
      await chrome.storage.local.remove([KEY_TOKEN, KEY_USER]);
      chrome.runtime.sendMessage({ type: "_AUTH_LOGOUT" }).catch(() => {});
    }
  } catch (err) {
    console.error("[InForm] syncCookieToStorage error:", err);
  }
}

// ── 1. Listen for Cookie Changes (The "Magic" Sync for Google OAuth) ─────────
// This triggers instantly when NextAuth sets/removes cookies after Google Login
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const { cookie, removed } = changeInfo;

  // Only care about our specific auth cookies
  if (cookie.name !== KEY_TOKEN && cookie.name !== KEY_USER) return;

  // Verify domain matches our Next.js app
  const url = new URL(NEXTJS_BASE);
  const isMatchingDomain = 
    cookie.domain === url.hostname || 
    cookie.domain === `.${url.hostname}` ||
    cookie.domain === url.hostname.replace("www.", "");

  if (!isMatchingDomain) return;

  console.log("[Background] Auth cookie changed:", cookie.name, removed ? "REMOVED" : "SET");

  if (removed) {
    // User logged out on website → Clear extension storage & notify sidepanel
    await chrome.storage.local.remove([KEY_TOKEN, KEY_USER]);
    chrome.runtime.sendMessage({ type: "_AUTH_LOGOUT" }).catch(() => {});
  } else {
    // User logged in/refreshed on website → Sync immediately
    await syncCookieToStorage();
  }
});

// ── 2. Sync on Tab Events (Fallback/Startup) ─────────────────────────────────
// Sync whenever a tab on localhost:3000 finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith(NEXTJS_BASE)) {
    syncCookieToStorage();
  }
});

// Sync whenever the user switches to a tab on localhost:3000
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab?.url?.startsWith(NEXTJS_BASE)) {
    syncCookieToStorage();
  }
});

// Initial sync when service worker starts
syncCookieToStorage();

// ── 3. On Install & Action Click ─────────────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // @ts-ignore
    chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
  }
});

// ── 4. Form Detection & Analysis Logic ───────────────────────────────────────
async function handlePageHasForm(
  payload: { fields: unknown[]; url: string },
  tabId?: number
) {
  if (!tabId || !payload.fields?.length) return;

  // Get auth token
  const result = await chrome.storage.local.get(KEY_TOKEN);
  const token  = (result[KEY_TOKEN] as string) || null;
  if (!token) return; // not logged in — don't analyze

  // Call Next.js /api/analyze
  try {
    const res = await fetch(`${NEXTJS_BASE}/api/analyze`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify({ schema: payload.fields }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      console.warn("[InForm] analyze returned", res.status);
      return;
    }

    const data = await res.json() as {
      filled: Record<string, { value: string; confidence: number; source: string }>
    };

    if (!data.filled || Object.keys(data.filled).length === 0) return;

    // Send analyzed values to content.ts — it will inject the fill buttons
    chrome.tabs.sendMessage(tabId, {
      type:    "INJECT_FILL_BUTTONS",
      payload: data.filled,
    }).catch(() => {
      // Tab may have navigated away — safe to ignore
    });

  } catch (err) {
    console.error("[InForm] handlePageHasForm:", err);
  }
}

// ── 5. Message Listeners ─────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type) return false;

  if (message.type === "PAGE_HAS_FORM") {
    handlePageHasForm(message.payload, sender.tab?.id);
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "FILL_RESULT") {
    // Forward fill result to sidepanel so chat can show the score
    chrome.runtime.sendMessage({ type: "FILL_RESULT", payload: message.payload }).catch(() => {});
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "GET_AUTH_STATUS") {
    chrome.storage.local.get(KEY_TOKEN).then((result) => {
      sendResponse({ status: result[KEY_TOKEN] ? "authenticated" : "unauthenticated" });
    });
    return true;
  }

  if (message.type === "OPEN_SIDE_PANEL") {
    const tabId = sender.tab?.id;
    if (tabId) {
      // @ts-ignore
      chrome.sidePanel.open({ tabId }).catch(console.error);
    }
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

// ── 6. External Messages from Website (Optional Backup) ──────────────────────
const ALLOWED_ORIGINS = [NEXTJS_BASE, "https://inform-anda.com"];

chrome.runtime.onMessageExternal?.addListener((message, sender, sendResponse) => {
  if (!sender.origin || !ALLOWED_ORIGINS.includes(sender.origin)) {
    sendResponse({ ok: false, error: "Untrusted origin" });
    return false;
  }
  if (!message?.type) return false;

  if (message.type === "_AUTH_LOGIN") {
    const { token, user } = message as { token?: string; user?: object };
    if (token) {
      const toStore: Record<string, string> = { [KEY_TOKEN]: token };
      if (user) toStore[KEY_USER] = JSON.stringify(user);
      chrome.storage.local.set(toStore);
    }
    // Forward to sidepanel
    chrome.runtime.sendMessage({ type: "_AUTH_LOGIN", token, user }).catch(() => {});
    if (sender.tab?.id) {
      // @ts-ignore
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch(console.error);
    }
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "_AUTH_LOGOUT") {
    chrome.storage.local.remove([KEY_TOKEN, KEY_USER]);
    chrome.runtime.sendMessage({ type: "_AUTH_LOGOUT" }).catch(() => {});
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

export {};