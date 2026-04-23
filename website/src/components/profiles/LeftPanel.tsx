import React from 'react';
import LogOut from '../buttons/LogOutButton';
import Icon from '../IconStyles';

export default function LeftPanel() {
  return (
    <aside id='authLeftPanel' style={{ width: '240px', minWidth: '240px', background: 'var(--panel)', borderRight: '1px solid var(--border)', padding: '28px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Akun</div>
      {['Profil Saya', 'Keamanan', 'Notifikasi'].map((item, idx) => (
        <a key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: idx === 0 ? 'var(--teal)' : 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s', ...(idx === 0 ? { background: 'rgba(0,212,200,.1)', borderLeft: '2px solid var(--teal)', paddingLeft: '10px' } : {}) }}>
          <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
            {item === 'Profil Saya' && <Icon name="user" size={20}  />}
            {item === 'Keamanan' && <Icon name="lock" size={20}  />}
            {item === 'Notifikasi' && <Icon name="bell" size={20}  />}
          </span>
          {item}
        </a>
      ))}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Platform</div>
      {['Model AI', 'API Key'].map((item, idx) => (
        <a key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
          <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
            {item === 'Model AI' && <Icon name="ai" size={20}  />}
            {item === 'API Key' && <Icon name="password" size={20}  />}
          </span>
          {item}
        </a>
      ))}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Lainnya</div>
      <a href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'all .15s' }}>
        <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>
          <Icon name="policy" size={20}  />
        </span>
        Ketentuan Layanan
      </a>
      <LogOut />
    </aside>
  );
}