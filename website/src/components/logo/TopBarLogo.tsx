'use_client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import SmallLogo from './SmallLogo';

export default function TopBarLogo() {
  const { user, isAuthenticated } = useAuth();  

  const targetPath = (isAuthenticated && user?.id) ? `/chat/${user.id}` : '/login';
  return (
    <Link href={targetPath} style={S.brandAnchor} title='Chat'
    suppressHydrationWarning={true}>
        <SmallLogo/>
        <div style={S.brandText}>inForm</div>
    </Link>
  );
}
const S: Record<string, React.CSSProperties> = {
 brandAnchor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'var(--text)',
  },
  brandText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 800,
  },
}