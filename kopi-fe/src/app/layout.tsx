import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { ConversationProvider } from "./providers/conversation-provider";

export const metadata: Metadata = {
  title: "Kopi Debate",
  description: "AI-powered debate platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system">
          <ConversationProvider>
            {children}
          </ConversationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
