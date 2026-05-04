'use client';
import { ICONS, type IconType } from '@sharedUI/lib/constants/icon';
import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Ensure this path matches your file structure

interface IconProps {
  name: IconType | string;
  size?: number;
  invert?: boolean; // Optional override
}

export default function Icon({
  name,
  size = 20,
  invert, 
}: IconProps) {
  const { theme } = useTheme();

  // - Dark Theme -> Need White Icon -> Invert Black to White (true)
  // - Light Theme -> Need Black Icon -> Keep Original (false)
  const shouldInvert = invert !== undefined ? invert : (theme === 'dark');

  const src = ICONS[name as IconType];

  if (!src) {
    console.warn(`Icon ${name} tidak ditemukan`);
    return null;
  }

  return (
    <img
      src={src}
      alt={`${name} icon`}
      width={size}
      height={size}
      style={{
        filter: shouldInvert ? 'invert(1)' : 'none',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}