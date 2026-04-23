// background.ts — Plasmo background service worker

const KEY_TOKEN   = "_auth_token";
const KEY_USER    = "_auth_user";
const NEXTJS_BASE = "http://localhost:3000";

// ── On install ────────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
  }
});

// ── Open sidepanel on icon click ──────────────────────────────────────────────
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // @ts-ignore
    chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
  }
});

// ── Function For Detect Web/Page Form ──────────────────────────────────────────────
async function handlePageHasForm(
  payload: { fields: unknown[]; url: string },
  tabId?: number
) {
  if (!tabId || !payload.fields?.length) return
 
  // Get auth token
  const result = await chrome.storage.local.get(KEY_TOKEN)
  const token  = (result[KEY_TOKEN] as string) || null
  if (!token) return   // not logged in — don't analyze
 
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
    })
 
    if (!res.ok) {
      console.warn("[InForm] analyze returned", res.status)
      return
    }
 
    const data = await res.json() as {
      filled: Record<string, { value: string; confidence: number; source: string }>
    }
 
    if (!data.filled || Object.keys(data.filled).length === 0) return
 
    // Send analyzed values to content.ts — it will inject the fill buttons
    chrome.tabs.sendMessage(tabId, {
      type:    "INJECT_FILL_BUTTONS",
      payload: data.filled,
    }).catch(() => {
      // Tab may have navigated away — safe to ignore
    })
 
  } catch (err) {
    console.error("[InForm] handlePageHasForm:", err)
  }
}

// ── When a tab is activated or updated, sync cookie → chrome.storage.local ───
// This is the KEY fix: every time the user opens or switches to a tab on
// localhost:3000, we read the auth cookie and sync it into chrome.storage.local
// so the sidepanel always has the token on reopen — even without a LOGIN message.
async function syncCookieToStorage(): Promise<void> {
  try {
    const tokenCookie = await chrome.cookies.get({ url: NEXTJS_BASE, name: KEY_TOKEN });
    const userCookie  = await chrome.cookies.get({ url: NEXTJS_BASE, name: KEY_USER  });

    if (tokenCookie?.value) {
      const toStore: Record<string, string> = { [KEY_TOKEN]: tokenCookie.value };
      if (userCookie?.value) toStore[KEY_USER] = decodeURIComponent(userCookie.value);
      await chrome.storage.local.set(toStore);
    } else {
      // Cookie gone (user logged out on website) — clear extension storage too
      await chrome.storage.local.remove([KEY_TOKEN, KEY_USER]);
    }
  } catch (err) {
    console.error("[InForm] syncCookieToStorage error:", err);
  }
}

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

// Also sync when the sidepanel connects (service worker wakes up)
// This runs on every extension startup / sidepanel open
syncCookieToStorage();

// ── Internal messages ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type) return false;

  if (message.type === "PAGE_HAS_FORM") {
    handlePageHasForm(message.payload, sender.tab?.id)
    sendResponse({ ok: true })
    return true
  }
 
  if (message.type === "FILL_RESULT") {
    // Forward fill result to sidepanel so chat can show the score
    chrome.runtime.sendMessage({ type: "FILL_RESULT", payload: message.payload }).catch(() => {})
    sendResponse({ ok: true })
    return true
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


// ── External messages from the website ────────────────────────────────────────
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
    // Forward to sidepanel so AuthContext reacts instantly
    chrome.runtime.sendMessage({ type: "_AUTH_LOGIN", token, user }).catch(() => {});
    // Auto-open sidepanel
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

const POPUP_WIDTH  = 420   // px — adjust to your preference
const POPUP_HEIGHT = 700   // px
 
chrome.action.onClicked.addListener(async (tab) => {
  // Get current window to position the popup at the right edge
  const win = await chrome.windows.getCurrent()
 
  const left = (win.left ?? 0) + (win.width ?? 1200) - POPUP_WIDTH - 20
  const top  = (win.top  ?? 0) + 60
 
  chrome.windows.create({
    url:    chrome.runtime.getURL("sidepanel.html"),
    type:   "popup",
    width:  POPUP_WIDTH,
    height: POPUP_HEIGHT,
    left,
    top,
  })
})
 

export {};