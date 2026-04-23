'use client';
import React, { useState } from 'react';
import Icon from '../IconStyles';

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function SendButton({ onClick, disabled = false }: SendButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...S.sendBtn,
        ...(isHovered && !disabled ? S.sendBtnHover : {}),
        ...(disabled ? S.sendBtnDisabled : {}),
      }}
      type="button"
    >
      <Icon name='white-send' size={20}></Icon>
    </button>
  );
}

const S: Record<string, React.CSSProperties> = {
  sendBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    border: 'none', 
    background: 'var(--teal)', 
    color: '#fff', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out' 
  },
  sendBtnHover: {
    filter: 'brightness(1.1)',
    transform: 'scale(1.05)',
  },
  sendBtnDisabled: { 
    background: 'var(--border)', 
    cursor: 'not-allowed' 
  },
};