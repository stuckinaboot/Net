import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const SHOW_TITLE = false;

export const metadata: Metadata = {
  title: "WillieNet",
  description: "Decentralized onchain social messaging",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="flex flex-col items-center justify-between p-2">
            {SHOW_TITLE && <h1 className="text-4xl">Willienet</h1>}
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
