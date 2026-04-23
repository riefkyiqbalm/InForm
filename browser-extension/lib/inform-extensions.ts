// ─────────────────────────────────────────────────────────────────────────────
// lib/inform-extension.ts  (paste this into your Next.js website at localhost:3000)
// ─────────────────────────────────────────────────────────────────────────────
//
// After a successful login, call notifyExtension(token, user).
// The extension sidepanel will instantly switch from NetworkGuard → MainChat.
//
// Where to call it:
//   - Inside your AuthContext login() success handler
//   - Or right after router.push("/chat/...") in your login page
//
// EXTENSION_ID: find it at chrome://extensions after loading the unpacked build.
// In production, hardcode the published extension ID here.

const EXTENSION_ID = process.env.NEXT_PUBLIC_INFORM_EXTENSION_ID ?? ""

export interface ExtensionUser {
  id: string | number
  name: string
  email: string
  image?: string
  contact?: string
  institution?: string
  role?: string
  createdAt?: string
}

/**
 * Notify the InForm extension that the user just logged in.
 * The extension sidepanel will immediately switch to the chat view.
 */
export function notifyExtensionLogin(token: string, user: ExtensionUser): void {
  if (!EXTENSION_ID || typeof chrome === "undefined" || !chrome.runtime) {
    // Extension not installed or ID not configured — silently ignore
    return
  }

  chrome.runtime.sendMessage(
    EXTENSION_ID,
    { type: "_AUTH_LOGIN", token, user },
    (response) => {
      if (chrome.runtime.lastError) {
        // Extension not installed or not loaded — safe to ignore
        console.debug("[InForm] Extension not reachable:", chrome.runtime.lastError.message)
        return
      }
      console.debug("[InForm] Extension notified of login:", response)
    }
  )
}

/**
 * Notify the InForm extension that the user logged out.
 * The extension sidepanel will switch back to NetworkGuard/Login.
 */
export function notifyExtensionLogout(): void {
  if (!EXTENSION_ID || typeof chrome === "undefined" || !chrome.runtime) return

  chrome.runtime.sendMessage(
    EXTENSION_ID,
    { type: "_AUTH_LOGOUT" },
    () => { /* ignore errors */ }
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLE — inside your website's AuthContext or login handler:
// ─────────────────────────────────────────────────────────────────────────────
//
// import { notifyExtensionLogin, notifyExtensionLogout } from "~/lib/inform-extension"
//
// // After successful login:
// const data = await loginApiCall(email, password)
// notifyExtensionLogin(data.token, data.user)   // ← add this one line
// router.push(`/chat/${data.user.id}`)
//
// // After logout:
// notifyExtensionLogout()                         // ← add this one line
// router.push("/login")