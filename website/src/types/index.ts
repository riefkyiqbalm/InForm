// types/index.ts

export type Role = "USER" | "ASSISTANT";

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id:          string;
  name:        string;
  email:       string;
  image:       string;
  contact:     string;
  institution: string;
  role:        Role;
  createdAt:   string;
}

export interface AuthContextType {
  user:            User | null;
  isAuthenticated: boolean;
  loading:         boolean;

// ── Core auth ──────────────────────────────────────────────────────────────
  login:    (email: string, password: string) => Promise<void>;
  register: ( email: string, password: string, name: string) => Promise<void>;
  logout:   () => void;
 
  // ── Password reset flow (unauthenticated) ──────────────────────────────────
  /** Step 1 — sends reset link to email. Silent on unknown address. */
  forgotPassword: (email: string) => Promise<void>;
  /** Step 2 — sets new password using token from the reset email link. */
  resetPassword:  (token: string, newPassword: string) => Promise<void>;
 
  // ── Profile settings (authenticated) ──────────────────────────────────────
  /** Change password from profile — requires current password. Sends security alert email. */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Request email change — requires password. Sends verification to new address. Returns message. */
  changeEmail:    (newEmail: string, password: string) => Promise<string | void>;
}


// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:        string;
  sessionId: string;
  role:      Role;
  text:      string;
  createdAt: string;
}

export interface ChatSession {
  id:        string;
  title:     string;
  pinnedAt:  string | null; // null = not pinned; ISO string = pinned timestamp
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}
interface SendMessageArgs {
  text: string;
  signal?: AbortSignal;
  sessionId?: string; // Jika sewaktu-waktu butuh override ID
}

export interface ChatContextType {
  // ── State ──────────────────────────────────────────────────────────────────
  sessions:         ChatSession[];
  activeSessionId:  string;
  activeSession:    ChatSession | null;
  loadingSessionId: string | null;
  isLoading:        boolean;        // true while any async operation is in-flight
  error:            string | null;  // last error message, null when clear
  
  // ── Actions ────────────────────────────────────────────────────────────────
  createSession:    () => Promise<string>;
  setActiveSession: (sessionId: string) => void;
  // loadSession fetches a session's messages from the DB and sets it active
  loadSession:      (sessionId: string) => Promise<void>;
  addMessage:       (sessionId: string, payload: Omit<ChatMessage, "id" | "createdAt">) => void;
  // sendMessage accepts an optional explicit sessionId for components that
  // manage their own session state (e.g. ChatContainer)
  // sendMessage:      (text: string, sessionId?: string) => Promise<void>;
  sendMessage: (args: SendMessageArgs) => Promise<void>;
  deleteSession:    (sessionId: string) => Promise<void>;
  renameSession:    (sessionId: string, newTitle: string) => Promise<void>;
  pinSession:       (sessionId: string) => Promise<void>;
  clearError:       () => void;
}

// ── UI ────────────────────────────────────────────────────────────────────────

export type InputMode =  'text' | 'foto' | 'video' | 'document';
export type ActionType = "copy" | "delete" | "pin" | "rename" |'unpin';

export interface UIMessage extends ChatMessage {
  isOptimistic?: boolean;
  isStreaming?: boolean;
}

// ── Verify Email ─────────────────────────────────────────────────────────────
export type VerifyState = 'waiting' | 'verifying' | 'success' | 'error';

export interface VerifyStateProps {
  state: VerifyState;
  message?: string;
  email?: string;
}

// ── Global Definitions ──────────────────────────────────────────────────────

declare global {
  /**
   * Mengizinkan penggunaan objek 'chrome' (Browser Extension API) 
   * di dalam lingkungan Next.js tanpa error "Cannot find name".
   */

  interface Window {
    chrome: typeof chrome;
  }
}

// Pastikan file ini dianggap sebagai module
export {};
