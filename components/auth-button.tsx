"use client";

import { LogIn, LogOut, Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

export function AuthButton({ compact = false }: { compact?: boolean }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const wallet = (user as { wallet?: { address?: string } } | null | undefined)?.wallet?.address;

  if (!ready) {
    return (
      <button
        onClick={login}
        className="inline-flex h-[52px] items-center gap-2 rounded-full bg-acid px-6 text-sm font-black text-ink transition hover:bg-mint"
      >
        <LogIn className="h-4 w-4" />
        {compact ? "Login" : "Sign in"}
      </button>
    );
  }

  if (authenticated) {
    return (
      <button
        onClick={logout}
        className="inline-flex h-[52px] items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink transition hover:bg-acid"
      >
        <Wallet className="h-4 w-4" />
        {compact ? "Wallet" : wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : "Connected"}
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="inline-flex h-[52px] items-center gap-2 rounded-full bg-acid px-6 text-sm font-black text-ink transition hover:bg-mint"
    >
      <LogIn className="h-4 w-4" />
      {compact ? "Login" : "Sign in"}
    </button>
  );
}
