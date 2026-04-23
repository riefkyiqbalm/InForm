import React from "react"

function IndexPopup() {
  const openSidePanel = async () => {
    // Mendapatkan tab yang sedang aktif
    const [tab] = await chrome.tabs.query({ 
      active: true, 
      lastFocusedWindow: true 
    })

    if (tab?.id) {
      // Membuka side panel untuk tab tersebut
      await chrome.sidePanel.open({ tabId: tab.id })
      // Opsional: Tutup popup setelah diklik
      window.close()
    }
  }

  return (
    <div style={{
      width: 200,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      background: "#161b22",
      color: "white"
    }}>
      <h3 style={{ margin: 0, fontSize: 16 }}>InForm AI</h3>
      <p style={{ fontSize: 12, color: "#8b949e" }}>
        Klik tombol di bawah untuk membuka fitur chat.
      </p>
      <button
        onClick={openSidePanel}
        style={{
          padding: "8px 12px",
          background: "#00d4c8",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontWeight: "bold"
        }}>
        Buka Side Panel
      </button>
    </div>
  )
}

export default IndexPopup