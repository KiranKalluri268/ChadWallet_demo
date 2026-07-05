"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  ChevronDown,
  Copy,
  ExternalLink,
  Search,
  Star,
  Wallet
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { TradingViewChart } from "@/components/trading-view-chart";
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

type SidebarTab = "Alerts" | "Tokens" | "Leaderboard" | "Feed";
type TokenFilter = "Watchlist" | "Crypto" | "Trending" | "Most held";
type TableTab = "Holders" | "Swaps" | "Thesis";
type RangeTab = "5M" | "1H" | "4H" | "1D";

export function TradingPage({ tokens, token, holders, trades }: { tokens: Token[]; token: Token; holders: Holder[]; trades: Trade[] }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1.5");
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("Tokens");
  const [activeTokenFilter, setActiveTokenFilter] = useState<TokenFilter>("Trending");
  const [activeTableTab, setActiveTableTab] = useState<TableTab>("Holders");
  const [activeRange, setActiveRange] = useState<RangeTab>("1D");
  const [quote, setQuote] = useState<QuoteState>({ value: null, source: "loading", priceImpactPct: null, route: "Jupiter" });
  const [walletState, setWalletState] = useState<WalletState>({ sol: null, token: null, source: "fallback" });
  const pathname = usePathname();
  const { authenticated, login, user } = usePrivy();
  const wallet = (user as { wallet?: { address?: string } } | null | undefined)?.wallet?.address;
  const isSwitching = pendingAddress !== null && pathname !== `/trade/${pendingAddress}`;
  const localEstimate = useMemo(() => estimateQuote(token, Number(amount || 0), side), [amount, side, token]);
  const filteredTokens = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let visible = [...tokens];

    if (activeSidebarTab === "Alerts") {
      visible.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
    } else if (activeSidebarTab === "Leaderboard") {
      visible.sort((a, b) => (b.marketCap || b.volume24h) - (a.marketCap || a.volume24h));
    } else if (activeSidebarTab === "Feed") {
      visible.sort((a, b) => b.volume24h - a.volume24h);
    }

    if (activeTokenFilter === "Watchlist") {
      visible = visible.filter((item) => watchlist.includes(item.address));
    } else if (activeTokenFilter === "Trending") {
      visible.sort((a, b) => b.change24h - a.change24h);
    } else if (activeTokenFilter === "Most held") {
      visible.sort((a, b) => b.holders - a.holders);
    }

    if (!normalized) {
      return visible;
    }

    return visible.filter((item) => [item.symbol, item.name, item.address].some((value) => value.toLowerCase().includes(normalized)));
  }, [activeSidebarTab, activeTokenFilter, query, tokens, watchlist]);
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
    <section className="mx-auto grid w-full max-w-[118rem] min-w-0 gap-0 px-2 pb-4 pt-3 lg:grid-cols-[22rem_minmax(0,1fr)_22rem] lg:px-4">
      <aside className="min-w-0 overflow-hidden border border-white/10 bg-[#090910] lg:sticky lg:top-3 lg:h-[calc(100vh-7.25rem)]">
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <Link href="/" className="flex items-center gap-3 text-3xl font-black text-white/85">
            <Image src="/brand/logo-light.png" alt="ChadWallet" width={38} height={38} className="h-9 w-9 rounded-full bg-white object-contain" />
            chad
          </Link>
          <button className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/35">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 border-b border-white/10 px-4 py-3 text-sm font-black text-white/45">
          {(["Alerts", "Tokens", "Leaderboard", "Feed"] as SidebarTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSidebarTab(tab)}
              className={clsx("rounded-md px-2 py-1 transition", activeSidebarTab === tab ? "bg-white/10 text-white" : "hover:text-white")}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 text-xs font-black text-white/50 no-scrollbar">
          {(["Watchlist", "Crypto", "Trending", "Most held"] as TokenFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveTokenFilter(filter)}
              className={clsx("shrink-0 rounded-md border border-white/8 px-3 py-1 transition", activeTokenFilter === filter ? "bg-white/10 text-white" : "bg-white/[0.03]")}
            >
              {filter}
            </button>
          ))}
        </div>
        <label className="mx-4 mb-2 flex h-10 items-center gap-2 rounded-md border border-white/10 bg-[#05050b] px-3">
          <Search className="h-4 w-4 text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search token"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/35"
          />
        </label>
        <div className="h-[34rem] overflow-y-auto px-3 pb-3 lg:h-[calc(100vh-18.5rem)]">
          {filteredTokens.length ? filteredTokens.map((item) => (
            <Link
              href={`/trade/${item.address}`}
              key={item.address}
              onClick={() => {
                if (item.address !== token.address) {
                  setPendingAddress(item.address);
                }
              }}
              className={clsx(
                "flex min-w-0 items-center justify-between gap-3 rounded-md px-3 py-2.5 transition",
                item.address === token.address ? "bg-white/10" : "hover:bg-white/[0.06]"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <TokenMark token={item} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">{item.symbol}</div>
                  <div className="truncate text-xs text-white/45">{formatUsd(item.price, item.price < 1 ? 6 : 3)}</div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-black text-white">${formatCompact(item.marketCap || item.volume24h)} MC</div>
                <div className={clsx("text-xs font-black", item.change24h >= 0 ? "text-mint" : "text-ember")}>
                  {pendingAddress === item.address && isSwitching ? "Loading" : `${item.change24h >= 0 ? "+" : ""}${item.change24h.toFixed(1)}%`}
                </div>
              </div>
            </Link>
          )) : (
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-white/45">
              No tokens match this view.
            </div>
          )}
        </div>
      </aside>

      <section className="min-w-0 border-y border-white/10 bg-[#05050b] lg:border-y-0">
        <div className="border-b border-white/10 px-3 py-3">
          <label className="mx-auto flex h-12 w-full max-w-2xl items-center gap-3 rounded-lg border border-white/10 bg-[#090910] px-4">
            <Search className="h-4 w-4 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for tokens or traders..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/35"
            />
            <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-white/50">Paste</span>
          </label>
        </div>

        <div className="flex min-w-0 flex-col gap-3 px-3 py-3">
          {isSwitching ? (
            <SummarySkeleton />
          ) : (
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <TokenMark token={token} large />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="min-w-0 truncate text-xl font-black text-white">{token.symbol}</h1>
                    <span className="truncate text-sm text-white/55">{token.name}</span>
                    <button
                      onClick={() => copyAddress(token.address, setCopied)}
                      className="grid h-6 w-6 place-items-center rounded border border-white/10 text-white/45 transition hover:text-white"
                      title="Copy token address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toggleWatchlist(token.address, watchlist, setWatchlist)}
                      className={clsx("grid h-6 w-6 place-items-center rounded border", isWatched ? "border-acid bg-acid text-ink" : "border-white/10 text-white/45")}
                      title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      <Star className="h-3.5 w-3.5" fill={isWatched ? "currentColor" : "none"} />
                    </button>
                    <a
                      href={`https://birdeye.so/token/${token.address}?chain=solana`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-6 w-6 place-items-center rounded border border-white/10 text-white/45 transition hover:text-white"
                      title="Open on BirdEye"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <p className="mt-1 text-xs text-white/35">{copied ? "Address copied" : `${token.address.slice(0, 7)}...${token.address.slice(-7)}`}</p>
                </div>
              </div>
              <div className="flex max-w-full flex-nowrap gap-2 overflow-x-auto no-scrollbar">
                <TopMetric label="Market cap" value={`$${formatCompact(token.marketCap || token.volume24h)}`} />
                <TopMetric label="Price" value={formatUsd(token.price, token.price < 1 ? 6 : 3)} />
                <TopMetric label="24H change" value={`${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(2)}%`} accent={token.change24h >= 0} />
                <TopMetric label="24H Vol." value={`$${formatCompact(token.volume24h)}`} />
                <TopMetric label="Liquidity" value={`$${formatCompact(token.liquidity)}`} />
                <TopMetric label="Holders" value={formatCompact(token.holders)} />
              </div>
            </div>
          )}

          <div className="relative h-[26rem] min-w-0 overflow-hidden border border-white/10 bg-[#030409] lg:h-[32rem]">
            {isSwitching ? <BlockSkeleton /> : <TradingViewChart token={token} trades={trades} />}
          </div>
        </div>

        <div className="mx-3 mb-3 overflow-hidden border border-white/10 bg-[#090910]">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <div className="flex gap-4 text-sm font-black">
              {(["Holders", "Swaps", "Thesis"] as TableTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTableTab(tab)}
                  className={clsx("transition", activeTableTab === tab ? "text-white" : "text-white/35 hover:text-white/70")}
                >
                  {tab}{tab === "Thesis" ? ` (${trades.length * 301})` : ""}
                </button>
              ))}
            </div>
            <div className="hidden gap-4 text-xs font-bold text-white/45 sm:flex">
              <span>Thesis only</span>
              <span>Friends only</span>
            </div>
          </div>
          {isSwitching ? <RowsSkeleton /> : activeTableTab === "Holders" ? (
            <div className="overflow-x-auto">
              <div className="grid min-w-[52rem] grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_1.7fr] border-b border-white/5 px-3 py-2 text-xs font-bold text-white/35">
                <span>Trader</span>
                <span>Position</span>
                <span>PnL</span>
                <span>Avg. entry</span>
                <span>Thesis</span>
              </div>
              {holders.map((holder, index) => {
                const profile = getHolderPresentation(holder, token, index);

                return (
                  <div key={holder.owner} className="grid min-w-[52rem] grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_1.7fr] items-center px-3 py-3 text-sm odd:bg-white/[0.035]">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={clsx("grid h-8 w-8 place-items-center rounded-full text-xs font-black text-white", profile.avatarColor)}>{profile.avatar}</span>
                      <div className="min-w-0">
                        <div className="truncate font-black">{profile.name}</div>
                        <div className="text-xs text-white/45">{profile.holdTime} avg. hold</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-black">{formatUsd(profile.positionValue)}</div>
                      <div className="text-xs text-white/45">{formatCompact(holder.amount)} {token.symbol}</div>
                    </div>
                    <div>
                      <div className={clsx("font-black", profile.pnl >= 0 ? "text-mint" : "text-ember")}>{profile.pnl >= 0 ? "+" : ""}{formatUsd(profile.pnl)}</div>
                      <div className={clsx("text-xs", profile.pnlPct >= 0 ? "text-mint" : "text-ember")}>{profile.pnlPct >= 0 ? "+" : ""}{profile.pnlPct.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="font-black">{formatUsd(profile.avgEntry, profile.avgEntry < 1 ? 6 : 3)}</div>
                      <div className="text-xs text-white/45">{profile.entryLabel}</div>
                    </div>
                    <div className="truncate text-white/85">{profile.note}</div>
                  </div>
                );
              })}
            </div>
          ) : activeTableTab === "Swaps" ? (
            <div className="overflow-x-auto">
              <div className="grid min-w-[42rem] grid-cols-[0.8fr_1.1fr_1fr_1fr] border-b border-white/5 px-3 py-2 text-xs font-bold text-white/35">
                <span>Side</span>
                <span>Trader</span>
                <span>Amount</span>
                <span>Value</span>
              </div>
              {trades.map((trade) => (
                <div key={trade.id} className="grid min-w-[42rem] grid-cols-[0.8fr_1.1fr_1fr_1fr] items-center px-3 py-3 text-sm odd:bg-white/[0.035]">
                  <span className={clsx("w-fit rounded px-2 py-1 text-xs font-black", trade.side === "buy" ? "bg-mint/15 text-mint" : "bg-ember/15 text-ember")}>{trade.side.toUpperCase()}</span>
                  <div>
                    <div className="font-black">{trade.wallet}</div>
                    <div className="text-xs text-white/45">{trade.timestamp}</div>
                  </div>
                  <div className="font-black">{formatCompact(trade.amount)} {token.symbol}</div>
                  <div className="font-black">{formatUsd(trade.valueUsd)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {holders.slice(0, 8).map((holder, index) => {
                const profile = getHolderPresentation(holder, token, index);

                return (
                  <div key={holder.owner} className="grid gap-2 px-3 py-4 text-sm odd:bg-white/[0.035] sm:grid-cols-[12rem_1fr_auto] sm:items-center">
                    <div className="flex items-center gap-3">
                      <span className={clsx("grid h-8 w-8 place-items-center rounded-full text-xs font-black text-white", profile.avatarColor)}>{profile.avatar}</span>
                      <div>
                        <div className="font-black">{profile.name}</div>
                        <div className="text-xs text-white/45">{profile.holdTime} avg. hold</div>
                      </div>
                    </div>
                    <div className="text-white/85">{profile.note}</div>
                    <div className={clsx("font-black", profile.pnlPct >= 0 ? "text-mint" : "text-ember")}>{profile.pnlPct >= 0 ? "+" : ""}{profile.pnlPct.toFixed(2)}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <aside className="min-w-0 border border-white/10 bg-[#090910] p-3 lg:sticky lg:top-3 lg:h-max">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <h2 className="mb-2 text-lg font-black">About {token.symbol}</h2>
          <p className="text-sm leading-5 text-white/62">
            {token.name} is moving across the ChadWallet feed. Review holders, live swaps, and quote previews before taking action.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {(["5M", "1H", "4H", "1D"] as RangeTab[]).map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={clsx("rounded-md border p-2 text-center transition", activeRange === range ? "border-acid/50 bg-acid/10" : "border-white/10 bg-white/[0.04]")}
              >
                <div className="text-xs font-bold text-white/45">{range}</div>
                <div className={clsx("text-[10px] font-black leading-tight sm:text-xs", token.change24h >= 0 ? "text-mint" : "text-ember")}>
                  {formatPercent(getRangeChange(token.change24h, range))}
                </div>
              </button>
            ))}
          </div>
          <SentimentBars trades={trades} />
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-2">
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
          <div className="h-3" />
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

        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
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

function TopMetric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="min-w-[5.15rem] rounded-lg bg-white/[0.06] px-3 py-2 text-center">
      <div className="text-xs font-bold text-white/45">{label}</div>
      <div className={clsx("mt-0.5 text-sm font-black", accent ? "text-mint" : "text-white")}>{value}</div>
    </div>
  );
}

function SentimentBars({ trades }: { trades: Trade[] }) {
  const buys = trades.filter((trade) => trade.side === "buy");
  const sells = trades.filter((trade) => trade.side === "sell");
  const buyVolume = buys.reduce((sum, trade) => sum + trade.valueUsd, 0);
  const sellVolume = sells.reduce((sum, trade) => sum + trade.valueUsd, 0);
  const buyCount = Math.max(buys.length, 1);
  const sellCount = Math.max(sells.length, 1);

  return (
    <div className="mt-4 space-y-3 text-sm font-black">
      <SplitBar left={`${buyCount * 51} buys`} right={`${sellCount * 49} sells`} leftWidth={58} />
      <SplitBar left={`${formatUsd(buyVolume || 514700)} vol.`} right={`${formatUsd(sellVolume || 481200)} vol.`} leftWidth={52} />
      <SplitBar left={`${buyCount * 36} buyers`} right={`${sellCount * 39} sellers`} leftWidth={49} />
    </div>
  );
}

function SplitBar({ left, right, leftWidth }: { left: string; right: string; leftWidth: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
        <span className="bg-mint" style={{ width: `${leftWidth}%` }} />
        <span className="flex-1 bg-ember" />
      </div>
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
      <span className="mt-2 flex min-w-0 items-center gap-3">
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          inputMode="decimal"
          className={clsx("min-w-0 flex-1 bg-transparent text-2xl font-black outline-none", loading && "animate-pulse text-white/35")}
        />
        <span className="inline-flex max-w-[7rem] shrink-0 items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-black">
          <span className="truncate">{symbol}</span>
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

function getHolderPresentation(holder: Holder, token: Token, index: number) {
  const seed = hashString(`${holder.owner}-${token.address}`);
  const names = ["chainmaxi", "solhuntr", "mooncurator", "greenledger", "vaultpilot", "tape_reader", "degenintel", "liquiditydad", "trendwarden", "entrysniper"];
  const colors = ["bg-sky-500", "bg-emerald-500", "bg-fuchsia-500", "bg-amber-500", "bg-indigo-500", "bg-rose-500", "bg-cyan-500", "bg-lime-500"];
  const notes = [
    `watching ${token.symbol} while volume builds`,
    `rotated into ${token.symbol} before the crowd`,
    "holding as long as buyers keep stepping in",
    "took profit, still keeping a runner",
    "tracking holder growth before adding"
  ];
  const fallbackValue = holder.amount * token.price;
  const positionValue = holder.valueUsd > 0 ? holder.valueUsd : fallbackValue;
  const changeBias = token.change24h / 100;
  const personalBias = ((seed % 71) - 24) / 100;
  const pnlPct = Math.max(-88, Math.min(420, (changeBias + personalBias) * 100));
  const pnl = positionValue * (pnlPct / 100);
  const avgEntry = token.price > 0 ? token.price / (1 + pnlPct / 100) : 0;
  const handle = names[seed % names.length];
  const suffix = String((seed + index * 17) % 1000).padStart(3, "0");

  return {
    name: `${handle}${suffix}`,
    avatar: handle.slice(0, 2).toUpperCase(),
    avatarColor: colors[seed % colors.length],
    holdTime: `${(seed % 21) + 1}h`,
    positionValue,
    pnl,
    pnlPct,
    avgEntry: Number.isFinite(avgEntry) && avgEntry > 0 ? avgEntry : token.price,
    entryLabel: pnlPct >= 0 ? "below spot" : "above spot",
    note: notes[(seed + index) % notes.length]
  };
}

function hashString(value: string) {
  return Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function getRangeChange(change24h: number, range: RangeTab) {
  const scale = {
    "5M": 0.08,
    "1H": 0.22,
    "4H": 0.55,
    "1D": 1
  }[range];

  return change24h * scale;
}

function formatPercent(value: number) {
  const sign = value >= 0 ? "+" : "";

  if (Math.abs(value) >= 1000) {
    return `${sign}${(value / 1000).toFixed(1)}K%`;
  }

  if (Math.abs(value) >= 100) {
    return `${sign}${value.toFixed(1)}%`;
  }

  return `${sign}${value.toFixed(2)}%`;
}

function estimateQuote(token: Token, amount: number, side: "buy" | "sell") {
  if (!Number.isFinite(amount) || amount <= 0 || token.price <= 0) {
    return 0;
  }

  const solUsd = 145;
  return side === "buy" ? (amount * solUsd) / token.price : (amount * token.price) / solUsd;
}
