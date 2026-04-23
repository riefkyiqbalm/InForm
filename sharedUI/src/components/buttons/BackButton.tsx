import React from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
import ICONS from '~components/IconStyles';
import Icon from '~components/IconStyles';

interface BackButtonProps {
  href: string;
  label?: string;
  variant?: 'primary' | 'ghost';
}

export default function BackButton({ href, label = 'Kembali ke Chat', variant = 'primary' }: BackButtonProps) {
  const styles = variant === 'primary' ? S.btnPrimary : S.btnGhost;

  return (
    <a href={href} style={styles}>
      <Icon name="white-arrow-left" size={16} />
      {label}
    </a>
  );
}

const S: Record<string, React.CSSProperties> = {
  btnPrimary: {
    padding: '12px 22px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    background: 'linear-gradient(135deg,var(--teal),#0080cc)',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(0,212,200,.25)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all .2s',
    textDecoration: 'none',
  },
  btnGhost: {
    padding: '12px 22px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    background: 'var(--card)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
};
