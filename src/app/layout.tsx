import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ThemeColorSync } from "@/components/layout/theme-color-sync";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fortuna",
  description: "Your personal finance tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-*) to report anything but 0, which the
  // bottom nav's pb-safe depends on.
  viewportFit: "cover",
  // Colours the system bars so they continue the app rather than framing it.
  // These two are the pre-hydration values and must track --background in
  // globals.css; ThemeColorSync takes over once the theme resolves, including
  // the case where the in-app theme disagrees with the OS.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ThemeColorSync />
          {children}
          {/* Top-center rather than the usual bottom-right: on mobile the bottom
              nav is fixed over that corner and would sit under the toast. */}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}