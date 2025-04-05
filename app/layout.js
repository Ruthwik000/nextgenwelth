import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
// Import commented out to fix error
// import PageTransition from "@/components/ui/page-transition";
import ChatBot from "@/components/chat/chat-bot";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: "NextGenWelth | AI-Powered Finance Platform",
  description: "Manage your finances with AI intelligence - track, analyze, and optimize your spending with real-time insights.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth dark">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
          <Header />
          <main className="flex-grow">
            {/* Temporarily removing PageTransition to fix errors */}
            {children}
          </main>
          <Toaster richColors position="top-right" />
          <ChatBot />
        </body>
      </html>
    </ClerkProvider>
  );
}
