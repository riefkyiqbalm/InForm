import type { Metadata } from 'next';
import "@/styles/global.css";
import { fontHead, fontMono, fontBody } from "@/fonts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: 'BG-AI',
  description: 'AI-powered nutrition and vendor analysis platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fontHead.variable} ${fontMono.variable} ${fontBody.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
