'use client';

import React from 'react';

interface SummaryCardProps {
  name: string;
  email: string;
  roles: string[];
}

export default function SummaryCard({ name, email, roles }: SummaryCardProps) {
  const displayName = name || 'User name';
  const displayEmail = email || 'email@example.com';
  const displayRoles = roles && roles.length > 0 ? roles : ['User'];

  return (
    <div style={S.card}>
      <div style={S.avatar}>
        {name.slice(0, 2).toUpperCase()}
        <span style={S.editIcon}>✎</span>
      </div>
      <div>
        <h3 style={S.name}>{name}</h3>
        <p style={S.email}>{email}</p>
        <div style={S.badges}>
          {roles.map((r) => (
            <span key={r} style={S.badge}>✦ {r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px'
  },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#1a4a7a,#003355)', border: '3px solid var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--teal)', position: 'relative', cursor: 'pointer', flexShrink: 0
  },
  editIcon: {
    position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'var(--teal)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  name: { fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800, marginBottom: '3px' },
  email: { color: 'var(--muted)', fontSize: '13px', marginBottom: '10px' },
  badges: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: { padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: 'rgba(0,212,200,.12)', border: '1px solid rgba(0,212,200,.3)', color: 'var(--teal)' },
};
