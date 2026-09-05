import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptWar — AI Capstone Mentor",
  description:
    "Your AI-powered mentor for final-year engineering capstone projects. From idea generation to viva defense — guided every step.",
  keywords: ["capstone project", "AI mentor", "engineering final year", "project ideas", "viva prep"],
  openGraph: {
    title: "PromptWar — AI Capstone Mentor",
    description: "From idea selection to viva defense — your AI mentor for final-year projects.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
