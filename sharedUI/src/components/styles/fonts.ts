import { Syne, Space_Mono, DM_Sans } from 'next/font/google';

export const fontHead = Syne({
  variable: '--font-head',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const fontMono = Space_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const fontBody = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Combined class string for use in layout
export const fontClassNames = `${fontHead.variable} ${fontMono.variable} ${fontBody.variable}`;
