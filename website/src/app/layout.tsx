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
    <html lang="id" suppressHydrationWarning className={`${fontHead.variable} ${fontMono.variable} ${fontBody.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('inform-theme');var t=s==='light'||s==='dark'?s:window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';var r=document.documentElement;r.setAttribute('data-theme',t);if(t==='light'){var v={'--bg':'#f0f4f8','--panel':'#e4ecf4','--card':'#ffffff','--border':'#c5d5e8','--teal':'#009b92','--teal-dim':'#00756d','--gold':'#c49a00','--red':'#d63057','--text':'#0d1b2a','--muted':'#4a6580','--glow':'0 0 40px rgba(0,155,146,.12)'};for(var k in v)r.style.setProperty(k,v[k]);}}catch(e){}})();` }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
