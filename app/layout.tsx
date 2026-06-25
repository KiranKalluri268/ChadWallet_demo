import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyShell } from "@/components/privy-shell";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "ChadWallet | Solana Meme Coin Trading",
  description: "A social-first Solana meme coin trading demo for ChadWallet."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyShell>{children}</PrivyShell>
      </body>
    </html>
  );
}
