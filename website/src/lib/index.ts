/**
 * BG-AI Library Utilities - Central Export Point
 * 
 * This file re-exports all utility functions and styles for easier importing.
 * 
 * Usage:
 * import { formatText, validateEmail, ICONS } from '@/lib'
 */

// ── Formatting Utilities ──────────────────────────────────────────
export {
  formatText,
  formatTimeFromISO,
  formatTime,
  truncateText,
  formatUserInitials,
  capitalize,
  formatNumber,
  formatDateReadable,
} from './formatters'

// ── Validation Utilities ──────────────────────────────────────────
export {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  checkPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  validateUsername,
  validateURL,
  validatePhone,
  sanitizeInput,
  validateFormFields,
} from './validators'

// ── Error & API Utilities ─────────────────────────────────────────
export {
  parseErrorMessage,
  getErrorType,
  handleAPIError,
  getErrorTypeByStatus,
  getErrorMessageByStatus,
  fetchWithAuth,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  formatErrorForLogging,
  logError,
  type ErrorType,
  type ApiError,
} from './errors'

// ── Database Utilities ────────────────────────────────────────────
export {
  deleteSessionById,
  deleteSessionsByIds,
  deleteSessionsByUserId,
} from './db'

// ── Custom Hooks ──────────────────────────────────────────────────
export {
  useClickOutside,
  useDebounce,
  useThrottle,
  useInViewport,
  usePrevious,
  useCopyToClipboard,
  useLocalStorage,
  useIsMounted,
  useAsync,
} from './hooks'

// ── Style Objects ─────────────────────────────────────────────────
// export { buttonStyles, buttonGroupStyles } from './styles/buttons'
// export { inputStyles, inputGroupStyles } from './styles/inputs'
// export { cardStyles, bubbleStyles, panelStyles, modalStyles } from './styles/cards'

// ── UI Constants ──────────────────────────────────────────────────
export {
  ICONS,
  ACTION_MENU_ITEMS,
  STATUS_INDICATORS,
  KEYBOARD_SHORTCUTS,
  TOAST_TYPES,
  AUTH_CONSTANTS,
  VALIDATION_MESSAGES,
  API_ENDPOINTS,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
} from './constants/icon'

// ── Suggestion Constants ──────────────────────────────────────────
export {
  DEFAULT_SUGGESTIONS,
  AUTH_SUGGESTIONS,
  QUICK_ACTIONS,
  EXAMPLE_PROMPTS,
  ERROR_SUGGESTIONS,
  ONBOARDING_SUGGESTIONS,
  SEARCH_SUGGESTIONS,
  getSuggestionsByCategory,
  getRandomSuggestion,
  filterSuggestions,
  type Suggestion,
} from './constants/suggestions'

// ── Existing Utilities ────────────────────────────────────────────
export { getUserFromToken } from './auth'
export { prisma } from './prisma'

/**
 * Quick Reference:
 * 
 * TEXT_FORMATTING:
 *   formatText(), formatTimeFromISO(), truncateText(), etc.
 * 
 * VALIDATION:
 *   validateEmail(), validatePassword(), checkPasswordStrength(), etc.
 * 
 * ERROR_HANDLING:
 *   parseErrorMessage(), handleAPIError(), getAuthToken(), etc.
 * 
 * HOOKS:
 *   useClickOutside(), useCopyToClipboard(), useLocalStorage(), etc.
 * 
 * STYLES:
 *   buttonStyles, inputStyles, cardStyles, etc.
 * 
 * CONSTANTS:
 *   ICONS, API_ENDPOINTS, VALIDATION_MESSAGES, etc.
 */
