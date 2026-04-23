'use client';

import React from 'react';
import Link from 'next/link';
import BackButton from '@/components/buttons/BackButton';
import TopBarLogo from '../logo/TopBarLogo';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  children?: React.ReactNode;
}

export default function TopPanel({ title, subtitle, backHref = '/', children }: AppHeaderProps) {
  return (
    <nav style={S.nav}>
      <TopBarLogo/>
      <div style={S.rightSection}>
        {subtitle && <span style={S.subtitle}>{subtitle}</span>}
        <BackButton href={backHref} label="Kembali" variant="ghost" />
      </div>

      {children}
    </nav>
  );
}

const S: Record<string, React.CSSProperties> = {
  nav: {
    height: '60px',
    background: 'var(--panel)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
};
