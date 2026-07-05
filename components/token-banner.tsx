"use client";

import Link from "next/link";
import { useState } from "react";
import type { Token } from "@/lib/types";
import { clsx, formatCompact, formatUsd } from "@/lib/format";

export function TokenBanner({ tokens, reverse = false, subtle = false, withHeaderGutters = false }: { tokens: Token[]; reverse?: boolean; subtle?: boolean; withHeaderGutters?: boolean }) {
  const items = [...tokens, ...tokens];

  return (
    <div
      className={clsx(
        "ticker-shell relative border-y py-3",
        subtle ? "border-white/5 bg-white/[0.015] backdrop-blur-[2px]" : "border-white/10 bg-ink/90",
        withHeaderGutters && "mx-auto mt-3 max-w-[calc(100%-2rem)] overflow-hidden rounded-full border sm:max-w-[calc(100%-3rem)]"
      )}
    >
      {withHeaderGutters ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-4 bg-[#11134a]/55 backdrop-blur-[2px] sm:w-24 md:w-6 lg:w-8" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-4 bg-[#11134a]/55 backdrop-blur-[2px] sm:w-24 md:w-56 lg:w-8" />
        </>
      ) : null}
      <div className="overflow-hidden">
        <div className={clsx("flex w-max gap-3", reverse ? "ticker-track-reverse" : "ticker-track")}>
        {items.map((token, index) => (
          <Link
            key={`${token.address}-${index}`}
            href={`/trade/${token.address}`}
            className={clsx(
              "group flex min-w-64 items-center justify-between gap-5 rounded-full border px-4 py-2 transition",
              subtle
                ? "border-white/10 bg-white/[0.045] hover:border-acid/50 hover:bg-white/[0.08]"
                : "border-white/10 bg-white/[0.055] hover:border-acid/60 hover:bg-acid/10"
            )}
          >
            <span className="flex items-center gap-3">
              <BannerTokenMark token={token} />
              <span>
                <span className="block text-sm font-black">{token.symbol}</span>
                <span className="block text-xs text-white/50">{formatUsd(token.price, token.price < 1 ? 6 : 2)}</span>
              </span>
            </span>
            <span className={clsx("text-sm font-black", token.change24h >= 0 ? "text-mint" : "text-ember")}>
              {token.change24h >= 0 ? "+" : ""}
              {token.change24h.toFixed(1)}%
            </span>
            <span className="text-xs text-white/45">Vol {formatCompact(token.volume24h)}</span>
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}

function BannerTokenMark({ token }: { token: Token }) {
  const [failed, setFailed] = useState(false);

  if (token.image && !failed) {
    return (
      // Remote token logos can expire or 404; fall back to initials if that happens.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={token.image}
        alt={token.symbol}
        width={36}
        height={36}
        onError={() => setFailed(true)}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-acid text-xs font-black text-ink">
      {token.symbol.slice(0, 2)}
    </span>
  );
}
