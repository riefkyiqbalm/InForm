// import React from 'react';
// import LogOut from '@/components/auth/LogOutButton';
// import Icon from '@sharedUI/components/IconStyles';

// export default function LeftPanel() {
//   return (
//     <aside id='authLeftPanel' style={{ width: '240px', minWidth: '240px', background: 'var(--panel)', borderRight: '1px solid var(--border)', padding: '28px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
//       <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Akun</div>
//       {['Profil Saya', 'Keamanan', 'Notifikasi'].map((item, idx) => (
//         <a key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: idx === 0 ? 'var(--teal)' : 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s', ...(idx === 0 ? { background: 'rgba(0,212,200,.1)', borderLeft: '2px solid var(--teal)', paddingLeft: '10px' } : {}) }}>
//           <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
//             {item === 'Profil Saya' && <Icon name="white-user" size={20}  />}
//             {item === 'Keamanan' && <Icon name="white-lock" size={20}  />}
//             {item === 'Notifikasi' && <Icon name="white-bell" size={20}  />}
//           </span>
//           {item}
//         </a>
//       ))}

//       <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Platform</div>
//       {['Model AI', 'API Key'].map((item, idx) => (
//         <a key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
//           <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
//             {item === 'Model AI' && <Icon name="white-ai" size={20}  />}
//             {item === 'API Key' && <Icon name="white-key" size={20}  />}
//           </span>
//           {item}
//         </a>
//       ))}

//       <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Lainnya</div>
//       <a href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
//         <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
//           <Icon name="white-policy" size={20}  />
//         </span>
//         Ketentuan Layanan
//       </a>
//       <LogOut />
//     </aside>
//   );
// }

"use client";

import React from "react";
import Icon from "@sharedUI/components/IconStyles";
import type { TabType } from "@sharedUI/types"; 
import { it } from "node:test";


interface LeftPanelProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function LeftPanel({ activeTab, onTabChange }: LeftPanelProps) {
  const menuItems: { id: TabType; label: string; icon: string; invert?:boolean }[] = [
    { id: "profile", label: "Profil Saya", icon: "white-user" },
    { id: "security", label: "Keamanan", icon: "white-lock" },
    { id: "api-key", label: "API Key", icon: "white-key" },
    { id: "terms", label: "Ketentuan Layanan", icon: "white-policy" },
    { id: "logout", label: "Keluar", icon: "red-logout", invert:(false)},
  ];

  const handleClick = (tab: TabType) => {
    onTabChange(tab);
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h2 style={S.title}>Profile</h2>
      </div>
      <nav style={S.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            style={{
              ...S.item,
              ...(activeTab === item.id ? S.activeItem : {}),
            }}
          >
            <Icon name={item.icon} size={18} invert={item.invert} />
            <span style={{
              ...S.label,
              color: item.id == "logout" ? "#ff4d6d" :"var(--text)",
              fontWeight: activeTab === item.id ? 600 : 400,
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: {
    width: 260,
    background: "var(--panel)",
    borderRight: "1px solid var(--border)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    flexShrink: 0,
  },
  header: { paddingLeft: "12px" },
  title: { fontSize: "14px", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "1px" },
  nav: { display: "flex", flexDirection: "column", gap: "4px" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
  },
  activeItem: {
    background: "rgba(0, 212, 200, 0.1)",
  },
  label: { fontSize: "14px" },
};