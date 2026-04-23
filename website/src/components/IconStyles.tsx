// components/ui/Icon.tsx
import Image from 'next/image';
import { ICONS, IconType } from '@/lib/constants/icon';

interface IconProps {
  name: IconType;
  size?: number;
  className?: string;
  color?: string;
  invert?: boolean; // Berguna jika ingin mengubah ikon hitam ke putih
  isOpen?: boolean; 
  // onClick: boolean;
}

export default function Icon({ name, size = 20, className, color, invert =  true}: IconProps) {
  return (
    <Image
      src={ICONS[name]}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={className}
      color={color}
      style={{ 
        filter: invert ? 'invert(1)' : 'none',
        display: 'inline-block' 
      }}
    />
  );
}
