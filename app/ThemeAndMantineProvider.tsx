"use client";

import { ThemeProvider } from "next-themes";
import { MantineProvider } from "@mantine/core";

export function ThemeAndMantineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MantineProvider defaultColorScheme="auto">{children}</MantineProvider>
    </ThemeProvider>
  );
}
