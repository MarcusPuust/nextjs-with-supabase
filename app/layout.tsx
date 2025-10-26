import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "./globals.css";
import { ThemeAndMantineProvider } from "./ThemeAndMantineProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

// kas Vercel URL või localhost
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js + Mantine + Supabase Starter",
  description: "Modern App Router setup with Mantine UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="et" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        {/* Mantine soovitab ColorSchemeScript panna <head> sisse */}
        <ColorSchemeScript />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        {/* Client wrapper (dark mode + MantineProvider) */}
        <ThemeAndMantineProvider>{children}</ThemeAndMantineProvider>
      </body>
    </html>
  );
}
