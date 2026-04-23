'use client';

import React from 'react';

interface FormatButtonProps {
  onClick: () => void;
  label?: string;
}

export default function FormatButton({ onClick, label = 'Atur ulang' }: FormatButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .2s',
        fontFamily: 'var(--font-body)',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        color: 'var(--text)',
      }}
    >
      {label}
    </button>
  );
}
