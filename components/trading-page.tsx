"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowDownUp,
  BadgeDollarSign,
  CandlestickChart,
  ChevronDown,
  Copy,
  ExternalLink,
  Radio,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Wallet
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import type { Holder, Token, Trade } from "@/lib/types";
import { clsx, formatCompact, formatUsd } from "@/lib/format";
import { SOL_MINT } from "@/lib/demo-data";

type QuoteState = {
  value: number | null;
  source: "jupiter" | "fallback" | "loading";
  priceImpactPct: number | null;
  route: string;
};

type WalletState = {
  sol: number | null;
  token: number | null;
  source: "alchemy" | "fallback" | "loading";
};

export function TradingPage({ tokens, token, holders, trades }: { tokens: Token[]; token: Token; holders: Holder[]; trades: Trade[] }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1.5");
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [quote, setQuote] = useState<QuoteState>({ value: null, source: "loading", priceImpactPct: null, route: "Jupiter" });
  const [walletState, setWalletState] = useState<WalletState>({ sol: null, token: null, source: "fallback" });
  const pathname = usePathname();
  const { authenticated, login, user } = usePrivy();
  const wallet = (user as { wallet?: { address?: string } } | null | undefined)?.wallet?.address;
  const isSwitching = pendingAddress !== null && pathname !== `/trade/${pendingAddress}`;
  const localEstimate = useMemo(() => estimateQuote(token, Number(amount || 0), side), [amount, side, token]);
  const filteredTokens = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return tokens;
    }

    return tokens.filter((item) => [item.symbol, item.name, item.address].some((value) => value.toLowerCase().includes(normalized)));
  }, [query, tokens]);
  const isWatched = watchlist.includes(token.address);

  useEffect(() => {
    setPendingAddress(null);
  }, [token.address]);

  useEffect(() => {
    const saved = window.localStorage.getItem("chadwallet-watchlist");
    if (saved) {
      setWatchlist(JSON.parse(saved) as string[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("chadwallet-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const numericAmount = Number(amount || 0);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setQuote({ value: 0, source: "fallback", priceImpactPct: null, route: "Local estimate" });
      return;
    }

    const controller = new AbortController();
    setQuote((current) => ({ ...current, source: "loading" }));

    const inputMint = side === "buy" ? SOL_MINT : token.address;
    const outputMint = side === "buy" ? token.address : SOL_MINT;
    const inputDecimals = side === "buy" ? 9 : token.decimals;
    const outputDecimals = side === "buy" ? token.decimals : 9;
    const quoteAmount = Math.round(numericAmount * 10 ** inputDecimals);

    fetch(`/api/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${quoteAmount}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        const outAmount = Number(payload?.quote?.outAmount);
        const value = Number.isFinite(outAmount) && outAmount > 0 ? outAmount / 10 ** outputDecimals : localEstimate;
        const priceImpactPct = payload?.quote?.priceImpactPct != null ? Number(payload.quote.priceImpactPct) * 100 : null;
        const route = payload?.source === "jupiter" ? "Jupiter quote" : "Local estimate";

        setQuote({ value, source: payload?.source === "jupiter" ? "jupiter" : "fallback", priceImpactPct, route });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setQuote({ value: localEstimate, source: "fallback", priceImpactPct: null, route: "Local estimate" });
        }
      });

    return () => controller.abort();
  }, [amount, localEstimate, side, token.address, token.decimals]);

  useEffect(() => {
    if (!authenticated || !wallet) {
      setWalletState({ sol: null, token: null, source: "fallback" });
      return;
    }

    const controller = new AbortController();
    setWalletState((current) => ({ ...current, source: "loading" }));

    fetch(`/api/wallet?wallet=${wallet}&token=${token.address}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        setWalletState({
          sol: typeof payload?.sol === "number" ? payload.sol : null,
          token: typeof payload?.token?.amount === "number" ? payload.token.amount : null,
          source: payload?.source === "alchemy" ? "alchemy" : "fallback"
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setWalletState({ sol: null, token: null, source: "fallback" });
        }
      });

    return () => controller.abort();
  }, [authenticated, token.address, wallet]);

  return (
    <section className="mx-auto grid max-w-[96rem] gap-4 px-4 pb-28 pt-5 lg:grid-cols-[18rem_minmax(0,1fr)_22rem]">
      <aside className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-4 lg:sticky lg:top-20" style={{ maxHeight: "calc(100vh - 16rem)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/55">Trending</h2>
          <Radio className="h-4 w-4 text-acid" />
        </div>
        <label className="mb-3 flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-ink/60 px-3">
          <Search className="h-4 w-4 text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search token"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/35"
          />
        </label>
        <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1 lg:max-h-none" style={{ maxHeight: "calc(100vh - 23rem)" }}>
          {filteredTokens.map((item) => (
            <Link
              href={`/trade/${item.address}`}
              key={item.address}
              onClick={() => {
                if (item.address !== token.address) {
                  setPendingAddress(item.address);
                }
              }}
              className={clsx(
                "flex items-center justify-between rounded-lg border p-3 transition",
                item.address === token.address ? "border-acid/50 bg-acid/10" : "border-white/8 bg-ink/40 hover:border-white/20"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <TokenMark token={item} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">{item.symbol}</div>
                  <div className="truncate text-xs text-white/45">{item.name}</div>
                </div>
              </div>
              <div className={clsx("text-right text-xs font-black", item.change24h >= 0 ? "text-mint" : "text-ember")}>
                {pendingAddress === item.address && isSwitching ? "Loading" : `${item.change24h >= 0 ? "+" : ""}${item.change24h.toFixed(1)}%`}
              </div>
            </Link>
          ))}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          {isSwitching ? (
            <SummarySkeleton />
          ) : (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <TokenMark token={token} large />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-black">${token.symbol}</h1>
                    <span className="rounded-full bg-acid/15 px-2 py-1 text-xs font-black text-acid">SOLANA</span>
                    <button
                      onClick={() => toggleWatchlist(token.address, watchlist, setWatchlist)}
                      className={clsx("grid h-8 w-8 place-items-center rounded-full border", isWatched ? "border-acid bg-acid text-ink" : "border-white/10 text-white/50")}
                      title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      <Star className="h-4 w-4" fill={isWatched ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => copyAddress(token.address, setCopied)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/50 transition hover:text-white"
                      title="Copy token address"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={`https://birdeye.so/token/${token.address}?chain=solana`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/50 transition hover:text-white"
                      title="Open on BirdEye"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="mt-1 text-white/50">{token.name}</p>
                  <p className="mt-1 text-xs text-white/35">{copied ? "Address copied" : `${token.address.slice(0, 8)}...${token.address.slice(-8)}`}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Price" value={formatUsd(token.price, token.price < 1 ? 6 : 2)} />
                <Metric label="24h" value={`${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(1)}%`} accent={token.change24h >= 0} />
                <Metric label="Volume" value={`$${formatCompact(token.volume24h)}`} />
                <Metric label="Holders" value={formatCompact(token.holders)} />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Price chart</h2>
              <p className="text-sm text-white/45">TradingView-ready chart surface with live token context.</p>
            </div>
            <CandlestickChart className="h-5 w-5 text-acid" />
          </div>
          <div className="relative h-[22rem] overflow-hidden rounded-lg border border-white/10 bg-ink">
            {isSwitching ? <BlockSkeleton /> : <ChartSvg positive={token.change24h >= 0} />}
            {!isSwitching ? (
              <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/55">
                {token.symbol}/USD
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Top holders" icon={<ShieldCheck className="h-5 w-5 text-acid" />}>
            {isSwitching ? <RowsSkeleton /> : <div className="space-y-3">
              {holders.map((holder) => (
                <div key={holder.owner} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg bg-ink/55 p-3">
                  <div>
                    <div className="font-bold">{holder.owner}</div>
                    <div className="text-xs text-white/45">{formatCompact(holder.amount)} tokens</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black">{formatUsd(holder.valueUsd)}</div>
                    <div className="text-xs text-white/45">{holder.share.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>}
          </Panel>

          <Panel title="Live trades" icon={<TrendingUp className="h-5 w-5 text-acid" />}>
            {isSwitching ? <RowsSkeleton /> : <div className="space-y-3">
              {trades.map((trade) => (
                <div key={trade.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-ink/55 p-3">
                  <span className={clsx("rounded-full px-2 py-1 text-xs font-black", trade.side === "buy" ? "bg-mint/15 text-mint" : "bg-ember/15 text-ember")}>
                    {trade.side.toUpperCase()}
                  </span>
                  <div>
                    <div className="font-bold">{trade.wallet}</div>
                    <div className="text-xs text-white/45">{trade.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black">{formatUsd(trade.valueUsd)}</div>
                    <div className="text-xs text-white/45">{formatCompact(trade.amount)}</div>
                  </div>
                </div>
              ))}
            </div>}
          </Panel>
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:h-max">
        <div className="rounded-lg border border-acid/20 bg-white/[0.05] p-4">
          <div className="mb-4 grid grid-cols-2 rounded-lg bg-ink p-1">
            {(["buy", "sell"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSide(mode)}
                className={clsx("h-10 rounded-md text-sm font-black capitalize transition", side === mode ? "bg-acid text-ink" : "text-white/55 hover:text-white")}
              >
                {mode}
              </button>
            ))}
          </div>

          <TradeInput label={side === "buy" ? "You pay" : "You sell"} value={amount} onChange={setAmount} symbol={side === "buy" ? "SOL" : token.symbol} />
          <div className="my-3 grid place-items-center">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-ink">
              <ArrowDownUp className="h-4 w-4 text-acid" />
            </span>
          </div>
          <TradeInput
            label={quote.source === "loading" ? "Fetching quote" : "Estimated receive"}
            value={(quote.value ?? localEstimate).toLocaleString("en-US", { maximumFractionDigits: 4 })}
            symbol={side === "buy" ? token.symbol : "SOL"}
            readOnly
            loading={quote.source === "loading" || isSwitching}
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Source" value={quote.source === "jupiter" ? "Jupiter" : quote.source === "loading" ? "Loading" : "Estimate"} />
            <Metric label="Impact" value={quote.priceImpactPct == null ? "Preview" : `${quote.priceImpactPct.toFixed(2)}%`} />
          </div>

          <button
            onClick={() => {
              if (!authenticated) login();
            }}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-acid text-sm font-black text-ink transition hover:bg-mint"
          >
            <BadgeDollarSign className="h-4 w-4" />
            {authenticated ? "Preview only" : "Sign in to preview"}
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-white/42">
            Preview mode: no transactions are signed or submitted. Quotes can use Jupiter, but execution is disabled.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-acid" />
            <h2 className="font-black">Your position</h2>
          </div>
          {authenticated ? (
            <div className="space-y-3">
              <Metric label="Wallet" value={wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : "Connected"} />
              <Metric label="SOL balance" value={walletState.source === "loading" ? "Loading" : walletState.sol == null ? "Not available" : walletState.sol.toFixed(4)} />
              <Metric
                label={`${token.symbol} balance`}
                value={walletState.source === "loading" || isSwitching ? "Loading" : walletState.token == null ? "0.00" : formatCompact(walletState.token)}
              />
              <Metric
                label="Position value"
                value={
                  walletState.source === "loading" || isSwitching || walletState.token == null
                    ? "Preview"
                    : formatUsd(walletState.token * token.price)
                }
              />
            </div>
          ) : (
            <button onClick={login} className="w-full rounded-lg border border-white/10 bg-ink/60 p-4 text-left transition hover:border-acid/50">
              <div className="font-black">Connect with Privy</div>
              <div className="mt-1 text-sm text-white/50">Apple, Google, and embedded wallet onboarding.</div>
            </button>
          )}
        </div>
      </aside>
    </section>
  );
}

function TokenMark({ token, large = false }: { token: Token; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const size = large ? "h-14 w-14" : "h-10 w-10";

  if (token.image && !failed) {
    return (
      // Remote token logos can be short-lived; use a plain img so a bad upstream URL does not spam Next image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={token.image}
        alt={token.symbol}
        width={large ? 56 : 40}
        height={large ? 56 : 40}
        onError={() => setFailed(true)}
        className={clsx(size, "rounded-full object-cover")}
      />
    );
  }

  return <span className={clsx(size, "grid shrink-0 place-items-center rounded-full bg-acid text-sm font-black text-ink")}>{token.symbol.slice(0, 2)}</span>;
}

function SummarySkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="h-16 animate-pulse rounded-lg bg-white/10" />
        <div className="h-16 animate-pulse rounded-lg bg-white/10" />
        <div className="h-16 animate-pulse rounded-lg bg-white/10" />
        <div className="h-16 animate-pulse rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

function BlockSkeleton() {
  return <div className="h-full w-full animate-pulse bg-white/10" />;
}

function RowsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg bg-ink/55" />
      ))}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink/50 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">{label}</div>
      <div className={clsx("mt-1 text-sm font-black sm:text-base", accent ? "text-mint" : "text-white")}>{value}</div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">{title}</h2>
        {icon}
      </div>
      {children}
    </div>
  );
}

function TradeInput({
  label,
  value,
  symbol,
  readOnly,
  loading,
  onChange
}: {
  label: string;
  value: string;
  symbol: string;
  readOnly?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="block rounded-lg border border-white/10 bg-ink/70 p-4">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">{label}</span>
      <span className="mt-2 flex items-center gap-3">
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          inputMode="decimal"
          className={clsx("min-w-0 flex-1 bg-transparent text-2xl font-black outline-none", loading && "animate-pulse text-white/35")}
        />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-black">
          {symbol}
          <ChevronDown className="h-4 w-4 text-white/45" />
        </span>
      </span>
    </label>
  );
}

function toggleWatchlist(address: string, watchlist: string[], setWatchlist: (value: string[]) => void) {
  setWatchlist(watchlist.includes(address) ? watchlist.filter((item) => item !== address) : [...watchlist, address]);
}

function copyAddress(address: string, setCopied: (value: boolean) => void) {
  navigator.clipboard?.writeText(address);
  setCopied(true);
  window.setTimeout(() => setCopied(false), 1600);
}

function ChartSvg({ positive }: { positive: boolean }) {
  const stroke = positive ? "#68F7B3" : "#FF7A3D";

  return (
    <svg viewBox="0 0 900 360" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="Token price chart">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.36" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 8 }).map((_, index) => (
        <line key={`h-${index}`} x1="0" x2="900" y1={index * 52} y2={index * 52} stroke="rgba(255,255,255,0.06)" />
      ))}
      {Array.from({ length: 10 }).map((_, index) => (
        <line key={`v-${index}`} x1={index * 100} x2={index * 100} y1="0" y2="360" stroke="rgba(255,255,255,0.05)" />
      ))}
      <path d="M0 285 C90 245 110 292 190 230 C270 170 310 205 390 150 C480 86 520 118 610 78 C715 30 770 82 900 42 L900 360 L0 360 Z" fill="url(#chartFill)" />
      <path d="M0 285 C90 245 110 292 190 230 C270 170 310 205 390 150 C480 86 520 118 610 78 C715 30 770 82 900 42" fill="none" stroke={stroke} strokeWidth="5" />
    </svg>
  );
}

function estimateQuote(token: Token, amount: number, side: "buy" | "sell") {
  if (!Number.isFinite(amount) || amount <= 0 || token.price <= 0) {
    return 0;
  }

  const solUsd = 145;
  return side === "buy" ? (amount * solUsd) / token.price : (amount * token.price) / solUsd;
}
