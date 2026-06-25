import Link from "next/link";
import type { Token } from "@/lib/types";
import { clsx, formatCompact, formatUsd } from "@/lib/format";

export function TokenBanner({ tokens, reverse = false }: { tokens: Token[]; reverse?: boolean }) {
  const items = [...tokens, ...tokens];

  return (
    <div className="ticker-shell overflow-hidden border-y border-white/10 bg-ink/90 py-3">
      <div className={clsx("flex w-max gap-3", reverse ? "ticker-track-reverse" : "ticker-track")}>
        {items.map((token, index) => (
          <Link
            key={`${token.address}-${index}`}
            href={`/trade/${token.address}`}
            className="group flex min-w-64 items-center justify-between gap-5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition hover:border-acid/60 hover:bg-acid/10"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-acid text-xs font-black text-ink">
                {token.symbol.slice(0, 2)}
              </span>
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
  );
}
