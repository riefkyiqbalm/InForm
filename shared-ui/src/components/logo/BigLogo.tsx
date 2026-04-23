import React from 'react';

interface BigLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function BigLogo({ className, style }: BigLogoProps) {
  const defaultStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    display: 'inline-block',
    ...style,
  };

  return (
    <div className={className} style={defaultStyle}>
      I•F
    </div>
  );
}
