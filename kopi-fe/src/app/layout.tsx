import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";
import { ConversationProvider } from "./providers/conversation-provider";
import { Toaster } from "@/components/ui/sonner";

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
            <Toaster position="top-right" />
          </ConversationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
