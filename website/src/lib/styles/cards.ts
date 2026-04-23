/**
 * Shared card, container, and layout styles
 * Extracted from: DangerZoneCard, MessageBubble, etc.
 */

export const cardStyles = {
  // Standard card
  base: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
  } as React.CSSProperties,

  // Elevated card with shadow
  elevated: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "var(--glow)",
  } as React.CSSProperties,

  // Danger zone card (destructive actions)
  danger: {
    background: "rgba(255,77,109,.05)",
    border: "1px solid rgba(255,77,109,.2)",
    borderRadius: "16px",
    padding: "24px",
  } as React.CSSProperties,

  // Success state card
  success: {
    background: "rgba(61,255,160,.05)",
    border: "1px solid rgba(61,255,160,.2)",
    borderRadius: "16px",
    padding: "24px",
  } as React.CSSProperties,

  // Hover state
  hover: {
    transition: "all .15s",
    cursor: "pointer",
  } as React.CSSProperties,
};

/**
 * Chat bubble styles
 */
export const bubbleStyles = {
  // User message bubble
  user: {
    backgroundColor: "var(--teal)",
    color: "white",
    borderRadius: "18px 18px 4px 18px",
    padding: "12px 16px",
    maxWidth: "80%",
    wordWrap: "break-word" as const,
  } as React.CSSProperties,

  // Bot/assistant message bubble
  bot: {
    backgroundColor: "var(--card)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "18px 18px 18px 4px",
    padding: "12px 16px",
    maxWidth: "80%",
    wordWrap: "break-word" as const,
  } as React.CSSProperties,

  // Message row container
  row: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  } as React.CSSProperties,

  // User message row (right-aligned)
  rowUser: {
    justifyContent: "flex-end",
  } as React.CSSProperties,

  // Avatar styles
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  } as React.CSSProperties,

  avatarUser: {
    background: "var(--teal)",
    order: 2,
  } as React.CSSProperties,

  avatarBot: {
    background: "rgba(0,212,200,.1)",
    border: "1px solid var(--teal)",
  } as React.CSSProperties,
};

/**
 * Panel and sidebar styles
 */
export const panelStyles = {
  // Left sidebar panel
  leftPanel: {
    width: "280px",
    background: "var(--bg)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    overflowY: "auto" as const,
  } as React.CSSProperties,

  // Right panel
  rightPanel: {
    width: "320px",
    background: "var(--bg)",
    borderLeft: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    overflowY: "auto" as const,
  } as React.CSSProperties,

  // Main content area
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflowY: "auto" as const,
  } as React.CSSProperties,

  // Panel header
  header: {
    padding: "16px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  } as React.CSSProperties,

  // Panel body
  body: {
    flex: 1,
    padding: "16px",
    overflowY: "auto" as const,
  } as React.CSSProperties,

  // Panel footer
  footer: {
    padding: "16px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    gap: "12px",
  } as React.CSSProperties,
};

/**
 * Modal and dialog styles
 */
export const modalStyles = {
  // Modal overlay
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  } as React.CSSProperties,

  // Modal content
  content: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  } as React.CSSProperties,

  // Modal header
  header: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "var(--text)",
  } as React.CSSProperties,

  // Modal body
  body: {
    color: "var(--muted)",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "24px",
  } as React.CSSProperties,

  // Modal footer
  footer: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  } as React.CSSProperties,
};
