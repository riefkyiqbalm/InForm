'use-client'
import Icon from "./IconStyles";
import { buttonStyles as S } from "@sharedUI/lib/styles/buttons";

interface IconNavProps {
  onToggleLeftPanel: () => void; // Fungsi untuk membuka/tutup panel
}

export default function IconNav({ onToggleLeftPanel }: IconNavProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {/* Tombol Baru untuk Membuka Left Panel */}
      <button 
        onClick={onToggleLeftPanel} 
        style={{ ...S.iconNav, border: "none", background: "none", cursor: "pointer" }}
        title="Buka Menu"
      >
        <Icon name="left_panel" size={20} />
      </button>

      {/* Navigasi Lainnya */}
      <a href="/dashboard" style={S.iconNav} title="Dashboard">
        <Icon name="dashboard" size={20} />
      </a>
      <a href="/profile" style={S.iconNav} title="Pengaturan">
        <Icon name="settings" size={20} />
      </a>
    </div>
  );
}