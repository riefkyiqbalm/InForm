/**
 * Shared icon characters and emoji definitions
 * Used across components for consistent icon usage
 */

import { rename, Stats } from "node:fs";

// Opsi: Type untuk keamanan (Intellisense)
export type IconType = keyof typeof ICONS;

export const ICONS = {
  // Navigation
  back: "/white-arrow-left.svg",
  forward: "/white-arrow-right.svg",
  menu: "/white-hamburger-menu.svg",
  close: "/red-close.svg",

  // Chat
  send: "/white-send.svg",
  user: "/white-user.svg",
  assistant: "🌿",
  edit: "white-pencil.svg",
  copy: "/white-copy.svg",
  delete_account: "/red-trash.svg",
  delete: "/red-trash.svg",
  pin: "/white-pin.svg",
  unpin: "/white-unpin.svg",
  video: "/white-video.svg",
  teks: "/white-pencil.svg",
  document: "/white-document.svg",
  foto: "/white-camera.svg",
  bowl: "/white-bowl.svg",
  building: "/white-building.svg",
  dashboard: "/white-dashboard.svg",
  text:"/white-pencil.svg",
  new_user:"/white-new-user.svg",

  // Actions
  attach: "/white-attach.svg",
  format: "/white-format.svg",
  settings: "/white-gear.svg",
  logout: "/red-logout.svg",
  refresh: "/white-refresh.svg",
  search: "/white-search.svg",
  search_add: "/white-add-search.svg",
  filter: "/white-filter.svg",
  sort_ascend: "white-sort-ascend.svg",
  sort_descend: "/white-sort-descend.svg",
  history: "/white-history.svg",
  share: "/white-share.svg",
  help: "/white-help.svg",
  kebab: "/white-menu-kebab.svg",
  rename: "/white-rename.svg",

  // Status
  loading: "/white-loading.svg",
  success: "✓",
  error: "/white-error.svg",
  warning: "/red-warning.svg",
  info: "/white-information.svg",
  lock: "/white-lock.svg",
  bell: "/white-bell.svg",
  pause:"/white-pause.svg",
  stop:"/white-stop.svg",

  // Authentication
  email: "/white-email.svg",
  password: "/white-key.svg",
  eye: "/white-eye.svg",
  eyeoff: "/white-eye-off.svg",

  // Social
  github: "🐙",
  google: "🔍",
  twitter: "𝕏",

  // General
  star: "⭐",
  heart: "❤️",
  thumb: "👍",
  check: "/white-check.svg",
  hand_shake: "/white-hand-shake.svg",
  cross: "/white-close.svg",
  new_chat: "/white-new-chat.svg",
  minus: "/white-minus.svg",
  dots: "/white-dots.svg",
  home: "/white-home.svg",
  user_group: "/black-group.svg",
  gear: "/white-gear.svg",
  ai: "/white-ai.svg",
  stats: "/white-stats.svg",
  policy: "/white-policy.svg",
};

/**
 * Action menu options and their icons
 */
export const ACTION_MENU_ITEMS = {
  copy: { icon: ICONS.copy, label: "Copy", shortKey: "Ctrl+C" },
  edit: { icon: ICONS.edit, label: "Edit", shortKey: "Ctrl+E" },
  delete: { icon: ICONS.delete, label: "Delete", shortKey: "Del" },
  pin: { icon: ICONS.pin, label: "Pin", shortKey: "" },
  unpin: { icon: ICONS.unpin, label: "Unpin", shortKey: "" },
  rename: { icon: ICONS.edit, label: "Rename", shortKey: "" },
  share: { icon: "🔗", label: "Share", shortKey: "Ctrl+Shift+S" },
  download: { icon: "⬇️", label: "Download", shortKey: "" },
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
