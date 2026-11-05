import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Fit Tracker — gym, swim, body & food log",
  description: "Private fitness and swimming tracker. Data stays in your browser.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const themeScript = `try{var t=JSON.parse(localStorage.getItem('fitness-tracker:v1')||'{}').settings?.theme||'system';
if(t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <StoreProvider>
          <Nav />
          <main className="mx-auto max-w-3xl space-y-4 px-4 pb-28 pt-4 md:pb-8">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
