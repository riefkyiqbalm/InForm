/**
 * Shared input field styles used across multiple components
 * Extracted from: LoginForm, RegisterForm, ChatInput, etc.
 */

export const inputStyles = {
  // Standard input field
  base: {
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "all .15s",
    width: "100%",
  } as React.CSSProperties,

  // Input with card background (dark theme)
  card: {
    width: "100%",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "var(--text)",
    boxSizing: "border-box" as const,
    transition: "all .15s",
  } as React.CSSProperties,

  // Input with icon wrapper
  withIcon: {
    paddingLeft: "40px",
  } as React.CSSProperties,

  // Focus state
  focus: {
    borderColor: "var(--teal)",
    boxShadow: "0 0 0 2px rgba(0,212,200,.1)",
  } as React.CSSProperties,

  // Error state
  error: {
    borderColor: "var(--red)",
    background: "rgba(255,77,109,.05)",
  } as React.CSSProperties,

  // Disabled state
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    background: "var(--border)",
  } as React.CSSProperties,

  // Textarea style
  textarea: {
    padding: "12px 14px",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "var(--text)",
    background: "var(--card)",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    minHeight: "100px",
    transition: "all .15s",
  } as React.CSSProperties,

  // Search input
  search: {
    width: "100%",
    padding: "10px 14px 10px 40px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "var(--text)",
    fontFamily: "inherit",
  } as React.CSSProperties,
};

/**
 * Input wrapper and group styles
 */
export const inputGroupStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    marginBottom: "20px",
  } as React.CSSProperties,

  label: {
    fontSize: "14px",
    fontWeight: 500 as const,
    color: "var(--text)",
  } as React.CSSProperties,

  // Label with required asterisk
  labelRequired: {
    fontSize: "14px",
    fontWeight: 500 as const,
    color: "var(--text)",
  } as React.CSSProperties,

  // Wrapper for input with icon
  iconWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,

  // Icon style inside input
  icon: {
    position: "absolute" as const,
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    fontSize: "16px",
    pointerEvents: "none" as const,
  } as React.CSSProperties,

  // Helper text below input
  helperText: {
    fontSize: "12px",
    color: "var(--muted)",
    marginTop: "4px",
  } as React.CSSProperties,

  // Error message
  errorMessage: {
    fontSize: "12px",
    color: "var(--red)",
    marginTop: "4px",
  } as React.CSSProperties,

  // Success message
  successMessage: {
    fontSize: "12px",
    color: "var(--teal)",
    marginTop: "4px",
  } as React.CSSProperties,
};
