import type { Metadata } from "next";
import { fontVars } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Readrise — read together, grow together",
  description:
    "The anti-feed. A private reading circle for close friends: read together, argue in the margins, commit to one thing, and check on each other. Want to learn and grow? Use this. Want to waste your life? Go somewhere else.",
};

/**
 * Runs BEFORE first paint: reads the stored theme/vibe and stamps them on
 * <html>, so the page never flashes the wrong theme. System preference is the
 * fallback when nothing is stored. suppressHydrationWarning on <html> is
 * required because the server can't know these attributes.
 */
const themeInit = `(function(){try{
var t=localStorage.getItem("pdx-theme");
if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
var v=localStorage.getItem("pdx-vibe");
if(["ember","tide","bloom","meadow"].indexOf(v)<0){v="ember";}
var d=document.documentElement;
d.dataset.theme=t;d.dataset.vibe=v;
}catch(e){}})();`;

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
