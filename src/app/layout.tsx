import "@/styles/globals.css";
import { inter, mulish, playfair } from "@/lib/fonts";
import NextAuthProvider from "@/components/NextAuthProvider";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "Personalized Content Dashboard",
  description: "A customized dashboard experience",
};

/**
 * Root layout — bare HTML shell only.
 * 
 * Each route group provides its own contextual layout:
 *   auth/layout.tsx              → Clean standalone pages with Sonner toaster
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
        <NextAuthProvider>
          <ThemeProvider defaultTheme="light" attribute="class" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
