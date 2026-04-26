// Shared types for InForm - used by both browser-extension and website

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
  register: (email: string, password: string, name: string) => Promise<void>;
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
  signInWithOIDC:   () => Promise<void>;
  
}

interface OAuthButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:        string;
  sessionId: string;
  role:      Role;
  text:      string;
  createdAt: string;
  attachments?: AttachmentInfo[];
}

export interface AttachmentInfo {
  name: string;
  type: string;
  size?: number;
  content?: string; // Optional text content for text-based files
}

export interface ChatSession {
  id:        string;
  title:     string;
  pinnedAt:  string | null; // null = not pinned; ISO string = pinned timestamp
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface InterruptedMessage {
  text:      string;
  sessionId: string;
}

export interface SendMessageArgs {
  text: string;
  signal?: AbortSignal;
  sessionId?: string; // Jika sewaktu-waktu butuh override ID
  attachments?: AttachmentInfo[];
}

export interface ChatContextType {
  // ── State ──────────────────────────────────────────────────────────────────
  sessions:         ChatSession[];
  activeSessionId:  string;
  activeSession:    ChatSession | null;
  loadingSessionId: string | null;
  isLoading:        boolean;        // true while any async operation is in-flight
  error:            string | null;  // last error message, null when clear
  abortedMessage:   InterruptedMessage | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  setActiveSession: (sessionId: string) => void;
  loadSession:      (sessionId: string) => Promise<void>;
  addMessage:       (sessionId: string, payload: Omit<ChatMessage, "id" | "createdAt">) => void;
  sendMessage:      (args: SendMessageArgs) => Promise<void>;
  deleteSession:    (sessionId: string) => Promise<void>;
  renameSession:    (sessionId: string, newTitle: string) => Promise<void>;
  pinSession:       (sessionId: string) => Promise<void>;
  clearError:       () => void;
  clearAborted:     () => void;
  retryMessage:     (text: string) => Promise<void>;
  setLoadingSessionId: (sessionId: string | null) => void;
  createSession:    () => Promise<string>;
}

// ── UI ────────────────────────────────────────────────────────────────────────

export type InputMode =  'text' | 'foto' | 'video' | 'document';
export type ActionType = "copy" | "delete" | "pin" | "rename" | 'unpin';
export type PageType = 'dashboard'|'conversation' | 'settings' | 'logout';

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

// ── Form Fill ────────────────────────────────────────────────────────────────
export interface FormField {
  name?: string;
  id?: string;
  type: string;
  label?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface FillResult {
  filled: number;
  skipped: string[];
  total: number;
  score: number;
}

