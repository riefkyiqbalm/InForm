import "~lib/theme-bootstrap";

import React from "react";
import globalStyles from "data-text:~styles/global.css";
import { ThemeProvider, ThemeToggle } from "@sharedUI/context/ThemeContext";

function PopupBody() {
  const openSidePanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
    }
  };

  return (
    <div style={{
      width: 240,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-body,'DM Sans',system-ui,sans-serif)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "var(--text)", fontWeight: 700 }}>
          InForm AI
        </h3>
        <ThemeToggle />
      </div>
      <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
        Klik tombol di bawah untuk membuka fitur chat.
      </p>
      <button
        type="button"
        onClick={openSidePanel}
        style={{
          padding: "8px 12px",
          background: "var(--teal)",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13,
          color: "var(--bg)",
          transition: "opacity .15s",
        }}
      >
        Buka Side Panel
      </button>
    </div>
  );
}

export default function IndexPopup() {
  return (
    <>
      <style>{globalStyles}</style>
      <ThemeProvider>
        <PopupBody />
      </ThemeProvider>
    </>
  );
}
