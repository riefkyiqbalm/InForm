// Applies the saved/OS theme synchronously, BEFORE React renders.
// Import this at the very top of every entry point (popup, sidepanel, options).
// Without this, the page flashes dark while ThemeProvider's useEffect runs.

const STORAGE_KEY = "inform-theme";

const LIGHT_VARS: Record<string, string> = {
  "--bg":       "#f0f4f8",
  "--panel":    "#e4ecf4",
  "--card":     "#ffffff",
  "--border":   "#c5d5e8",
  "--teal":     "#009b92",
  "--teal-dim": "#00756d",
  "--gold":     "#c49a00",
  "--red":      "#d63057",
  "--text":     "#0d1b2a",
  "--muted":    "#4a6580",
  "--glow":     "0 0 40px rgba(0,155,146,.12)",
};

if (typeof document !== "undefined") {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "light") {
      for (const k of Object.keys(LIGHT_VARS)) {
        root.style.setProperty(k, LIGHT_VARS[k]);
      }
    }
  } catch {
    /* ignore — extension storage may be locked early */
  }
}
