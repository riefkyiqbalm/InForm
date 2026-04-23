'use client';

import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

const BASE = {
  position: 'fixed' as const,
  bottom: '28px',
  right: '28px',
  padding: '12px 20px',
  borderRadius: '12px',
  fontSize: '13px',
  zIndex: 999,
  boxShadow: 'var(--glow)',
};

export default function Toast({ message, type = 'info' }: ToastProps) {
  const color = type === 'success' ? 'var(--teal)' : type === 'error' ? 'var(--red)' : 'var(--text)';
  const border = type === 'success' ? '1px solid var(--teal-dim)' : type === 'error' ? '1px solid rgba(255,77,109,.2)' : '1px solid var(--border)';

  return (
    <div style={{ ...BASE, background: 'var(--card)', border, color }}>{message}</div>
  );
}
