'use client';
// components/buttons/StopButton.tsx

import React, { useState } from 'react';
import Icon from '../IconStyles';

interface StopButtonProps {
  onClick:   () => void;
  disabled?: boolean;
}

export default function StopButton({ onClick, disabled = false }: StopButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...S.stopBtn,
        ...(isHovered && !disabled ? S.stopBtnHover : {}),
        ...(disabled ? S.stopBtnDisabled : {}),
      }}
      type="button"
      aria-label="Hentikan generasi"
    >
      <Icon name="white-stop" size={14} />
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  stopBtn: {
    width:        42,
    height:       42,
    borderRadius: 12,
    border:       'none',
    background:   'var(--border)', // Menggunakan warna border agar kontras dengan teal
    color:        '#fff',
    cursor:       'pointer',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    transition:   'all 0.2s ease-in-out',
  },
  stopBtnHover: {
    background:   '#ef4444', // Berubah menjadi merah saat hover untuk indikasi "Stop"
    transform:    'scale(1.05)',
  },
  stopBtnDisabled: {
    background: 'var(--border)',
    cursor: 'not-allowed',
    opacity: 0.5,
    transform: 'scale(1)',
  }
};