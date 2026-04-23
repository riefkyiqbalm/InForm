/**
 * Shared button styles used across multiple components
 * Extracted from: FormatButton, SendButton, AttachButton, etc.
 */

export const buttonStyles = {
  // Primary action button
  primary: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, var(--teal), #0080cc)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(0,212,200,.2)',
    transition: '0.2s'
  } as React.CSSProperties,

  // Icon button style
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "all .15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,

  // Small icon button
  iconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "all .15s",
    fontSize: "14px",
  } as React.CSSProperties,

  // Ghost button (transparent background)
  ghost: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: 'var(--muted)',
    transition: '0.2s'
  } as React.CSSProperties,

  ghostActive: {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    color: 'var(--teal)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  } as React.CSSProperties,

  // Danger button (delete/destructive actions)
  danger: {
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid rgba(255,77,109,.3)",
    background: "rgba(255,77,109,.05)",
    color: "var(--red)",
    transition: "all .15s",
  } as React.CSSProperties,

  // Loading button state
  loading: {
    opacity: 0.6,
    cursor: "not-allowed",
  } as React.CSSProperties,

  // Hover state mixin
  hover: {
    opacity: 0.8,
  } as React.CSSProperties,

  iconNav: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "none",
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    cursor: "pointer",
    textDecoration: "none",
    flexShrink: 0,
  }as React.CSSProperties,
};

/**
 * Button group layout
 */
export const buttonGroupStyles = {
  container: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
  } as React.CSSProperties,

  vertical: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  } as React.CSSProperties,

  horizontal: {
    display: "flex",
    flexDirection: "row" as const,
    gap: "12px",
  } as React.CSSProperties,
};

/**
 * Button Tabs
 */
export const tabsButton = {
 tabs: {
    display: 'flex',
    background: 'var(--card)',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '24px',
    gap: '4px'
  } as React.CSSProperties,
  tabBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: 'var(--muted)',
    transition: '0.2s'
  } as React.CSSProperties,
  tabActive: {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    color: 'var(--teal)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  } as React.CSSProperties,
    errorBox: {
    background: 'rgba(255,77,109,.1)',
    border: '1px solid rgba(255,77,109,.3)',
    color: '#ff4d6d',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '13px',
    marginBottom: '20px'
  } as React.CSSProperties,
}
