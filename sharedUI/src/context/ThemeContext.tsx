"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

const STORAGE_KEY = "inform-theme";

const THEME_VARS: Record<Theme, Record<string, string>> = {
  dark: {
    "--bg":       "#060d1a",
    "--panel":    "#0c1828",
    "--card":     "#0f2035",
    "--border":   "#1a3050",
    "--teal":     "#00d4c8",
    "--teal-dim": "#00897f",
    "--gold":     "#f5c842",
    "--red":      "#ff4d6d",
    "--text":     "#e8eef6",
    "--muted":    "#5a7a99",
    "--glow":     "0 0 40px rgba(0,212,200,.15)",
  },
  light: {
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
  },
};

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", t);
  const vars = THEME_VARS[t];
  for (const [prop, value] of Object.entries(vars)) {
    root.style.setProperty(prop, value);
  }
  localStorage.setItem(STORAGE_KEY, t);
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initial = getInitialTheme();
    applyTheme(initial);
    setThemeState(initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}

export function ThemeToggle({ style }: { style?: React.CSSProperties }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        color: "var(--muted)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        fontSize: 16,
        flexShrink: 0,
        transition: "all .15s",
        ...style,
      }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
