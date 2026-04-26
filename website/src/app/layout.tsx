import type { Metadata } from 'next';
import "@/styles/global.css";
import { fontHead, fontMono, fontBody } from "@/fonts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: 'InForm',
  description: 'InForm is an AI agent that lives inside your browser as an extension,in your desktop as app and in your browser as a web. Open any website with a form — an ERP, an HR portal, a financial dashboard — and InForm instantly scans the page, maps every field, and fills everything in using context from your profile, uploaded documents, and submission history. Before you hit submit, it runs a fraud analysis pass and flags anything unusual.',
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
