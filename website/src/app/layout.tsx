import type { Metadata } from "next";
import { Inter, Courier_Prime } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

const USE_COURIER = true;

const fontCourier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});
const fontInter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const font = USE_COURIER ? fontCourier : fontInter;

const SHOW_TITLE = false;

export const metadata: Metadata = {
  title: "Net",
  description: "Decentralized onchain social messaging protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Providers>
          <main className="flex flex-col items-center justify-between p-2 h-screen dark">
            {SHOW_TITLE && <h1 className="text-4xl">Willienet</h1>}
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
