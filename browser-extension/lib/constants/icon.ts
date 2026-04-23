/**
 * Shared icon characters and emoji definitions
 * Used across components for consistent icon usage
 */

import { rename, Stats } from "node:fs";

// Opsi: Type untuk keamanan (Intellisense)
// FILE INI DIHASILKAN OTOMATIS OLEH scripts/genIcons.js
// JANGAN EDIT MANUAL!

import redClose from "data-base64:~assets/red-close.svg";
import redLogout from "data-base64:~assets/red-logout.svg";
import redTrash from "data-base64:~assets/red-trash.svg";
import redWarning from "data-base64:~assets/red-warning.svg";
import whiteAddSearch from "data-base64:~assets/white-add-search.svg";
import whiteAi from "data-base64:~assets/white-ai.svg";
import whiteArrowLeft from "data-base64:~assets/white-arrow-left.svg";
import whiteArrowRight from "data-base64:~assets/white-arrow-right.svg";
import whiteAttach from "data-base64:~assets/white-attach.svg";
import whiteBell from "data-base64:~assets/white-bell.svg";
import whiteBowl from "data-base64:~assets/white-bowl.svg";
import whiteBuilding from "data-base64:~assets/white-building.svg";
import whiteCamera from "data-base64:~assets/white-camera.svg";
import whiteCheck from "data-base64:~assets/white-check.svg";
import whiteCloud from "data-base64:~assets/white-cloud.svg";
import whiteCopy from "data-base64:~assets/white-copy.svg";
import whiteDashboard from "data-base64:~assets/white-dashboard.svg";
import whiteDelete from "data-base64:~assets/white-delete.svg";
import whiteDocument from "data-base64:~assets/white-document.svg";
import whiteEmail2 from "data-base64:~assets/white-email-2.svg";
import whiteEmail from "data-base64:~assets/white-email.svg";
import whiteError from "data-base64:~assets/white-error.svg";
import whiteEyeOff from "data-base64:~assets/white-eye-off.svg";
import whiteEye from "data-base64:~assets/white-eye.svg";
import whiteFilter from "data-base64:~assets/white-filter.svg";
import whiteFormat from "data-base64:~assets/white-format.svg";
import whiteGear from "data-base64:~assets/white-gear.svg";
import whiteGroup from "data-base64:~assets/white-group.svg";
import whiteHamburgerMenu from "data-base64:~assets/white-hamburger-menu.svg";
import whiteHandShake from "data-base64:~assets/white-hand-shake.svg";
import whiteHelp from "data-base64:~assets/white-help.svg";
import whiteHistory from "data-base64:~assets/white-history.svg";
import whiteInformation from "data-base64:~assets/white-information.svg";
import whiteKey from "data-base64:~assets/white-key.svg";
import whiteLeftpanel from "data-base64:~assets/white-leftpanel.svg";
import whiteLoading from "data-base64:~assets/white-loading.svg";
import whiteLock from "data-base64:~assets/white-lock.svg";
import whiteLogout from "data-base64:~assets/white-logout.svg";
import whiteMenuKebab from "data-base64:~assets/white-menu-kebab.svg";
import whiteNewChat from "data-base64:~assets/white-new-chat.svg";
import whiteNewUser from "data-base64:~assets/white-new-user.svg";
import whiteNewWindow from "data-base64:~assets/white-new-window.svg";
import whitePause from "data-base64:~assets/white-pause.svg";
import whitePencil from "data-base64:~assets/white-pencil.svg";
import whitePin from "data-base64:~assets/white-pin.svg";
import whitePolicy from "data-base64:~assets/white-policy.svg";
import whiteRefresh from "data-base64:~assets/white-refresh.svg";
import whiteRename from "data-base64:~assets/white-rename.svg";
import whiteRetry from "data-base64:~assets/white-retry.svg";
import whiteSearch from "data-base64:~assets/white-search.svg";
import whiteSend from "data-base64:~assets/white-send.svg";
import whiteShare from "data-base64:~assets/white-share.svg";
import whiteSortAscending from "data-base64:~assets/white-sort-ascending.svg";
import whiteSortDescending from "data-base64:~assets/white-sort-descending.svg";
import whiteStats from "data-base64:~assets/white-stats.svg";
import whiteTrash from "data-base64:~assets/white-trash.svg";
import whiteUnpin from "data-base64:~assets/white-unpin.svg";
import whiteUser from "data-base64:~assets/white-user.svg";
import whiteVideo from "data-base64:~assets/white-video.svg";
import whiteWarning from "data-base64:~assets/white-warning.svg";
import whiteWifiOff from "data-base64:~assets/white-wifi-off.svg";
import whiteWifiOn from "data-base64:~assets/white-wifi-on.svg";
import whiteHome from "data-base64:~assets/white-home.svg"
import whiteFoto from "data-base64:~assets/white-foto.svg"
import whiteDownload from "data-base64:~assets/white-download.svg"
import whiteText from "data-base64:~assets/white-text.svg";
import multicolorCpu from "data-base64:~assets/multicolor-cpu.svg";
import multicolorMemory from "data-base64:~assets/multicolor-memory.svg";
import multicolorShield from "data-base64:~assets/multicolor-shield.svg";
import whiteStop from "data-base64:~assets/white-stop.svg";

export const ICONS = {
  "multicolor-cpu": multicolorCpu,
  "multicolor-memory": multicolorMemory,
  "multicolor-shield": multicolorShield,
  "red-close": redClose,
  "red-logout": redLogout,
  "red-trash": redTrash,
  "red-warning": redWarning,
  "white-add-search": whiteAddSearch,
  "white-ai": whiteAi,
  "white-arrow-left": whiteArrowLeft,
  "white-arrow-right": whiteArrowRight,
  "white-attach": whiteAttach,
  "white-bell": whiteBell,
  "white-bowl": whiteBowl,
  "white-building": whiteBuilding,
  "white-camera": whiteCamera,
  "white-check": whiteCheck,
  "white-cloud": whiteCloud,
  "white-copy": whiteCopy,
  "white-dashboard": whiteDashboard,
  "white-delete": whiteDelete,
  "white-document": whiteDocument,
  "white-email-2": whiteEmail2,
  "white-email": whiteEmail,
  "white-error": whiteError,
  "white-eye-off": whiteEyeOff,
  "white-eye": whiteEye,
  "white-filter": whiteFilter,
  "white-format": whiteFormat,
  "white-gear": whiteGear,
  "white-group": whiteGroup,
  "white-hamburger-menu": whiteHamburgerMenu,
  "white-hand-shake": whiteHandShake,
  "white-help": whiteHelp,
  "white-history": whiteHistory,
  "white-information": whiteInformation,
  "white-key": whiteKey,
  "white-leftpanel": whiteLeftpanel,
  "white-loading": whiteLoading,
  "white-lock": whiteLock,
  "white-logout": whiteLogout,
  "white-menu-kebab": whiteMenuKebab,
  "white-new-chat": whiteNewChat,
  "white-new-user": whiteNewUser,
  "white-new-window": whiteNewWindow,
  "white-pause": whitePause,
  "white-pencil": whitePencil,
  "white-pin": whitePin,
  "white-policy": whitePolicy,
  "white-refresh": whiteRefresh,
  "white-rename": whiteRename,
  "white-retry": whiteRetry,
  "white-search": whiteSearch,
  "white-send": whiteSend,
  "white-share": whiteShare,
  "white-sort-ascending": whiteSortAscending,
  "white-sort-descending": whiteSortDescending,
  "white-stats": whiteStats,
  "white-trash": whiteTrash,
  "white-unpin": whiteUnpin,
  "white-user": whiteUser,
  "white-video": whiteVideo,
  "white-warning": whiteWarning,
  "white-wifi-off": whiteWifiOff,
  "white-wifi-on": whiteWifiOn,
  "white-home": whiteHome,
  "white-foto": whiteFoto,
  "white-download": whiteDownload,
  "white-text": whiteText,
   "white-stop": whiteStop
} as const;

export type IconType = keyof typeof ICONS;


/**
 * Action menu options and their icons
 */
export const ACTION_MENU_ITEMS = {
  copy: { icon: ICONS["white-copy"], label: "Copy", shortKey: "Ctrl+C" },
  edit: { icon: ICONS["white-pencil"], label: "Edit", shortKey: "Ctrl+E" },
  delete: { icon: ICONS["white-trash"], label: "Delete", shortKey: "Del" },
  pin: { icon: ICONS["white-pin"], label: "Pin", shortKey: "" },
  unpin: { icon: ICONS["white-unpin"], label: "Unpin", shortKey: "" },
  rename: { icon: ICONS["white-pencil"], label: "Rename", shortKey: "" },
  share: { icon: ICONS["white-share"], label: "Share", shortKey: "Ctrl+Shift+S" },
  download: { icon: ICONS["white-download"], label: "Download", shortKey: "" },
  archive: { icon: "📦", label: "Archive", shortKey: "" },
} as const;

/**
 * Status indicators with colors and labels
 */
export const STATUS_INDICATORS = {
  online: { color: "var(--teal)", label: "Online", icon: "🟢" },
  offline: { color: "var(--muted)", label: "Offline", icon: "⚫" },
  away: { color: "#f5c842", label: "Away", icon: "🟡" },
  busy: { color: "var(--red)", label: "Busy", icon: "🔴" },
  loading: { color: "var(--teal)", label: "Loading", icon: "⏳" },
} as const;

/**
 * Common keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  save: "Ctrl + S",
  copy: "Ctrl + C",
  paste: "Ctrl + V",
  cut: "Ctrl + X",
  undo: "Ctrl + Z",
  redo: "Ctrl + Shift + Z",
  search: "Ctrl + F",
  delete: "Delete",
  enter: "Enter",
  escape: "Escape",
  tab: "Tab",
  shiftTab: "Shift + Tab",
  arrowUp: "↑",
  arrowDown: "↓",
  arrowLeft: "←",
  arrowRight: "→",
} as const;

/**
 * Toast message types with colors
 */
export const TOAST_TYPES = {
  success: { background: "rgba(61,255,160,.1)", color: "var(--teal)", border: "1px solid var(--teal-dim)" },
  error: { background: "rgba(255,77,109,.1)", color: "var(--red)", border: "1px solid rgba(255,77,109,.3)" },
  warning: { background: "rgba(245,200,66,.1)", color: "#f5c842", border: "1px solid rgba(245,200,66,.3)" },
  info: { background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)" },
} as const;

/**
 * Login and authentication related constants
 */
export const AUTH_CONSTANTS = {
  tokenKey: "_auth_token",
  userKey: "_auth_user",
  sessionTimeout: 3600000, // 1 hour in milliseconds
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

/**
 * Form validation messages
 */
export const VALIDATION_MESSAGES = {
  required: "This field is required",
  email: "Please enter a valid email address",
  password: "Password must be at least 6 characters",
  passwordMismatch: "Passwords do not match",
  username: "Username must be 3-20 characters (letters, numbers, underscore only)",
  phone: "Please enter a valid phone number",
  url: "Please enter a valid URL",
  min: (n: number) => `Must be at least ${n} characters`,
  max: (n: number) => `Must be no more than ${n} characters`,
  minNumber: (n: number) => `Must be at least ${n}`,
  maxNumber: (n: number) => `Must be no more than ${n}`,
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    profile: "/api/auth/profile",
  },
  chat: {
    sessions: "/api/chat/sessions",
    messages: "/api/chat/messages",
    stream: "/api/chat/stream",
  },
  user: {
    profile: "/api/user/profile",
    settings: "/api/user/settings",
    deleteAccount: "/api/user/delete",
  },
} as const;

/**
 * Animation duration constants (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;
