// components/ui/Icon.tsx
'use-client'
import { ICONS, type IconType } from '@sharedUI/lib/constants/icon';
import React from 'react';

interface IconProps {
  name: IconType | string;
  size?: number;
  invert?: boolean;
}

export default function Icon({
  name,
  size = 20,
  invert = true ,// Default ke false agar warna asli muncul
}: IconProps) {

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
        filter: invert ? 'invert(1)' : 'none',
        display: 'inline-block',
        flexShrink: 0, // Mencegah ikon gepeng dalam flexbox
      }}
    />
  );
}