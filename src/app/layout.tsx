import "@/styles/globals.css";
import { defaultMetadata } from "@/lib/metadata";
import { inter, mulish, playfair } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = defaultMetadata;

/**
 * Root layout — bare HTML shell only.
 * 
 * Each route group provides its own contextual layout:
 *   (public)/layout.tsx  → Navbar + Footer + AppProviders (smooth scroll, etc.)
 *   auth/layout.tsx      → Clean standalone pages with Sonner toaster
 *   admin/(dashboard)/layout.tsx → Sidebar + Header + admin providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} ${mulish.variable} ${playfair.variable} ${inter.className} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
