'use client';

import React from 'react';

interface SaveButtonProps {
  onClick: () => Promise<void> | void;
  loading?: boolean;
  label?: string;
}

export default function SaveButton({ onClick, loading = false, label = 'Simpan Perubahan' }: SaveButtonProps) {
  return (
    <button
      onClick={() => {
        if (!loading) onClick();
      }}
      disabled={loading}
      style={{
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all .2s',
        fontFamily: 'var(--font-body)',
        border: 'none',
        background: 'linear-gradient(135deg,var(--teal),#0080cc)',
        color: '#fff',
        boxShadow: '0 4px 16px rgba(0,212,200,.2)',
      }}
    >
      {loading ? 'Menyimpan...' : label}
    </button>
  );
}
